"use client";

/**
 * Live agent execution dashboard. Subscribes to /api/consult/capture/stream
 * over SSE and animates the pipeline as it runs. Self-contained — all the
 * panels (architecture diagram, timeline, Tavily feed, cost panel, output
 * preview) live in this file. Split into separate components if it grows
 * past ~700 lines.
 */

import { useMemo, useRef, useState } from "react";
import { Pill } from "@/components/atoms";
import { CLINIC } from "@/lib/clinic";
import {
  BORDER_HAIRLINE,
  C,
  FONT_MONO,
  FONT_SERIF,
  SHADOW_CARD,
} from "@/lib/tokens";
import type {
  SessionCaptureResult,
  SubAgentMeta,
  TokenUsage,
} from "@/lib/agents/sub-agents/types";

/* ── types ─────────────────────────────────────────────────────────── */

type SubAgentName = "voice" | "text" | "prescription" | "billing" | "todos";

type PipelineEvent =
  | { type: "session_started"; ts: number; patientName: string }
  | { type: "agent_started"; ts: number; agent: SubAgentName }
  | {
      type: "agent_completed";
      ts: number;
      agent: SubAgentName;
      meta: SubAgentMeta;
      data: unknown;
    }
  | { type: "agent_failed"; ts: number; agent: SubAgentName; error: string }
  | {
      type: "tavily_called";
      ts: number;
      agent: SubAgentName;
      query: string;
      reason: string;
      cached: boolean;
      results: number;
    }
  | { type: "fanout_completed"; ts: number; latencyMs: number }
  | { type: "orchestrator_started"; ts: number }
  | {
      type: "orchestrator_completed";
      ts: number;
      meta: SubAgentMeta;
      summary: SessionCaptureResult["summary"];
    }
  | { type: "session_completed"; ts: number; result: SessionCaptureResult }
  | { type: "error"; message: string };

interface AgentLane {
  agent: SubAgentName;
  startedAt?: number;
  completedAt?: number;
  meta?: SubAgentMeta;
  failed?: string;
}

const SUB_AGENTS: { id: SubAgentName; label: string; tavily: boolean; hint: string }[] = [
  { id: "voice", label: "Voice", tavily: false, hint: "Owner statements + tone" },
  { id: "text", label: "Text + Vision", tavily: false, hint: "SOAP + differentials" },
  { id: "prescription", label: "Prescription", tavily: true, hint: "Recall + interaction checks" },
  { id: "billing", label: "Billing", tavily: true, hint: "Matrix + revenue leaks" },
  { id: "todos", label: "Staff To-Dos", tavily: false, hint: "Actionable next steps" },
];

const PRICING = {
  haiku: { input: 1, output: 5 },
  sonnet: { input: 3, output: 15 },
};

const DEMO_FIXTURES: { id: string; label: string; notes: string; transcript: string }[] = [
  {
    id: "p1",
    label: "Milo — ear recheck",
    notes:
      "Right ear externa recheck. Canal still mildly erythematous, less debris than last visit. Continuing Otomax 0.5 mL BID for another 7 days. Recheck cytology in 2 weeks. Annual DHPP + Lepto due — administered today.",
    transcript:
      "Owner: He's been so much better since last week, scratching way less. I just wanted to make sure the ear is fully clear before stopping. Also remembered the vaccine was overdue.",
  },
  {
    id: "p2",
    label: "Luna — anorexia 48h",
    notes:
      "2-day anorexia, no vomiting, normal water intake. Mild dental tartar grade 2. T 38.9, HR 180, RR 28. Recommended bloods + imaging. Started SC fluids 80 mL Hartmann's, Cerenia 1 mg/kg SC. Bland diet dispensed.",
    transcript:
      "Owner: She just stopped eating Sunday. Still drinks water, still purrs when I pick her up. No vomiting that I've seen. I'm worried because she's normally a chowhound.",
  },
  {
    id: "p3",
    label: "Rex — CCL post-op D3",
    notes:
      "TPLO right stifle day 3. Incision clean, no swelling or discharge. Weight-bearing 30% on RH. Continuing Meloxicam 0.1 mg/kg PO SID + Gabapentin 10 mg/kg PO TID. Owner reports good icing compliance. Recheck D14 for suture removal.",
    transcript:
      "Owner: He's doing the icing twice a day like you said. Sleeping on his side, only stands when I take him out. The cone is annoying him but it's staying on.",
  },
];

/* ── component ─────────────────────────────────────────────────────── */

export default function AgentDashboardClient() {
  const [fixture, setFixture] = useState<string>(DEMO_FIXTURES[0].id);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [lanes, setLanes] = useState<Record<SubAgentName, AgentLane>>(() =>
    initialLanes(),
  );
  const [orchestratorMeta, setOrchestratorMeta] = useState<SubAgentMeta | null>(null);
  const [orchestratorRange, setOrchestratorRange] = useState<{ s?: number; e?: number }>({});
  const [result, setResult] = useState<SessionCaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [t0, setT0] = useState<number | null>(null);
  const [tEnd, setTEnd] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function reset() {
    setEvents([]);
    setLanes(initialLanes());
    setOrchestratorMeta(null);
    setOrchestratorRange({});
    setResult(null);
    setError(null);
    setT0(null);
    setTEnd(null);
  }

  async function runPipeline() {
    if (running) return;
    reset();
    setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const fixtureBody = DEMO_FIXTURES.find((f) => f.id === fixture)!;
    try {
      const res = await fetch("/api/consult/capture/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          patientId: fixtureBody.id,
          notes: fixtureBody.notes,
          transcript: fixtureBody.transcript,
          sendTelegram: false,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(`stream error ${res.status}: ${txt.slice(0, 160)}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // simple SSE parser: events split by blank line
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            try {
              const evt = JSON.parse(json) as PipelineEvent;
              applyEvent(evt);
            } catch {
              // ignore unparseable
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function applyEvent(evt: PipelineEvent) {
    setEvents((prev) => [...prev, evt]);
    switch (evt.type) {
      case "session_started":
        setT0(evt.ts);
        break;
      case "agent_started":
        setLanes((prev) => ({
          ...prev,
          [evt.agent]: { ...prev[evt.agent], startedAt: evt.ts },
        }));
        break;
      case "agent_completed":
        setLanes((prev) => ({
          ...prev,
          [evt.agent]: {
            ...prev[evt.agent],
            completedAt: evt.ts,
            meta: evt.meta,
          },
        }));
        break;
      case "agent_failed":
        setLanes((prev) => ({
          ...prev,
          [evt.agent]: {
            ...prev[evt.agent],
            completedAt: evt.ts,
            failed: evt.error,
          },
        }));
        break;
      case "orchestrator_started":
        setOrchestratorRange((p) => ({ ...p, s: evt.ts }));
        break;
      case "orchestrator_completed":
        setOrchestratorRange((p) => ({ ...p, e: evt.ts }));
        setOrchestratorMeta(evt.meta);
        break;
      case "session_completed":
        setResult(evt.result);
        setTEnd(evt.ts);
        break;
      case "error":
        setError(evt.message);
        break;
    }
  }

  const totals = useMemo(
    () => computeTotals(lanes, orchestratorMeta),
    [lanes, orchestratorMeta],
  );
  const tavilyEvents = useMemo(
    () => events.filter((e) => e.type === "tavily_called") as Extract<PipelineEvent, { type: "tavily_called" }>[],
    [events],
  );
  const totalLatencyMs = t0 != null && tEnd != null ? tEnd - t0 : null;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }}>
      <Hero
        running={running}
        onRun={runPipeline}
        fixture={fixture}
        onFixtureChange={setFixture}
        totalLatencyMs={totalLatencyMs}
        totals={totals}
      />

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            background: C.redLight,
            border: `1px solid ${C.redBorder}`,
            borderRadius: 10,
            color: C.red,
            fontSize: 13,
          }}
        >
          Pipeline error: {error}
        </div>
      )}

      <Section title="Architecture" subtitle="Five Haiku sub-agents fan out in parallel, then a Sonnet orchestrator synthesizes for two audiences.">
        <ArchitectureDiagram lanes={lanes} orchestratorRange={orchestratorRange} />
      </Section>

      <Section title="Live execution timeline" subtitle="Gantt view of the parallel fan-out plus the orchestrator step. Clock starts when the first sub-agent fires.">
        <Timeline lanes={lanes} orchestratorRange={orchestratorRange} t0={t0} tEnd={tEnd} />
      </Section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginTop: 32,
        }}
      >
        <Section title="Tavily query feed" subtitle="Live web-search calls from prescription + billing agents." inline>
          <TavilyFeed events={tavilyEvents} />
        </Section>
        <Section title="Tokens & cost" subtitle="Per-agent input / output / cache hits. Sonnet costs ~3× Haiku." inline>
          <CostPanel lanes={lanes} orchestratorMeta={orchestratorMeta} totals={totals} />
        </Section>
      </div>

      <Section title="Output" subtitle="What the doctor sees on the dashboard, and what the owner sees in Telegram.">
        <OutputPreview result={result} running={running} />
      </Section>

      <Section
        title="Review & send to owner"
        subtitle="Doctor stays in control — confirm the chat ID, edit the message if needed, then deliver via Telegram. Saves the chat ID to the patient record on success."
      >
        <SendPanel result={result} fixturePatientId={fixture} />
      </Section>
    </main>
  );
}

/* ── hero ──────────────────────────────────────────────────────────── */

function Hero({
  running,
  onRun,
  fixture,
  onFixtureChange,
  totalLatencyMs,
  totals,
}: {
  running: boolean;
  onRun: () => void;
  fixture: string;
  onFixtureChange: (v: string) => void;
  totalLatencyMs: number | null;
  totals: ReturnType<typeof computeTotals>;
}) {
  return (
    <div
      style={{
        padding: "36px 0 24px",
        marginBottom: 12,
        borderBottom: `1px solid ${C.borderSoft}`,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 460px)",
        gap: 32,
        alignItems: "end",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: C.muted,
            marginBottom: 10,
          }}
        >
          Architecture · Live
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_SERIF,
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: -0.8,
            color: C.text,
            lineHeight: 1.06,
          }}
        >
          The agent team behind every consult.
        </h1>
        <div style={{ marginTop: 12, fontSize: 14, color: C.muted, maxWidth: 620, lineHeight: 1.55 }}>
          {CLINIC.name} runs a five-agent Haiku 4.5 fan-out for each consult, with Tavily wired into prescription and billing for live drug-recall and pricing checks. A Sonnet 4.6 orchestrator synthesizes two audiences — the doctor's SOAP card, and the friendly Telegram message your owner reads.
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: BORDER_HAIRLINE,
          borderRadius: 12,
          padding: "18px 20px",
          boxShadow: SHADOW_CARD,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            Demo input
          </div>
          <div style={{ flex: 1 }} />
          {totalLatencyMs != null && (
            <Pill tone="green" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
              {(totalLatencyMs / 1000).toFixed(2)}s · ${totals.costUsd.toFixed(4)}
            </Pill>
          )}
        </div>
        <select
          value={fixture}
          onChange={(e) => onFixtureChange(e.target.value)}
          disabled={running}
          style={{
            background: "#FFFFFF",
            border: BORDER_HAIRLINE,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            color: C.text,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {DEMO_FIXTURES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          onClick={onRun}
          disabled={running}
          style={{
            background: running ? C.borderSoft : C.text,
            color: running ? C.muted : "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: -0.1,
            cursor: running ? "not-allowed" : "pointer",
            transition: "background 140ms ease",
          }}
        >
          {running ? "Running pipeline…" : "Run pipeline"}
        </button>
      </div>
    </div>
  );
}

/* ── section header ────────────────────────────────────────────────── */

function Section({
  title,
  subtitle,
  children,
  inline,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <section style={{ marginTop: inline ? 0 : 32 }}>
      <div style={{ marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: FONT_SERIF,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: -0.3,
            color: C.text,
          }}
        >
          {title}
        </h2>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{subtitle}</div>
      </div>
      {children}
    </section>
  );
}

/* ── architecture diagram ──────────────────────────────────────────── */

function ArchitectureDiagram({
  lanes,
  orchestratorRange,
}: {
  lanes: Record<SubAgentName, AgentLane>;
  orchestratorRange: { s?: number; e?: number };
}) {
  return (
    <div
      style={{
        background: C.card,
        border: BORDER_HAIRLINE,
        borderRadius: 12,
        padding: "28px 24px",
        boxShadow: SHADOW_CARD,
      }}
    >
      {/* INPUT ROW */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <DiagramNode
          label="Consult input"
          sub="notes · transcript · photos"
          tone="neutral"
          width={280}
        />
      </div>

      <ConnectorRow />

      {/* LABEL */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          Parallel fan-out · Haiku 4.5
        </span>
      </div>

      {/* SUB-AGENT ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {SUB_AGENTS.map((a) => (
          <SubAgentCard key={a.id} agent={a} lane={lanes[a.id]} />
        ))}
      </div>

      <ConnectorRow merging />

      {/* ORCHESTRATOR */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <DiagramNode
          label="Orchestrator"
          sub="Sonnet 4.6 · synthesize"
          tone={orchRange(orchestratorRange)}
          width={320}
          accent
        />
      </div>

      <ConnectorRow splitting />

      {/* OUTPUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DiagramNode label="Doctor SOAP card" sub="dashboard view" tone="neutral" width="100%" />
        <DiagramNode label="Owner Telegram" sub="aftercare + tone-tuned" tone="neutral" width="100%" />
      </div>
    </div>
  );
}

function orchRange(r: { s?: number; e?: number }): "active" | "done" | "neutral" {
  if (r.e) return "done";
  if (r.s) return "active";
  return "neutral";
}

function SubAgentCard({ agent, lane }: { agent: typeof SUB_AGENTS[number]; lane: AgentLane }) {
  const tone: "neutral" | "active" | "done" | "failed" = lane.failed
    ? "failed"
    : lane.completedAt
      ? "done"
      : lane.startedAt
        ? "active"
        : "neutral";
  const colors = {
    neutral: { border: C.border, bg: "#FFFFFF", dot: C.hint, label: C.muted },
    active: { border: C.brandBorder, bg: C.brandLight, dot: C.brand, label: C.text },
    done: { border: C.greenBorder, bg: C.greenLight, dot: C.green, label: C.text },
    failed: { border: C.redBorder, bg: C.redLight, dot: C.red, label: C.text },
  }[tone];
  const latency = lane.startedAt && lane.completedAt ? lane.completedAt - lane.startedAt : null;
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "10px 12px",
        position: "relative",
        transition: "background 220ms ease, border-color 220ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.dot,
            boxShadow: tone === "active" ? `0 0 0 4px ${C.brandLight}` : undefined,
            animation: tone === "active" ? "pulse 1.2s ease-in-out infinite" : undefined,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.label, letterSpacing: -0.1 }}>
          {agent.label}
        </span>
        {agent.tavily && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              color: C.amber,
              background: C.amberLight,
              border: `1px solid ${C.amberBorder}`,
              borderRadius: 4,
              padding: "1px 4px",
            }}
          >
            TAVILY
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{agent.hint}</div>
      <div
        style={{
          marginTop: 6,
          fontSize: 10.5,
          fontFamily: FONT_MONO,
          color: tone === "neutral" ? C.hint : C.ink,
        }}
      >
        {tone === "neutral" && "queued"}
        {tone === "active" && "running…"}
        {tone === "done" && latency != null && `${latency}ms`}
        {tone === "failed" && (lane.failed?.slice(0, 32) ?? "failed")}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

function DiagramNode({
  label,
  sub,
  tone,
  width,
  accent,
}: {
  label: string;
  sub: string;
  tone: "neutral" | "active" | "done";
  width: number | string;
  accent?: boolean;
}) {
  const colors = {
    neutral: { border: C.border, bg: "#FFFFFF" },
    active: { border: C.brandBorder, bg: C.brandLight },
    done: { border: C.greenBorder, bg: C.greenLight },
  }[tone];
  return (
    <div
      style={{
        width,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: accent ? `3px solid ${C.text}` : `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        textAlign: "center",
        transition: "background 220ms ease, border-color 220ms ease",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: -0.1 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ConnectorRow({ merging, splitting }: { merging?: boolean; splitting?: boolean }) {
  const stroke = C.border;
  return (
    <svg
      viewBox="0 0 600 28"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 28, margin: "2px 0" }}
    >
      {merging ? (
        // 5 lines merge to center
        <>
          <line x1="60" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="180" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="420" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="540" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
        </>
      ) : splitting ? (
        // single line splits to two
        <>
          <line x1="300" y1="0" x2="180" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="420" y2="28" stroke={stroke} strokeWidth="1" />
        </>
      ) : (
        // 1 line splits to 5
        <>
          <line x1="300" y1="0" x2="60" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="180" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="300" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="420" y2="28" stroke={stroke} strokeWidth="1" />
          <line x1="300" y1="0" x2="540" y2="28" stroke={stroke} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

/* ── timeline ──────────────────────────────────────────────────────── */

function Timeline({
  lanes,
  orchestratorRange,
  t0,
  tEnd,
}: {
  lanes: Record<SubAgentName, AgentLane>;
  orchestratorRange: { s?: number; e?: number };
  t0: number | null;
  tEnd: number | null;
}) {
  const end = tEnd ?? Date.now();
  const start = t0 ?? end;
  const span = Math.max(end - start, 1);

  const rows: { label: string; s?: number; e?: number; tone: "haiku" | "sonnet" }[] = [
    ...SUB_AGENTS.map((a) => ({
      label: a.label,
      s: lanes[a.id].startedAt,
      e: lanes[a.id].completedAt,
      tone: "haiku" as const,
    })),
    {
      label: "Orchestrator",
      s: orchestratorRange.s,
      e: orchestratorRange.e,
      tone: "sonnet" as const,
    },
  ];

  const empty = t0 == null;

  return (
    <div
      style={{
        background: C.card,
        border: BORDER_HAIRLINE,
        borderRadius: 12,
        padding: "16px 20px",
        boxShadow: SHADOW_CARD,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => {
          const left = r.s ? ((r.s - start) / span) * 100 : 0;
          const width = r.s && r.e ? ((r.e - r.s) / span) * 100 : r.s ? Math.min(100 - left, 8) : 0;
          const color = r.tone === "haiku" ? C.brand : C.text;
          const bg = r.tone === "haiku" ? C.brandLight : "#1E293B22";
          const labelMs = r.s && r.e ? `${r.e - r.s}ms` : empty ? "" : r.s ? "running" : "";
          return (
            <div key={r.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12.5, color: C.text, letterSpacing: -0.1 }}>{r.label}</div>
              <div
                style={{
                  position: "relative",
                  height: 16,
                  background: empty ? "transparent" : `linear-gradient(to right, ${C.borderSoft} 0%, ${C.borderSoft} 100%)`,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {r.s && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      top: 0,
                      bottom: 0,
                      width: `${Math.max(width, 1.5)}%`,
                      background: bg,
                      borderLeft: `2px solid ${color}`,
                      transition: "width 180ms ease, left 180ms ease",
                    }}
                  />
                )}
              </div>
              <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textAlign: "right" }}>
                {labelMs}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          fontFamily: FONT_MONO,
          color: C.hint,
        }}
      >
        <span>0ms</span>
        <span>{empty ? "—" : `${span}ms total`}</span>
      </div>
    </div>
  );
}

/* ── tavily feed ───────────────────────────────────────────────────── */

function TavilyFeed({
  events,
}: {
  events: Extract<PipelineEvent, { type: "tavily_called" }>[];
}) {
  return (
    <div
      style={{
        background: C.card,
        border: BORDER_HAIRLINE,
        borderRadius: 12,
        padding: 16,
        minHeight: 180,
        boxShadow: SHADOW_CARD,
      }}
    >
      {events.length === 0 ? (
        <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>
          No Tavily searches yet. Prescription and billing agents fire only when needed —
          unfamiliar drugs, recall checks, or unmatched matrix items.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.map((e, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${C.amberBorder}`,
                background: C.amberLight,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Pill tone="amber" style={{ textTransform: "uppercase", fontSize: 10 }}>
                  {e.agent}
                </Pill>
                <span style={{ fontSize: 11, color: C.muted }}>
                  {e.cached ? "cached" : "live"} · {e.results} result{e.results === 1 ? "" : "s"}
                </span>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.text }}>
                {e.query}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{e.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── cost panel ────────────────────────────────────────────────────── */

function CostPanel({
  lanes,
  orchestratorMeta,
  totals,
}: {
  lanes: Record<SubAgentName, AgentLane>;
  orchestratorMeta: SubAgentMeta | null;
  totals: ReturnType<typeof computeTotals>;
}) {
  const rows: {
    label: string;
    usage?: TokenUsage;
    model: "haiku" | "sonnet";
  }[] = [
    ...SUB_AGENTS.map((a) => ({
      label: a.label,
      usage: lanes[a.id].meta?.usage,
      model: "haiku" as const,
    })),
    { label: "Orchestrator", usage: orchestratorMeta?.usage, model: "sonnet" as const },
  ];

  return (
    <div
      style={{
        background: C.card,
        border: BORDER_HAIRLINE,
        borderRadius: 12,
        padding: 16,
        minHeight: 180,
        boxShadow: SHADOW_CARD,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 64px 64px 64px 60px",
          gap: 8,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: C.muted,
          paddingBottom: 6,
          borderBottom: BORDER_HAIRLINE,
        }}
      >
        <div>Agent</div>
        <div style={{ textAlign: "right" }}>In</div>
        <div style={{ textAlign: "right" }}>Out</div>
        <div style={{ textAlign: "right" }}>Cache</div>
        <div style={{ textAlign: "right" }}>$</div>
      </div>
      {rows.map((r) => {
        const u = r.usage ?? { inputTokens: 0, outputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0 };
        const cost = perCallCost(u, r.model);
        return (
          <div
            key={r.label}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 64px 64px 64px 60px",
              gap: 8,
              padding: "8px 0",
              borderBottom: BORDER_HAIRLINE,
              fontSize: 12.5,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {r.label}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: r.model === "haiku" ? C.brand : C.text,
                  background: r.model === "haiku" ? C.brandLight : "#F1F5F9",
                  border: `1px solid ${r.model === "haiku" ? C.brandBorder : C.border}`,
                  borderRadius: 4,
                  padding: "1px 4px",
                  textTransform: "uppercase",
                }}
              >
                {r.model}
              </span>
            </div>
            <div style={{ textAlign: "right", fontFamily: FONT_MONO }}>{u.inputTokens}</div>
            <div style={{ textAlign: "right", fontFamily: FONT_MONO }}>{u.outputTokens}</div>
            <div style={{ textAlign: "right", fontFamily: FONT_MONO, color: u.cacheReadTokens > 0 ? C.green : C.hint }}>
              {u.cacheReadTokens > 0 ? `+${u.cacheReadTokens}` : u.cacheCreationTokens > 0 ? `c${u.cacheCreationTokens}` : "—"}
            </div>
            <div style={{ textAlign: "right", fontFamily: FONT_MONO, color: cost > 0 ? C.text : C.hint }}>
              {cost > 0 ? `$${cost.toFixed(4)}` : "—"}
            </div>
          </div>
        );
      })}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 64px 64px 64px 60px",
          gap: 8,
          padding: "10px 0 0",
          fontSize: 12.5,
          fontWeight: 700,
          alignItems: "center",
        }}
      >
        <div>Total</div>
        <div style={{ textAlign: "right", fontFamily: FONT_MONO }}>{totals.inputTokens}</div>
        <div style={{ textAlign: "right", fontFamily: FONT_MONO }}>{totals.outputTokens}</div>
        <div style={{ textAlign: "right", fontFamily: FONT_MONO, color: C.green }}>
          {totals.cacheReadTokens > 0 ? `+${totals.cacheReadTokens}` : "—"}
        </div>
        <div style={{ textAlign: "right", fontFamily: FONT_MONO }}>${totals.costUsd.toFixed(4)}</div>
      </div>
      {totals.cacheReadTokens > 0 && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: C.green }}>
          Prompt cache active — {totals.cacheReadTokens} tokens served at 10% input price.
        </div>
      )}
    </div>
  );
}

/* ── output preview ────────────────────────────────────────────────── */

function OutputPreview({
  result,
  running,
}: {
  result: SessionCaptureResult | null;
  running: boolean;
}) {
  if (!result) {
    return (
      <div
        style={{
          background: C.card,
          border: BORDER_HAIRLINE,
          borderRadius: 12,
          padding: "32px 24px",
          textAlign: "center",
          color: C.muted,
          fontSize: 13,
          boxShadow: SHADOW_CARD,
        }}
      >
        {running ? "Synthesizing summary…" : "Run the pipeline to see the doctor SOAP card and Telegram preview here."}
      </div>
    );
  }
  const { summary } = result;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* DOCTOR */}
      <div
        style={{
          background: C.card,
          border: BORDER_HAIRLINE,
          borderRadius: 12,
          padding: 20,
          boxShadow: SHADOW_CARD,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: C.muted,
            marginBottom: 10,
          }}
        >
          Doctor — SOAP card
        </div>
        <SoapBlock soap={summary.doctorSummary.soap} />
        {summary.doctorSummary.flags.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <SoapLabel>Flags</SoapLabel>
            {summary.doctorSummary.flags.map((f, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.red, marginTop: 4 }}>• {f}</div>
            ))}
          </div>
        )}
        {summary.doctorSummary.nextSteps.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <SoapLabel>Next steps</SoapLabel>
            {summary.doctorSummary.nextSteps.map((s, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.text, marginTop: 4 }}>• {s}</div>
            ))}
          </div>
        )}
      </div>

      {/* TELEGRAM */}
      <div
        style={{
          background: C.card,
          border: BORDER_HAIRLINE,
          borderRadius: 12,
          padding: 20,
          boxShadow: SHADOW_CARD,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: C.muted,
            marginBottom: 10,
          }}
        >
          Owner — Telegram preview
        </div>
        <div
          style={{
            background: "#E7F4FE",
            border: `1px solid #BCE0FA`,
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 13.5,
            color: C.text,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {summary.ownerMessage.body.replace(/\{clinic\}/g, CLINIC.name)}
        </div>
        {summary.ownerMessage.aftercare.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <SoapLabel>Aftercare</SoapLabel>
            {summary.ownerMessage.aftercare.map((a, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.text, marginTop: 4 }}>• {a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── send panel ────────────────────────────────────────────────────── */

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; messageId: number; chatIdSaved: boolean }
  | { kind: "error"; message: string };

function SendPanel({
  result,
  fixturePatientId,
}: {
  result: SessionCaptureResult | null;
  fixturePatientId: string;
}) {
  const [chatId, setChatId] = useState("");
  const [bodyDraft, setBodyDraft] = useState("");
  const [aftercareDraft, setAftercareDraft] = useState("");
  const [status, setStatus] = useState<SendStatus>({ kind: "idle" });
  const lastResultId = useRef<string | null>(null);

  // When a new pipeline run lands, reset the editable drafts to the
  // orchestrator's latest output. Don't overwrite while the doctor is
  // mid-edit on the same result.
  if (result && result.visitId !== lastResultId.current) {
    lastResultId.current = result.visitId;
    setBodyDraft(result.summary.ownerMessage.body.replace(/\{clinic\}/g, CLINIC.name));
    setAftercareDraft(result.summary.ownerMessage.aftercare.join("\n"));
    setStatus({ kind: "idle" });
  }

  if (!result) {
    return (
      <div
        style={{
          background: C.card,
          border: BORDER_HAIRLINE,
          borderRadius: 12,
          padding: "32px 24px",
          textAlign: "center",
          color: C.muted,
          fontSize: 13,
          boxShadow: SHADOW_CARD,
        }}
      >
        Run the pipeline first — the doctor review-and-send panel appears once the orchestrator emits the draft.
      </div>
    );
  }

  const aftercareLines = aftercareDraft
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  async function send() {
    if (!chatId.trim()) {
      setStatus({ kind: "error", message: "enter a Telegram chat ID first" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/consult/telegram-send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chatId: chatId.trim(),
          body: bodyDraft,
          aftercare: aftercareLines,
          patientId: fixturePatientId,
          visitId: result?.visitId,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: true;
        messageId?: number;
        chatIdSaved?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok || typeof json.messageId !== "number") {
        throw new Error(json.error ?? `send failed (${res.status})`);
      }
      setStatus({
        kind: "sent",
        messageId: json.messageId,
        chatIdSaved: Boolean(json.chatIdSaved),
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sending = status.kind === "sending";

  return (
    <div
      style={{
        background: C.card,
        border: BORDER_HAIRLINE,
        borderRadius: 12,
        padding: 20,
        boxShadow: SHADOW_CARD,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 360px",
        gap: 24,
      }}
    >
      {/* LEFT — editable drafts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <SoapLabel>Owner message</SoapLabel>
          <textarea
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            disabled={sending}
            rows={5}
            style={textareaStyle}
          />
          <div style={{ fontSize: 11, color: C.hint, marginTop: 4, fontFamily: FONT_MONO }}>
            {bodyDraft.length} / 600 chars
          </div>
        </div>
        <div>
          <SoapLabel>Aftercare bullets (one per line)</SoapLabel>
          <textarea
            value={aftercareDraft}
            onChange={(e) => setAftercareDraft(e.target.value)}
            disabled={sending}
            rows={4}
            style={textareaStyle}
            placeholder="Continue medication twice daily…"
          />
        </div>
      </div>

      {/* RIGHT — chat ID + send + status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <SoapLabel>Owner Telegram chat ID</SoapLabel>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            disabled={sending}
            placeholder="123456789 or @username"
            style={{
              ...textareaStyle,
              fontFamily: FONT_MONO,
              fontSize: 13,
              padding: "10px 12px",
            }}
          />
          <div style={{ fontSize: 11, color: C.hint, marginTop: 4 }}>
            Ask the owner once — this saves to the patient record on success.
          </div>
        </div>
        <button
          onClick={send}
          disabled={sending || !chatId.trim()}
          style={{
            background: sending || !chatId.trim() ? C.borderSoft : C.text,
            color: sending || !chatId.trim() ? C.muted : "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: sending || !chatId.trim() ? "not-allowed" : "pointer",
            transition: "background 140ms ease",
          }}
        >
          {sending ? "Sending…" : "Send to Telegram"}
        </button>
        <SendStatusBlock status={status} />
      </div>
    </div>
  );
}

function SendStatusBlock({ status }: { status: SendStatus }) {
  if (status.kind === "idle") return null;
  if (status.kind === "sending") {
    return (
      <div style={{ fontSize: 12.5, color: C.muted }}>Sending via grammY…</div>
    );
  }
  if (status.kind === "sent") {
    return (
      <div
        style={{
          padding: "10px 12px",
          background: C.greenLight,
          border: `1px solid ${C.greenBorder}`,
          borderRadius: 8,
          fontSize: 12.5,
          color: C.greenDark,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontWeight: 600 }}>
          Delivered · message #{status.messageId}
        </div>
        <div style={{ color: C.muted, fontSize: 11.5 }}>
          {status.chatIdSaved
            ? "Chat ID saved to patient record."
            : "Chat ID not saved (no Supabase admin or row not found)."}
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "10px 12px",
        background: C.redLight,
        border: `1px solid ${C.redBorder}`,
        borderRadius: 8,
        fontSize: 12.5,
        color: C.red,
      }}
    >
      {status.message}
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: BORDER_HAIRLINE,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: C.text,
  lineHeight: 1.5,
  resize: "vertical" as const,
  fontFamily: "inherit",
};

function SoapBlock({ soap }: { soap: { S: string; O: string; A: string; P: string } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["S", "O", "A", "P"] as const).map((k) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 8, alignItems: "start" }}>
          <span style={{ fontFamily: FONT_SERIF, fontWeight: 600, color: C.muted, fontSize: 13 }}>{k}</span>
          <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{soap[k]}</span>
        </div>
      ))}
    </div>
  );
}

function SoapLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: C.muted,
      }}
    >
      {children}
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */

function initialLanes(): Record<SubAgentName, AgentLane> {
  return {
    voice: { agent: "voice" },
    text: { agent: "text" },
    prescription: { agent: "prescription" },
    billing: { agent: "billing" },
    todos: { agent: "todos" },
  };
}

function perCallCost(u: TokenUsage, model: "haiku" | "sonnet"): number {
  const p = PRICING[model];
  // cache reads cost 10% of input, cache writes cost 125% of input.
  const inCost = (u.inputTokens / 1_000_000) * p.input;
  const outCost = (u.outputTokens / 1_000_000) * p.output;
  const cacheReadCost = (u.cacheReadTokens / 1_000_000) * p.input * 0.1;
  const cacheWriteCost = (u.cacheCreationTokens / 1_000_000) * p.input * 1.25;
  return inCost + outCost + cacheReadCost + cacheWriteCost;
}

function computeTotals(
  lanes: Record<SubAgentName, AgentLane>,
  orchMeta: SubAgentMeta | null,
) {
  const usages: { u: TokenUsage; m: "haiku" | "sonnet" }[] = [];
  for (const a of SUB_AGENTS) {
    const u = lanes[a.id].meta?.usage;
    if (u) usages.push({ u, m: "haiku" });
  }
  if (orchMeta?.usage) usages.push({ u: orchMeta.usage, m: "sonnet" });
  const sum = usages.reduce(
    (acc, x) => ({
      inputTokens: acc.inputTokens + x.u.inputTokens,
      outputTokens: acc.outputTokens + x.u.outputTokens,
      cacheReadTokens: acc.cacheReadTokens + x.u.cacheReadTokens,
      cacheCreationTokens: acc.cacheCreationTokens + x.u.cacheCreationTokens,
      costUsd: acc.costUsd + perCallCost(x.u, x.m),
    }),
    { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0, costUsd: 0 },
  );
  return sum;
}
