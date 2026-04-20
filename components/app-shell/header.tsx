"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dot, Icon, Pill } from "@/components/atoms";
import { C, SHADOW_CARD } from "@/lib/tokens";
import { useStore } from "./store";

export default function Header() {
  const pathname = usePathname();
  const { followups } = useStore();
  const urgentCount = followups.filter((f) => f.level === "escalate").length;

  const tabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/consult", label: "Consult" },
    { href: "/analytics", label: "Analytics" },
    { href: "/passport", label: "Passports" },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(246,245,242,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: C.brand,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 6px 14px rgba(79,70,229,0.28)",
          }}
        >
          <span style={{ color: "#fff", display: "grid", placeItems: "center" }}>
            {Icon.paw(18)}
          </span>
        </div>
        <div
          style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}
        >
          Consilium
        </div>
      </Link>
      <div style={{ display: "flex", gap: 4, marginLeft: 20 }}>
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href}>
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: active ? "#fff" : "transparent",
                  border: `1px solid ${active ? C.border : "transparent"}`,
                  boxShadow: active ? SHADOW_CARD : "none",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? C.text : C.muted,
                  transition: "all 140ms ease",
                }}
              >
                {t.label}
              </button>
            </Link>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      {urgentCount > 0 && (
        <Pill tone="red">
          <Dot color={C.red} size={7} pulsing /> {urgentCount} urgent
        </Pill>
      )}
      <div style={{ fontSize: 13, color: C.muted }}>PawsClinic KL · Mon 20 Apr</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. Amirah</div>
          <div style={{ fontSize: 11, color: C.muted }}>Lead veterinarian</div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: C.brand,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            display: "grid",
            placeItems: "center",
          }}
        >
          A
        </div>
      </div>
    </div>
  );
}
