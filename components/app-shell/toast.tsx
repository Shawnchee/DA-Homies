"use client";

import { Icon } from "@/components/atoms";
import { C } from "@/lib/tokens";
import { useStore } from "./store";

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        background: C.text,
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "slideIn 220ms ease both",
      }}
    >
      <span style={{ color: C.green }}>{Icon.check(16)}</span>
      {toast}
    </div>
  );
}
