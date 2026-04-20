"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useState } from "react";
import { Button, Card, Icon, Pill } from "@/components/atoms";
import {
  BriefRow,
  PageHeader,
  PetAvatar,
  SectionTitle,
} from "@/components/app-shell/page-header";
import { useStore } from "@/components/app-shell/store";
import { GLM_CONSULT_OUTPUT, PATIENTS } from "@/lib/data";
import { C } from "@/lib/tokens";
import type {
  BillingItem,
  PrescriptionItem,
  SoapNote,
  TodoItem,
} from "@/lib/types";

function OutputCardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card style={{ padding: 0, overflow: "hidden", animation: "slideIn 340ms ease both" }}>
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 11, color: C.hint }}>{subtitle}</div>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </Card>
  );
}

function SoapCard({ s }: { s: SoapNote }) {
  const rows: { k: "S" | "O" | "A" | "P"; label: string; v: string }[] = [
    { k: "S", label: "Subjective", v: s.S },
    { k: "O", label: "Objective", v: s.O },
    { k: "A", label: "Assessment", v: s.A },
    { k: "P", label: "Plan", v: s.P },
  ];
  return (
    <OutputCardShell title="SOAP Note" subtitle="auto-extracted">
      {rows.map((r) => (
        <div key={r.k} style={{ marginBottom: 11 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 22,
                height: 22,
                borderRadius: 6,
                background: C.greenLight,
                color: C.greenDark,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {r.k}
            </span>
            <span
              style={{
                fontSize: 11,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 600,
              }}
            >
              {r.label}
            </span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: C.text }}>{r.v}</div>
        </div>
      ))}
    </OutputCardShell>
  );
}

function PrescriptionCard({ rx }: { rx: PrescriptionItem[] }) {
  return (
    <OutputCardShell title="Prescription" subtitle={`${rx.length} items`}>
      {rx.map((r, i) => (
        <div
          key={i}
          style={{
            padding: "12px 0",
            borderTop: i > 0 ? `1px solid ${C.borderSoft}` : "none",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.drug}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.55 }}>
            <div>
              <b style={{ color: C.ink, fontWeight: 600 }}>Dose:</b> {r.dose}
            </div>
            <div>
              <b style={{ color: C.ink, fontWeight: 600 }}>Duration:</b> {r.dur} ·{" "}
              <b style={{ color: C.ink, fontWeight: 600 }}>Qty:</b> {r.qty}
            </div>
          </div>
        </div>
      ))}
    </OutputCardShell>
  );
}

function BillingCard({
  items,
  total,
  flagged,
}: {
  items: BillingItem[];
  total: number;
  flagged: number;
}) {
  return (
    <OutputCardShell title="Billing checklist" subtitle={`RM ${total}`}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "9px 11px",
            marginBottom: 6,
            borderRadius: 8,
            background: it.flagged ? C.amberLight : "transparent",
            border: it.flagged ? `1px solid ${C.amberBorder}` : "1px solid transparent",
          }}
        >
          <span style={{ color: it.flagged ? C.amber : C.green, marginTop: 2 }}>
            {it.flagged ? Icon.warn(13) : Icon.check(13)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: it.flagged ? 700 : 500,
                color: C.text,
              }}
            >
              {it.item}
            </div>
            {it.flagged && (
              <div style={{ fontSize: 11, color: C.amber, marginTop: 2, fontStyle: "italic" }}>
                {it.note}
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>RM {it.price}</div>
        </div>
      ))}
      {flagged > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: C.amberLight,
            border: `1px solid ${C.amberBorder}`,
            fontSize: 12,
            color: C.amber,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {Icon.warn(13)} RM {flagged} flagged as missed — would have been billed
        </div>
      )}
    </OutputCardShell>
  );
}

function TodoCard({ todos }: { todos: TodoItem[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  return (
    <OutputCardShell title="Staff to-do" subtitle={`${todos.length} tasks`}>
      {todos.map((t, i) => (
        <div
          key={i}
          onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "10px 0",
            cursor: "pointer",
            borderTop: i > 0 ? `1px solid ${C.borderSoft}` : "none",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: `1.5px solid ${done[i] ? C.green : C.hint}`,
              background: done[i] ? C.green : "transparent",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              marginTop: 1,
              flexShrink: 0,
              transition: "all 140ms ease",
            }}
          >
            {done[i] && Icon.check(13)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                color: done[i] ? C.muted : C.text,
                textDecoration: done[i] ? "line-through" : "none",
                lineHeight: 1.4,
              }}
            >
              {t.task}
            </div>
            <div style={{ fontSize: 11, color: C.hint, marginTop: 3 }}>→ {t.who}</div>
          </div>
        </div>
      ))}
    </OutputCardShell>
  );
}

function GeneratingPlaceholder() {
  return (
    <Card
      style={{
        padding: 28,
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `3px solid ${C.border}`,
          borderTopColor: C.green,
          animation: "spinSlow .9s linear infinite",
        }}
      />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Consilium is reading your notes…</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
          Extracting SOAP · cross-referencing billing matrix · drafting staff to-dos
        </div>
      </div>
    </Card>
  );
}

function ConsultContent() {
  const params = useSearchParams();
  const pid = params.get("pid");
  const patient = PATIENTS.find((p) => p.id === pid) || PATIENTS[0];
  const { flashToast } = useStore();

  const [notes, setNotes] = useState(
    "Came in for limping on right hind for past 2 weeks. Worse on stairs. No trauma. Palpated right stifle - pain response, mild effusion. " +
      "Positive drawer sign, partial. Will do rads today. Send home with Meloxicam, gabapentin for comfort. E-collar. Recheck 7 days.",
  );
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [recording, setRecording] = useState(false);

  const output = GLM_CONSULT_OUTPUT;
  const billTotal = output.billing.reduce((a, b) => a + b.price, 0);
  const billFlagged = output.billing
    .filter((b) => b.flagged)
    .reduce((a, b) => a + b.price, 0);

  const generate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1200);
  };

  const approve = () => {
    flashToast("All 4 outputs approved · RM 145 billing recovered");
  };

  return (
    <div style={{ padding: "0 32px 100px", maxWidth: 1480, margin: "0 auto" }}>
      <PageHeader
        eyebrow={`Consult · ${patient.name}`}
        title="Capture today's visit."
        sub="Dictate or type — Consilium returns a structured SOAP note, prescription, billing checklist, and staff to-do list in seconds."
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" icon={Icon.back(14)}>
                Dashboard
              </Button>
            </Link>
            <Pill tone={patient.tagColor}>{patient.tag}</Pill>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 28 }}>
        <div>
          <SectionTitle title="Consultation notes" />
          <Card style={{ padding: 0, marginBottom: 28, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.green, display: "inline-flex" }}>{Icon.spark(14)}</span>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: C.muted,
                }}
              >
                Raw input
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setRecording((r) => !r)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: recording ? C.redLight : "#F3F2EF",
                  border: `1px solid ${recording ? C.redBorder : C.border}`,
                  color: recording ? C.red : C.text,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {Icon.mic(14)} {recording ? "Recording…" : "Voice input"}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type or dictate your notes…"
              style={{
                width: "100%",
                minHeight: 180,
                resize: "vertical",
                padding: "18px 22px",
                border: "none",
                outline: "none",
                fontSize: 15,
                lineHeight: 1.6,
                color: C.text,
                background: "#fff",
              }}
            />
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#FCFBF9",
              }}
            >
              <div style={{ fontSize: 12, color: C.muted }}>
                {notes.length} chars · GLM will cross-reference billing matrix + prior visits
              </div>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="sm">
                Clear
              </Button>
              <Button size="md" onClick={generate} icon={Icon.spark(14)}>
                {generating ? "Generating…" : generated ? "Regenerate" : "Generate"}
              </Button>
            </div>
          </Card>

          {generating && <GeneratingPlaceholder />}

          {generated && (
            <>
              <SectionTitle
                title="Structured output"
                action={<div style={{ fontSize: 12, color: C.hint }}>4 cards · tap to edit</div>}
              />
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(2, 1fr)",
                  marginBottom: 20,
                }}
              >
                <SoapCard s={output.soap} />
                <PrescriptionCard rx={output.prescription} />
                <BillingCard items={output.billing} total={billTotal} flagged={billFlagged} />
                <TodoCard todos={output.todos} />
              </div>

              <Card
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  animation: "slideIn 320ms ease both",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: C.greenLight,
                      color: C.green,
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${C.greenBorder}`,
                    }}
                  >
                    {Icon.check(16)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      4 outputs ready · RM {billTotal} total
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      RM {billFlagged} caught as missed billing · 4 tasks queued
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <Button variant="ghost" size="md">
                  Edit all
                </Button>
                <Button size="md" onClick={approve} icon={Icon.check(14)}>
                  Approve All
                </Button>
              </Card>
            </>
          )}

          {!generated && !generating && (
            <Card style={{ padding: 50, textAlign: "center", color: C.muted }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: C.brandLight,
                  color: C.brand,
                  border: `1px solid ${C.brandBorder}`,
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 14px",
                }}
              >
                {Icon.spark(22)}
              </div>
              <div
                style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}
              >
                Ready to structure your notes
              </div>
              <div style={{ fontSize: 14 }}>
                Click <b>Generate</b> — Consilium produces SOAP, prescription, billing, and to-dos.
              </div>
            </Card>
          )}
        </div>

        <div>
          <SectionTitle title="Patient context" />
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <PetAvatar name={patient.name} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{patient.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {patient.breed} · {patient.age} · {patient.sex}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.muted,
                padding: "10px 12px",
                background: C.bgAlt,
                borderRadius: 8,
                lineHeight: 1.5,
              }}
            >
              <b style={{ color: C.text }}>Owner:</b> {patient.owner}
              <br />
              <b style={{ color: C.text }}>Phone:</b> {patient.ownerPhone}
            </div>
          </Card>
          <SectionTitle title="Pre-consult brief" />
          <Card style={{ padding: 18 }}>
            <BriefRow k="Last visit" v={patient.brief.lastVisit} />
            <BriefRow k="Chronic" v={patient.brief.chronic} />
            <BriefRow k="Compliance" v={patient.brief.compliance} />
            <BriefRow k="Pending" v={patient.brief.pending} />
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: C.greenLight,
                border: `1px solid ${C.greenBorder}`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: C.green,
                  textTransform: "uppercase",
                }}
              >
                Probe today
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.greenDark,
                  marginTop: 3,
                  fontWeight: 500,
                }}
              >
                {patient.brief.probe}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ConsultPage() {
  return (
    <Suspense>
      <ConsultContent />
    </Suspense>
  );
}
