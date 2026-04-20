"use client";

import { ReactNode } from "react";
import { C } from "@/lib/tokens";

export function PageHeader({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "40px 0 28px",
        display: "flex",
        alignItems: "flex-end",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: C.brand,
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: -0.8,
            margin: "0 0 8px",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
        {sub && <div style={{ fontSize: 15, color: C.muted, maxWidth: 680 }}>{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function SectionTitle({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.4,
          margin: 0,
          color: C.muted,
        }}
      >
        {title}
      </h3>
      {count != null && <span style={{ fontSize: 12, color: C.hint }}>{count}</span>}
      <div style={{ flex: 1 }} />
      {action}
    </div>
  );
}

export function PetAvatar({ name }: { name: string; species?: "Dog" | "Cat" }) {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: C.brandLight,
        color: C.brandDark,
        display: "grid",
        placeItems: "center",
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: -0.3,
        flexShrink: 0,
        border: `1px solid ${C.brandBorder}`,
      }}
    >
      {name[0]?.toUpperCase() ?? "·"}
    </div>
  );
}

export function BriefRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        padding: "5px 0",
      }}
    >
      <div style={{ color: C.muted, fontSize: 13, fontWeight: 500 }}>{k}:</div>
      <div style={{ fontSize: 14, color: C.text }}>{v}</div>
    </div>
  );
}
