/**
 * Shared owner-message handler. Polling (`scripts/start-bot.ts`) and the
 * dormant webhook route both call this so triage + DB update behaviour
 * stays identical between dev and prod.
 *
 * Flow:
 *   1. Resolve a followup row via `telegram_chat_id`.
 *   2. Run triage through `callGLM` (mock today, real after Phase 5-real).
 *   3. Persist decision + differentials onto the followup row (best-effort).
 *   4. Return the owner reply draft the caller should send back.
 */

import { callGLM } from "./glm";
import { hasSupabaseAdmin } from "./env";
import { getSupabaseServer } from "./supabase";
import type { TriageFixtureOutput } from "./glm-fixtures";
import type { FollowUpLevel } from "./types";

export interface HandleOwnerMessageResult {
  reply: string;
  decision: FollowUpLevel | "unlinked";
  followupId?: string;
  confidence?: number;
}

const UNLINKED_REPLY = (chatId: string) =>
  `Hi — your chat (id ${chatId}) isn't linked to an active case yet. Share this id with PawsClinic KL reception and we'll pair it to your pet's follow-up. — PawsClinic KL`;

export async function handleOwnerMessage(
  chatId: string,
  text: string,
): Promise<HandleOwnerMessageResult> {
  let followupId: string | undefined;

  if (hasSupabaseAdmin()) {
    try {
      const db = getSupabaseServer();
      const { data } = await db
        .from("followups")
        .select("id")
        .eq("telegram_chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string }>();
      followupId = data?.id;
    } catch (err) {
      console.warn("[telegram-handler] followup lookup failed", err);
    }
  }

  if (!followupId) {
    return { reply: UNLINKED_REPLY(chatId), decision: "unlinked" };
  }

  const result = await callGLM<TriageFixtureOutput>({
    feature: "triage",
    user: text,
  });

  if (hasSupabaseAdmin()) {
    try {
      const db = getSupabaseServer();
      await db
        .from("followups")
        .update({
          status: result.data.decision,
          owner_message: text,
          glm_decision: result.data.decision,
          confidence: result.data.confidence,
          differentials: result.data.differentials,
          recommended_action: result.data.recommendedAction,
          draft_response: result.data.ownerReplyDraft,
        })
        .eq("id", followupId);
    } catch (err) {
      console.warn("[telegram-handler] followup update failed", err);
    }
  }

  return {
    reply: result.data.ownerReplyDraft,
    decision: result.data.decision,
    followupId,
    confidence: result.data.confidence,
  };
}
