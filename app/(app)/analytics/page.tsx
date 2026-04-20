"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Pill } from "@/components/atoms";
import { PageHeader } from "@/components/app-shell/page-header";
import { CORRECTIONS_LOG, TOP_DIAGNOSES } from "@/lib/data";
import { C } from "@/lib/tokens";

function BigMetric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <Card style={{ padding: 22 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          color: C.muted,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: tone,
          marginTop: 12,
          letterSpacing: -1.2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.hint, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function TriageChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);
  const rows = [
    { label: "Consilium GLM", pct: 94, tone: C.green, sub: "94% correct · 150 scenarios" },
    { label: "Keyword baseline", pct: 63, tone: C.muted, sub: "Collapses on ambiguous replies" },
  ];
  return (
    <Card style={{ padding: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Triage accuracy</div>
        <Pill tone="green">+31 pts</Pill>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 26 }}>
        GLM vs keyword matching, validated on 150 synthetic owner replies
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: r.tone,
                  letterSpacing: -0.5,
                }}
              >
                {r.pct}%
              </div>
            </div>
            <div
              style={{
                height: 14,
                borderRadius: 999,
                background: "#F3F2EF",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: r.tone,
                  width: mounted ? `${r.pct}%` : "0%",
                  transition: `width 1100ms cubic-bezier(0.2,0.8,0.2,1) ${i * 160}ms`,
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: C.hint, marginTop: 5 }}>{r.sub}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 24,
          padding: "13px 15px",
          borderRadius: 10,
          background: C.greenLight,
          border: `1px solid ${C.greenBorder}`,
          fontSize: 13,
          color: C.greenDark,
          lineHeight: 1.55,
        }}
      >
        The <b>ambiguous</b> reply category is where keywords collapse — GLM 87% vs keyword 33%.
        That delta is why the model is non-removable.
      </div>
    </Card>
  );
}

function TopDiagnoses() {
  const max = Math.max(...TOP_DIAGNOSES.map((d) => d.count));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <Card style={{ padding: 26 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Top diagnoses
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
        Last 30 days · {TOP_DIAGNOSES.reduce((a, b) => a + b.count, 0)} total consults
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {TOP_DIAGNOSES.map((d, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 5 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.count}</div>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "#F3F2EF",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: i === 0 ? C.green : C.hint,
                  width: mounted ? `${(d.count / max) * 100}%` : "0%",
                  transition: `width 900ms cubic-bezier(0.2,0.8,0.2,1) ${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CorrectionsLog() {
  return (
    <Card style={{ padding: 0 }}>
      <div
        style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Recent corrections</div>
        <div style={{ fontSize: 13, color: C.muted }}>
          Doctor overrides · feed back into prompt per clinic
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: C.hint }}>{CORRECTIONS_LOG.length} this week</div>
      </div>
      <div>
        {CORRECTIONS_LOG.map((r, i) => (
          <div
            key={i}
            style={{
              padding: "16px 22px",
              borderBottom:
                i < CORRECTIONS_LOG.length - 1 ? `1px solid ${C.borderSoft}` : "none",
              display: "grid",
              gridTemplateColumns: "90px 130px 1fr 160px",
              gap: 20,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{r.date}</div>
            <Pill
              tone={
                r.feature === "Triage" ? "red" : r.feature === "Billing" ? "amber" : "neutral"
              }
            >
              {r.feature}
            </Pill>
            <div style={{ minWidth: 0 }}>
              <div
                style={{ fontSize: 13, color: C.muted, textDecoration: "line-through" }}
              >
                GLM: {r.glm}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 500,
                  marginTop: 3,
                }}
              >
                Doctor: {r.fix}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.hint, textAlign: "right" }}>{r.who}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ padding: "0 32px 100px", maxWidth: 1480, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Analytics · April 2026"
        title="Your clinic's numbers."
        sub="Live across all 3 doctors · PawsClinic KL · updates in realtime as cases close."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm">
              Last 30 days
            </Button>
            <Button variant="soft" size="sm" icon={Icon.download(14)}>
              Export CSV
            </Button>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <BigMetric label="Time saved" value="47h" sub="across 3 doctors" tone={C.green} />
        <BigMetric
          label="Billing recovered"
          value="RM 9,240"
          sub="avg 8–12k target"
          tone={C.green}
        />
        <BigMetric
          label="Complications caught"
          value="3"
          sub="2 prevented ER visits"
          tone={C.amber}
        />
        <BigMetric
          label="Follow-up response"
          value="78%"
          sub=">70% target"
          tone={C.green}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          marginBottom: 28,
        }}
      >
        <TriageChart />
        <TopDiagnoses />
      </div>

      <CorrectionsLog />
    </div>
  );
}
