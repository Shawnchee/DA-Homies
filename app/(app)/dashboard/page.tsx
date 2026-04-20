"use client";

import Link from "next/link";
import { Button, Card, Dot, Icon, Pill } from "@/components/atoms";
import {
  BriefRow,
  PageHeader,
  PetAvatar,
  SectionTitle,
} from "@/components/app-shell/page-header";
import { useStore } from "@/components/app-shell/store";
import { MONTH_METRICS, PATIENTS } from "@/lib/data";
import { C } from "@/lib/tokens";
import type { FollowUp, MetricCardData, Patient } from "@/lib/types";

function MetricCard({ m }: { m: MetricCardData }) {
  const toneMap: Record<string, string> = {
    green: C.green,
    amber: C.amber,
    red: C.red,
  };
  const tone = toneMap[m.tone] || C.text;
  return (
    <Card style={{ padding: 18 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          color: C.muted,
          fontWeight: 600,
        }}
      >
        {m.label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: tone,
          marginTop: 8,
          letterSpacing: -0.7,
        }}
      >
        {m.value}
      </div>
      <div style={{ fontSize: 12, color: C.hint, marginTop: 2 }}>{m.sub}</div>
    </Card>
  );
}

function PatientCard({
  p,
  expanded,
  onToggle,
}: {
  p: Patient;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card hoverable active={expanded} style={{ padding: 0, overflow: "hidden" }}>
      <div
        onClick={onToggle}
        style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 18, cursor: "pointer" }}
      >
        <div
          style={{
            minWidth: 56,
            fontSize: 15,
            fontWeight: 700,
            color: C.text,
            letterSpacing: -0.2,
          }}
        >
          {p.time}
        </div>
        <PetAvatar name={p.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{p.name}</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              · {p.breed} · {p.age}
            </div>
            <Pill tone={p.tagColor}>{p.tag}</Pill>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {p.reason} · Owner: {p.owner}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
          <span style={{ fontSize: 12 }}>{expanded ? "Hide brief" : "Brief"}</span>
          {Icon.chevron(16, expanded ? "up" : "down")}
        </div>
      </div>
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: "20px 22px 22px",
            background: "#FCFBF9",
            animation: "slideIn 260ms ease both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ color: C.green, display: "inline-flex" }}>{Icon.spark(14)}</span>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: C.green,
              }}
            >
              Pre-consult brief · generated from 10 past visits
            </div>
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>
            <BriefRow k="Last visit" v={p.brief.lastVisit} />
            <BriefRow k="Chronic flags" v={p.brief.chronic} />
            <BriefRow k="Compliance" v={p.brief.compliance} />
            <BriefRow k="Pending" v={p.brief.pending} />
            <div
              style={{
                marginTop: 12,
                padding: "12px 14px",
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
              <div style={{ fontSize: 14, color: C.greenDark, marginTop: 3, fontWeight: 500 }}>
                {p.brief.probe}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <Link href={`/consult?pid=${p.id}`}>
              <Button size="md">Start Consult</Button>
            </Link>
            <Link href={`/passport?pid=${p.id}`}>
              <Button size="md" variant="soft" icon={Icon.paw(14)}>
                View Passport
              </Button>
            </Link>
            <Button size="md" variant="ghost">
              Add note
            </Button>
            <div style={{ flex: 1 }} />
            <div style={{ alignSelf: "center", fontSize: 12, color: C.hint }}>{p.ownerPhone}</div>
          </div>
        </div>
      )}
    </Card>
  );
}

function FollowUpItem({
  f,
  onClick,
}: {
  f: FollowUp;
  onClick?: () => void;
}) {
  const tones = {
    escalate: { dot: C.red, pill: "red" as const, label: "ESCALATE", pulse: true },
    monitor: { dot: C.amber, pill: "amber" as const, label: "MONITOR", pulse: false },
    clear: { dot: C.green, pill: "green" as const, label: "ALL CLEAR", pulse: false },
  };
  const t = tones[f.level];
  return (
    <Card
      hoverable={f.level === "escalate"}
      onClick={onClick}
      style={{
        padding: 14,
        borderColor: f.level === "escalate" ? C.redBorder : C.border,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ marginTop: 5 }}>
          <Dot color={t.dot} size={9} pulsing={t.pulse} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{f.patient}</div>
            <div style={{ fontSize: 12, color: C.muted }}>· {f.procedure}</div>
            <div style={{ flex: 1 }} />
            {f.tsLabel && <div style={{ fontSize: 11, color: C.hint }}>{f.tsLabel}</div>}
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.ink,
              marginTop: 6,
              fontStyle: "italic",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            &ldquo;{f.ownerMessage}&rdquo;
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Pill tone={t.pill} style={{ fontSize: 10 }}>
              {t.label}
            </Pill>
            <div style={{ fontSize: 11, color: C.muted }}>Owner: {f.owner}</div>
            {f.level === "escalate" && (
              <>
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    fontSize: 12,
                    color: C.red,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Open {Icon.arrow(12)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { followups, resolvedCount, openEscalation, expandedPatient, setExpandedPatient } =
    useStore();
  const urgent = followups.filter((f) => f.level === "escalate").length;
  const monitorN = followups.filter((f) => f.level === "monitor").length;

  return (
    <div style={{ padding: "0 32px 100px", maxWidth: 1480, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Monday morning · 20 April"
        title="Good morning, Dr. Amirah."
        sub={`${PATIENTS.length} patients today · ${urgent} escalations waiting · ${monitorN} in monitoring · 78% follow-up response this month.`}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm">
              + Add walk-in
            </Button>
            <Button variant="soft" size="sm">
              Export day
            </Button>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 36,
        }}
      >
        {MONTH_METRICS.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <SectionTitle
            title="Today's Schedule"
            count={PATIENTS.length}
            action={
              <div style={{ fontSize: 12, color: C.hint }}>Click any patient for the AI brief</div>
            }
          />
          <div style={{ display: "grid", gap: 12 }}>
            {PATIENTS.map((p) => (
              <PatientCard
                key={p.id}
                p={p}
                expanded={expandedPatient === p.id}
                onToggle={() =>
                  setExpandedPatient(expandedPatient === p.id ? null : p.id)
                }
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Follow-up Queue" count={followups.length} />
          <div style={{ display: "grid", gap: 10 }}>
            {followups.length === 0 && (
              <Card
                style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}
              >
                All follow-ups resolved. Nice work.
              </Card>
            )}
            {followups.map((f) => (
              <FollowUpItem
                key={f.id}
                f={f}
                onClick={() => (f.level === "escalate" ? openEscalation(f) : undefined)}
              />
            ))}
            <Card
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: C.greenLight,
                borderColor: C.greenBorder,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: C.green,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {Icon.check(15)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.greenDark }}>
                  {resolvedCount} recovered this week
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Auto-closed or doctor-approved
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
