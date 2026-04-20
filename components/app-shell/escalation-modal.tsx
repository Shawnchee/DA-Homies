"use client";

import { useEffect, useState } from "react";
import { Button, Dot, Icon } from "@/components/atoms";
import { C } from "@/lib/tokens";
import type { Differential } from "@/lib/types";
import { useStore } from "./store";

function DifferentialBar({
  d,
  delay,
  mounted,
}: {
  d: Differential;
  delay: number;
  mounted: boolean;
}) {
  const tone = d.tone === "red" ? C.red : C.green;
  const toneBg = d.tone === "red" ? C.redLight : C.greenLight;
  const pct = Math.round(d.prob * 100);
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "13px 16px",
        background: C.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <Dot color={tone} size={8} />
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>{d.cause}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: tone, letterSpacing: -0.3 }}>{pct}%</div>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: toneBg, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: tone,
            width: mounted ? `${pct}%` : "0%",
            transition: `width 900ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function EscalationModal() {
  const { escalation, closeEscalation, approveEscalation } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!escalation) return;
    const t = setTimeout(() => setMounted(true), 10);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEscalation();
    };
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
      setMounted(false);
    };
  }, [escalation, closeEscalation]);

  if (!escalation) return null;
  const f = escalation;

  return (
    <div
      onClick={closeEscalation}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(17,24,39,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        animation: "backdropIn 220ms ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 18,
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          animation: "modalIn 320ms cubic-bezier(0.2,0.8,0.2,1) both",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            padding: "24px 28px 18px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Dot color={C.red} size={12} pulsing />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.red,
              }}
            >
              Escalation Required
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.text,
                marginTop: 3,
                letterSpacing: -0.3,
              }}
            >
              {f.patient} · {f.procedure}
            </div>
          </div>
          <button
            onClick={closeEscalation}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "transparent",
              color: C.muted,
              border: `1px solid ${C.border}`,
              fontSize: 18,
              display: "grid",
              placeItems: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "baseline" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Owner message · {f.tsLabel}
            </div>
            <div style={{ fontSize: 12, color: C.hint }}>via Telegram</div>
          </div>
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "#FCFBF9",
              borderLeft: `3px solid ${C.red}`,
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.5,
              color: C.ink,
              marginBottom: 24,
            }}
          >
            &ldquo;{f.ownerMessage}&rdquo;
            <div style={{ fontSize: 11, fontStyle: "normal", color: C.muted, marginTop: 8 }}>
              — {f.owner}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Differential diagnoses · GLM confidence
          </div>
          <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
            {(f.differentials || []).map((d, i) => (
              <DifferentialBar key={i} d={d} delay={100 + i * 120} mounted={mounted} />
            ))}
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: C.amberLight,
              border: `1px solid ${C.amberBorder}`,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ color: C.amber }}>{Icon.warn(14)}</span>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: C.amber,
                  textTransform: "uppercase",
                }}
              >
                Recommended action
              </div>
            </div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>
              {f.recommendation}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 8,
            }}
          >
            Draft response · ready to send
          </div>
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "#F7F9FC",
              border: `1px solid ${C.border}`,
              fontSize: 14,
              lineHeight: 1.55,
              color: C.ink,
              marginBottom: 20,
              whiteSpace: "pre-wrap",
            }}
          >
            {f.draft}
          </div>
        </div>

        <div
          style={{
            padding: "18px 28px 24px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "#FCFBF9",
          }}
        >
          <Button variant="soft" size="md" icon={Icon.edit(14)}>
            Edit
          </Button>
          <Button variant="soft" size="md" icon={Icon.phone(14)}>
            Call Owner
          </Button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: C.muted, marginRight: 6 }}>
            Approving logs feedback · auto-sends via Telegram
          </div>
          <Button size="md" onClick={approveEscalation} icon={Icon.check(15)}>
            Approve &amp; Send
          </Button>
        </div>
      </div>
    </div>
  );
}
