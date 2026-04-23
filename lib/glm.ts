/**
 * GLM client — mock implementation.
 *
 * Signature is the one the real Z.AI wrapper will ship with. Routes call
 * `callGLM({feature, user, ...})` and get back a `CallGLMResult<T>`. When
 * the Phase 5-real swap happens, this module's body is replaced with a
 * fetch to Z.AI — callers need no change.
 *
 * Prompts (lib/prompts.ts) are imported here today even though the mock
 * doesn't use them at runtime, so bundling + lint already know about them.
 * That keeps the swap to one file.
 */

import {
  BRIEF_PROMPT,
  CONSULT_EXTRACTION_PROMPT,
  TRIAGE_PROMPT,
} from "./prompts";

import { ENV } from "./env"

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// import { briefFixture, consultFixture, triageFixture } from "./glm-fixtures";

export type GLMFeature = "brief" | "consult" | "triage";

export interface CallGLMParams {
  feature: GLMFeature;
  system?: string;
  user: string;
  json?: boolean;
  context?: Record<string, unknown>;
  tools? : any[];
}

export interface CallGLMResult<T = unknown> {
  data: T;
  raw: string;
  model: string;
  latencyMs: number;
  source: "mock" | "glm";
  toolCalls?: any[];
}

const PROMPTS: Record<GLMFeature, string> = {
  brief: BRIEF_PROMPT,
  consult: CONSULT_EXTRACTION_PROMPT,
  triage: TRIAGE_PROMPT,
};

let client : ChatOpenAI | null = null;

function getClient(){
  if (!client) {
    client = new ChatOpenAI({
      apiKey: ENV.zai.apiKey,
      model: ENV.zai.model,
      configuration: {
        baseURL: ENV.zai.baseUrl,
      },
      temperature: 0.3,
    })
  }

  console.log("Client Base URL", ENV.zai.baseUrl);
  console.log("Client Model", ENV.zai.model);
  return client;
} 

export async function callGLM<T=unknown>(params: CallGLMParams): Promise<CallGLMResult<T>>{

  const client = getClient();
  const startTime = Date.now();

  let systemPrompt = params.system ?? PROMPTS[params.feature];

  if (params.context?.corrections && Array.isArray(params.context.corrections)) {
    const correctionsText = params.context.corrections
      .map((c: any) => `User: ${c.user}\nCorrection: ${c.correction}`)
      .join("\n\n");
    systemPrompt += `\n\nExisting doctor corrections (follow these patterns):\n${correctionsText}`;
  }

  let fullContent = "";
  let toolCalls: any[] | undefined;
  
  const response = await client.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(params.user),
  ], {
    response_format: (params.json !== false && !params.tools) ? { type: "json_object" } : undefined,
    tools: params.tools,
  });

  fullContent = response.content as string;
  const calls = (response.additional_kwargs as any).tool_calls;
  if (calls && calls.length > 0) {
    toolCalls = calls;
  }
  
  const latencyMs = Date.now() - startTime;
  let data: T;
  try {
    const sanitized = fullContent.replace(/```json|```/g, "").trim();
    
    if (toolCalls && toolCalls.length > 0) {
      const tc = toolCalls[0];
      const args = JSON.parse(tc.function.arguments || "{}");
      data = {
        kind: "tool_call",
        tool: tc.function.name,
        args,
        reasoning: args.reasoning || "AI requested more information.",
        ownerPrompt: args.ownerPrompt || "The assistant needs more information to proceed.",
      } as any;
    } else {
      data = params.json !== false ? JSON.parse(sanitized || "{}") : (fullContent as any);
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("[glm] RAW CONTENT WAS:", fullContent);
    throw new Error(`GLM returned invalid format: ${errorMsg}`);
  }

  return {
    data,
    raw: fullContent,
    model: ENV.zai.model,
    latencyMs,
    source: "glm",
    toolCalls,
  };
}