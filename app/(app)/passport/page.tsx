"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useMemo } from "react";
import { Button, Card, Dot, Icon, Pill } from "@/components/atoms";
import { PageHeader, SectionTitle } from "@/components/app-shell/page-header";
import { PATIENTS } from "@/lib/data";
import { C } from "@/lib/tokens";

function PassportRow({
  label,
  value,
  sub,
  last,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: last ? "none" : `1px solid ${C.borderSoft}`,
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 18,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: C.muted,
          paddingTop: 2,
        }}
      >
        {label}
      </div>
      <div>
        <div style={{ fontSize: 15, color: C.text, fontWeight: 500 }}>{value}</div>
        {sub && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function QRPlaceholder() {
  const cells = useMemo(() => {
    const arr: number[] = [];
    let seed = 7;
    for (let i = 0; i < 144; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      arr.push(seed / 233280 > 0.48 ? 1 : 0);
    }
    return arr;
  }, []);
  return (
    <div
      style={{
        width: 130,
        height: 130,
        padding: 8,
        borderRadius: 12,
        background: "#fff",
        border: `1px solid ${C.border}`,
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 1,
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{ width: "100%", aspectRatio: "1", background: c ? C.text : "#fff" }}
        />
      ))}
    </div>
  );
}

function PassportContent() {
  const params = useSearchParams();
  const pid = params.get("pid");
  const p = PATIENTS.find((x) => x.id === pid) || PATIENTS[0];

  return (
    <div style={{ padding: "0 32px 100px", maxWidth: 1480, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Pet passport"
        title={`${p.name}'s health passport`}
        sub="Auto-generated after every visit. Shareable via QR — any vet can read it without login. Owner gets a free, always-updated record."
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" icon={Icon.back(14)}>
                Back
              </Button>
            </Link>
            <Button variant="soft" size="sm" icon={Icon.download(14)}>
              Download PDF
            </Button>
            <Button size="sm" icon={Icon.chat(14)}>
              Send to owner
            </Button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 28 }}>
        <Card
          style={{
            padding: 0,
            overflow: "hidden",
            animation: "fadeUp 400ms ease both",
          }}
        >
          <div
            style={{
              padding: "30px 36px",
              background: C.bgAlt,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 18,
                background: C.brandLight,
                color: C.brandDark,
                display: "grid",
                placeItems: "center",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: -0.5,
                border: `1px solid ${C.brandBorder}`,
              }}
            >
              {p.name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: -0.5,
                  }}
                >
                  {p.name}&apos;s Passport
                </div>
                <Pill tone="green">
                  <Dot color={C.green} size={6} /> Verified
                </Pill>
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>
                {p.breed} · {p.age} · {p.sex}
              </div>
              <div style={{ fontSize: 12, color: C.hint, marginTop: 8 }}>
                PawsClinic KL · Updated 20 Apr 2026
              </div>
            </div>
          </div>
          <div style={{ padding: "28px 36px" }}>
            <PassportRow
              label="Vaccinations"
              value={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: C.greenDark,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: C.green }}>{Icon.check(14)}</span> Up to date
                </span>
              }
              sub="Next due: Aug 2026 (DHPP + Lepto annual booster)"
            />
            <PassportRow
              label="Active medications"
              value="Otomax — ear drops, Day 3 of 7"
              sub="Twice daily, right ear. Complete full course."
            />
            <PassportRow
              label="Last diagnosis"
              value="Otitis externa (right ear)"
              sub={
                <span style={{ color: C.greenDark }}>
                  Recovering · responded well to treatment
                </span>
              }
            />
            <PassportRow
              label="Notes for next vet"
              value="Check right ear fully resolved. Owner declined dental cleaning ×2 — continue recommending."
            />
            <PassportRow
              label="Emergency contact"
              value="PawsClinic KL"
              sub="+60 3 6201 8899 · 24h line"
              last
            />
          </div>
        </Card>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <Card style={{ padding: 24, textAlign: "center" }}>
            <SectionTitle title="Share passport" />
            <div style={{ display: "grid", placeItems: "center", padding: "8px 0 16px" }}>
              <QRPlaceholder />
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.55 }}>
              consilium.app/passport/{p.name.toLowerCase()}-4f2a
              <br />
              Any vet can scan this — always current.
            </div>
            <Button variant="soft" size="md" style={{ width: "100%" }}>
              Copy link
            </Button>
          </Card>
          <Card style={{ padding: 20 }}>
            <SectionTitle title="Visit history" />
            {[
              { d: "14 Mar 2026", v: "Otitis externa · Otomax 7d" },
              { d: "02 Jan 2026", v: "Annual wellness · bloods normal" },
              { d: "18 Aug 2025", v: "DHPP + Lepto booster" },
              { d: "30 Apr 2025", v: "Dental declined by owner" },
            ].map((v, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 0",
                  borderTop: i ? `1px solid ${C.borderSoft}` : "none",
                }}
              >
                <div style={{ fontSize: 12, color: C.hint }}>{v.d}</div>
                <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{v.v}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PassportPage() {
  return (
    <Suspense>
      <PassportContent />
    </Suspense>
  );
}
