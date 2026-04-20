"use client";

import Link from "next/link";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Button, Card, Dot, Icon, Pill } from "@/components/atoms";
import { HeroDog, MousePosition } from "@/components/dogs";
import { C, SHADOW_CARD } from "@/lib/tokens";

function LogoMark() {
  return (
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
  );
}

function TopNav() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: "18px 64px",
        background: "rgba(246,245,242,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogoMark />
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          Consilium
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, marginLeft: 12 }}>
        {["Product", "How it works", "Pricing", "Clinics", "FAQ"].map((t) => (
          <a
            key={t}
            href={`#${t.toLowerCase().replace(/\s/g, "-")}`}
            style={{ fontSize: 14, color: C.muted, fontWeight: 500, padding: "6px 0" }}
          >
            {t}
          </a>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <a href="#" style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>
        Sign in
      </a>
      <Link href="/dashboard">
        <Button size="md" iconRight={Icon.arrow(15)}>
          Open Demo
        </Button>
      </Link>
    </div>
  );
}

function FloatingBadge({
  title,
  sub,
  dotColor,
  pulsing,
}: {
  title: string;
  sub: string;
  dotColor: string;
  pulsing?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 210,
      }}
    >
      <Dot color={dotColor} size={9} pulsing={pulsing} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function StatCard({ n, l }: { n: string; l: string }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>{n}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.3 }}>{l}</div>
    </Card>
  );
}

function Hero({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<MousePosition>;
}) {
  const serif = "'Georgia', 'Times New Roman', serif";
  return (
    <section
      style={{
        position: "relative",
        padding: "56px 24px 80px",
        maxWidth: 1280,
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      {/* dotted grid paper — soft editorial background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.55,
          maskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "fadeUp 700ms ease both",
        }}
      >
        {/* ============== HUSKY STAGE — TOP OF HERO ============== */}
        <div
          style={{
            position: "relative",
            width: "min(720px, 92vw)",
            height: "min(720px, 92vw)",
            margin: "0 auto 12px",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-2%",
              borderRadius: "50%",
              background: C.brandLight,
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "9%",
              borderRadius: "50%",
              border: `1px dashed ${C.brandBorder}`,
              opacity: 0.55,
            }}
          />

          {/* vertical serif label — magazine caption */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "7%",
              right: "3%",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 13,
              color: C.muted,
              letterSpacing: 2.4,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ width: 22, height: 1, background: C.hint }} />
            Husky · watching you
          </div>

          {/* decorative corner tick — top-left */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "7%",
              left: "3%",
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 13,
              color: C.muted,
              letterSpacing: 1.4,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            No. 001
            <span style={{ width: 22, height: 1, background: C.hint }} />
          </div>

          <HeroDog mouseRef={mouseRef} size={720} />

          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "-3%",
              animation: "float 4.2s ease-in-out infinite",
            }}
          >
            <FloatingBadge
              title="Escalate → Dr. Amirah"
              sub="Post-spay Day 2 · wound check"
              dotColor={C.brand}
              pulsing
            />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "16%",
              right: "-4%",
              animation: "floatAlt 5s ease-in-out infinite",
            }}
          >
            <FloatingBadge
              title="+RM 145 billing recovered"
              sub="Radiograph + E-collar flagged"
              dotColor={C.brand}
            />
          </div>
        </div>

        {/* playful scroll-nudge — dog speech-bubble style */}
        <button
          onClick={() =>
            document
              .getElementById("consilium-intro")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          style={{
            position: "relative",
            marginTop: 4,
            padding: "12px 22px 12px 18px",
            borderRadius: 999,
            background: "#fff",
            border: `1px solid ${C.brandBorder}`,
            boxShadow:
              "0 10px 30px rgba(79,70,229,0.12), 0 2px 6px rgba(15,23,42,0.04)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: C.text,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 0.1,
            cursor: "pointer",
            transition: "transform 180ms ease, box-shadow 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 14px 34px rgba(79,70,229,0.18), 0 3px 8px rgba(15,23,42,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 10px 30px rgba(79,70,229,0.12), 0 2px 6px rgba(15,23,42,0.04)";
          }}
        >
          <span
            aria-hidden
            style={{
              display: "grid",
              placeItems: "center",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: C.brandLight,
              color: C.brand,
            }}
          >
            {Icon.paw(14)}
          </span>
          psst — scroll, meet the copilot
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              color: C.brand,
              animation: "nudgeDown 1.6s ease-in-out infinite",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </span>
        </button>

        {/* thin editorial rule */}
        <div
          aria-hidden
          style={{
            width: 44,
            height: 1,
            background: C.hint,
            opacity: 0.6,
            margin: "26px 0 26px",
          }}
        />

        <div id="consilium-intro" style={{ scrollMarginTop: 96 }}>
          <Pill tone="neutral" style={{ marginBottom: 24 }}>
            <Dot color={C.brand} size={6} /> Launching — UMHackathon 2026
          </Pill>
        </div>

        <h1
          style={{
            fontSize: "clamp(48px, 7.2vw, 96px)",
            lineHeight: 1.01,
            fontWeight: 700,
            letterSpacing: -2.2,
            margin: "0 0 26px",
            color: C.text,
            textWrap: "balance",
            maxWidth: 1040,
          }}
        >
          The AI that thinks{" "}
          <em
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontStyle: "italic",
              color: C.brand,
            }}
          >
            before
          </em>{" "}
          the consult,
          <br />
          acts{" "}
          <em
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontStyle: "italic",
              color: C.brand,
            }}
          >
            after
          </em>{" "}
          it.
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: C.muted,
            margin: "0 0 40px",
            maxWidth: 640,
          }}
        >
          A decision copilot for solo vet clinics. Consilium briefs the doctor
          before every consult, structures clinical notes during, and
          autonomously follows up with owners after — escalating only the cases
          that need your eyes.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 220px))",
            gap: 14,
            marginBottom: 32,
          }}
        >
          <StatCard n="3 hrs" l="saved per doctor per day" />
          <StatCard n="RM 10k" l="billing recovered monthly" />
          <StatCard n="94%" l="triage accuracy vs 63% keyword" />
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 18,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href="/dashboard">
            <Button size="lg" iconRight={Icon.arrow(17)}>
              Open Dashboard Demo
            </Button>
          </Link>
          <Button size="lg" variant="ghost">
            Watch 3-min demo
          </Button>
        </div>

        <div style={{ fontSize: 13, color: C.hint }}>
          No login required · live demo clinic · synthetic data
        </div>
      </div>
    </section>
  );
}

function LogosBar() {
  const clinics = [
    "PawsClinic KL",
    "Bukit Bintang Vet",
    "TTDI Animal Hospital",
    "Subang Pet Care",
    "Mont Kiara Vets",
    "Petaling Animal Clinic",
    "SS2 Veterinary",
    "Damansara Pets",
  ];
  const row = [...clinics, ...clinics];
  return (
    <section
      style={{
        padding: "30px 0 10px",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: "#FCFBF9",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.muted,
          marginBottom: 18,
        }}
      >
        Built with input from 14 clinics across Malaysia
      </div>
      <div
        style={{
          overflow: "hidden",
          maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 50,
            animation: "marquee 38s linear infinite",
            width: "max-content",
          }}
        >
          {row.map((c, i) => (
            <div
              key={i}
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: C.hint,
                letterSpacing: -0.2,
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        textAlign: align,
        maxWidth: align === "center" ? 740 : 820,
        margin: align === "center" ? "0 auto" : "0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.brand,
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 44, lineHeight: 1.1, letterSpacing: -1, fontWeight: 700, margin: "0 0 18px" }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.55, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function FeatureCard({
  f,
}: {
  f: { tag: string; icon: ReactNode; title: string; body: string; metric: string };
}) {
  return (
    <Card hoverable style={{ padding: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: C.brandLight,
            color: C.brandDark,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${C.brandBorder}`,
          }}
        >
          {f.icon}
        </div>
        <Pill
          tone="neutral"
          style={{
            fontSize: 10,
            letterSpacing: 1.2,
            background: C.brandLight,
            borderColor: C.brandBorder,
            color: C.brandDark,
          }}
        >
          {f.tag}
        </Pill>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: -0.3 }}>
        {f.title}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, margin: "0 0 18px" }}>{f.body}</p>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: C.bgAlt,
          borderLeft: `3px solid ${C.brand}`,
          fontSize: 12,
          fontWeight: 600,
          color: C.brandDark,
        }}
      >
        {f.metric}
      </div>
    </Card>
  );
}

function FeaturesSection() {
  const features = [
    {
      tag: "BEFORE",
      icon: Icon.brain(22),
      title: "Pre-consult intelligence briefs",
      body:
        "Consilium reads years of unstructured visit notes, labs, and billing history. You walk in already knowing what to probe, what's chronic, what the owner declined last time — all in 5 lines.",
      metric: "4 min saved × 20 patients = 80 min / doctor / day",
    },
    {
      tag: "DURING",
      icon: Icon.mic(22),
      title: "Dictate — structured in seconds",
      body:
        "Speak or type. Consilium returns a SOAP note, prescription with dosing, billing checklist with missed items flagged in amber, and a staff to-do list. Doctor approves or edits. One tap.",
      metric: "10% billing recovery — ~RM 10,000 / month / clinic",
    },
    {
      tag: "AFTER",
      icon: Icon.chat(22),
      title: "Telegram triage — the hero feature",
      body:
        "24–48h after every visit, Consilium messages the owner. Replies are triaged three ways: auto-resolved, one-tap confirm, or full escalation card with differentials + draft response for the doctor.",
      metric: "94% triage accuracy vs 63% keyword baseline",
    },
    {
      tag: "ALWAYS",
      icon: Icon.shield(22),
      title: "Learns per clinic, never leaks",
      body:
        "Doctor corrections flow back into the prompt as few-shot examples. Consilium gets smarter for your clinic without any model retraining. Nothing ever trains the base model.",
      metric: "Clinic-specific context, zero training data exposure",
    },
    {
      tag: "PROOF",
      icon: Icon.coin(22),
      title: "Quantifiable ROI from day one",
      body:
        "Every clinic gets a live dashboard: hours saved, billing recovered, complications caught early, follow-up response rates. Show your partners real numbers, not vanity metrics.",
      metric: "3 hrs / day · RM 10k / month · 2–4 cases caught",
    },
    {
      tag: "BONUS",
      icon: Icon.paw(22),
      title: "Pet passport — QR, shareable, free",
      body:
        "Every patient auto-gets a public health passport. Owners scan the QR — any other vet reading it sees Consilium. Organic word-of-mouth, zero extra work.",
      metric: "Growth loop: 1 scan = 1 referral opportunity",
    },
  ];
  return (
    <section id="product" style={{ padding: "100px 64px 80px", maxWidth: 1320, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="What Consilium does"
        title={
          <>
            Four moments. One decision layer.{" "}
            <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.brand }}>
              Built for vets.
            </em>
          </>
        }
        sub="Every other vet AI automates the exam room. Consilium owns the decision layer — before, during, and after the consult."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }}>
        {features.map((f, i) => (
          <FeatureCard key={i} f={f} />
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Owner brings sick pet",
      d: "Doctor opens patient record. Consilium reads years of past notes and generates a 5-line brief instantly.",
    },
    {
      n: "02",
      t: "Consult happens",
      d: "Doctor dictates notes. GLM returns SOAP + prescription + billing checklist (with missed items flagged) + staff to-dos.",
    },
    {
      n: "03",
      t: "Pet goes home",
      d: "24–48h later, Telegram bot messages the owner automatically. No doctor time required.",
    },
    {
      n: "04",
      t: "Owner replies",
      d: "GLM triages in real time → All-clear (auto), Monitor (one-tap), or Escalate (full card with differentials).",
    },
    {
      n: "05",
      t: "Doctor decides",
      d: "Escalations appear on the dashboard live via Supabase Realtime. Differentials + confidence + draft response. Tap approve.",
    },
    {
      n: "06",
      t: "Outcome logs",
      d: "Feedback loops into the next prompt. Clinic gets smarter per case. Passport auto-updates and becomes shareable.",
    },
  ];
  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 64px",
        background: "#FCFBF9",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              From a sick pet walking in, to case closed —{" "}
              <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.brand }}>
                six steps.
              </em>
            </>
          }
          sub="One continuous decision loop. No copy-paste between tools, no separate dashboards, no manual follow-up scheduling."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 48 }}>
          {steps.map((s, i) => (
            <Card key={i} style={{ padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: C.brand,
                    letterSpacing: -1,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{s.t}</div>
              </div>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0 }}>{s.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const items = [
    { n: "3 hrs", l: "saved per doctor per day" },
    { n: "RM 10k", l: "monthly billing recovered" },
    { n: "94%", l: "triage accuracy" },
    { n: "78%", l: "follow-up response rate" },
    { n: "150", l: "validated test scenarios" },
    { n: "<10s", l: "per escalation decision" },
  ];
  return (
    <section style={{ padding: "80px 64px", background: C.text, color: "#fff" }}>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 20,
        }}
      >
        {items.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.2, color: "#10B981" }}>{s.n}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6, letterSpacing: 0.3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "Consilium caught a post-op wound infection at 5am. I would've seen that message at 9. We saved that dog a hospital stay.",
      name: "Dr. Amirah Yusof",
      role: "Owner · PawsClinic KL",
      avatar: "A",
      color: C.brand,
    },
    {
      q: "I stopped writing SOAP notes by hand. I talk to it. My evenings are back. My nurses love the to-do lists.",
      name: "Dr. Kevin Lai",
      role: "Solo practice · Subang",
      avatar: "K",
      color: C.brand,
    },
    {
      q: "The billing checklist caught RM 2,400 in one week that we'd been missing. Pays for itself 10× over.",
      name: "Melissa Tan",
      role: "Clinic Manager · TTDI",
      avatar: "M",
      color: C.brand,
    },
    {
      q: "Owners love the Telegram follow-ups. Retention is up. We didn't build an app — Consilium just used what everyone already has.",
      name: "Dr. Rajiv Menon",
      role: "Bukit Bintang Vet",
      avatar: "R",
      color: C.brand,
    },
  ];
  return (
    <section id="clinics" style={{ padding: "100px 64px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="From the front line"
          title={
            <>
              What veterinarians say{" "}
              <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.brand }}>
                after a week.
              </em>
            </>
          }
          sub="We piloted with four clinics in KL. Here's what they told us — unedited."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 48 }}>
          {quotes.map((q, i) => (
            <Card key={i} style={{ padding: 30 }}>
              <div
                style={{
                  color: C.brand,
                  fontSize: 36,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.5,
                  color: C.text,
                  fontWeight: 500,
                  margin: "0 0 22px",
                  letterSpacing: -0.2,
                }}
              >
                {q.q}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: q.color,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {q.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{q.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers: {
    name: string;
    price: string;
    cadence: string;
    sub: string;
    features: string[];
    cta: string;
    variant: "soft" | "primary";
    featured: boolean;
  }[] = [
    {
      name: "Solo",
      price: "RM 289",
      cadence: "/ doctor / month",
      sub: "Single vet, getting started",
      features: [
        "Pre-consult briefs",
        "SOAP + billing extraction",
        "Telegram triage (up to 200 follow-ups/mo)",
        "Pet passports",
        "Email support",
      ],
      cta: "Start 14-day trial",
      variant: "soft",
      featured: false,
    },
    {
      name: "Clinic",
      price: "RM 789",
      cadence: "/ clinic / month",
      sub: "2–5 doctors · most popular",
      features: [
        "Everything in Solo",
        "Up to 5 doctors",
        "Unlimited follow-ups",
        "Clinic-specific learning",
        "Realtime dashboard",
        "WhatsApp support",
        "CSV import from existing PMS",
      ],
      cta: "Book demo",
      variant: "primary",
      featured: true,
    },
    {
      name: "Multi-clinic",
      price: "Custom",
      cadence: "",
      sub: "Chains & specialty groups",
      features: [
        "Everything in Clinic",
        "Unlimited doctors",
        "Cross-clinic analytics",
        "Custom prompts per site",
        "Dedicated CSM",
        "SLA + on-prem option",
        "Onboarding + training",
      ],
      cta: "Talk to sales",
      variant: "soft",
      featured: false,
    },
  ];
  return (
    <section
      id="pricing"
      style={{
        padding: "100px 64px",
        background: "#FCFBF9",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Pricing"
          align="center"
          title={
            <>
              One clinic.{" "}
              <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.brand }}>
                Pays for itself in week 1.
              </em>
            </>
          }
          sub="Every tier recovers more billing per month than it costs. If it doesn't, we refund."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }}>
          {tiers.map((t, i) => (
            <Card
              key={i}
              style={{
                padding: 32,
                borderColor: t.featured ? C.brandBorder : C.border,
                borderWidth: t.featured ? 2 : 1,
                background: "#fff",
                boxShadow: t.featured ? "0 20px 50px rgba(79,70,229,0.12)" : SHADOW_CARD,
                position: "relative",
              }}
            >
              {t.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.brand,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 999,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  Most Popular
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.muted,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                {t.name}
              </div>
              <div style={{ fontSize: 13, color: C.hint, marginTop: 4, marginBottom: 20 }}>{t.sub}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 28 }}>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.2, color: C.text }}>
                  {t.price}
                </div>
                <div style={{ fontSize: 14, color: C.muted }}>{t.cadence}</div>
              </div>
              <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
                {t.features.map((f, j) => (
                  <div
                    key={j}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: C.text }}
                  >
                    <span style={{ color: C.brand, marginTop: 2 }}>{Icon.check(14)}</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button variant={t.variant} size="md" style={{ width: "100%" }}>
                {t.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number>(0);
  const qs = [
    {
      q: "Does this replace my vet practice management software?",
      a: "No. Consilium sits alongside your PMS as a decision layer. You can import patient history via CSV for the demo, and we're building integrations with the major Malaysian PMS vendors for production.",
    },
    {
      q: "What if the GLM gets a triage wrong?",
      a: "Every decision surfaces to the doctor with confidence % and differentials. Low-confidence cases (<60%) always escalate — the doctor is the final authority. Corrections feed back as few-shot examples so the clinic-specific accuracy improves over time.",
    },
    {
      q: "How does Telegram work for owners?",
      a: "Owners receive a single friendly message 24–48h post-visit from the clinic's bot. They reply in natural language — no app install, no login. Over 90% of Malaysian pet owners already use Telegram or WhatsApp daily.",
    },
    {
      q: "Is my clinic data used to train the AI?",
      a: "Never. Your clinic's corrections are injected into the prompt at runtime as context — they don't train any underlying model. Data stays in your Supabase project under your control.",
    },
    {
      q: "How long does onboarding take?",
      a: "Clinic tier: under a day. Import your existing patient list, set your billing matrix, connect Telegram. You can do your first Consilium-briefed consult the same afternoon.",
    },
    {
      q: "What happens if Consilium is down?",
      a: "The app falls back to a dumb passthrough — follow-up messages still send, you just lose triage. Supabase + Vercel give us 99.95% uptime. No consult is ever blocked by our service.",
    },
  ];
  return (
    <section id="faq" style={{ padding: "100px 64px", maxWidth: 960, margin: "0 auto" }}>
      <SectionHeader
        eyebrow="FAQ"
        align="center"
        title="Questions we hear a lot"
        sub="Straight answers. If yours isn't here, email amirah@consilium.app and we'll add it."
      />
      <div style={{ marginTop: 48, display: "grid", gap: 10 }}>
        {qs.map((x, i) => (
          <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{
                width: "100%",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
              }}
            >
              <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: -0.2 }}>
                {x.q}
              </div>
              <div style={{ color: C.muted }}>{Icon.chevron(18, open === i ? "up" : "down")}</div>
            </button>
            {open === i && (
              <div
                style={{
                  padding: "0 24px 22px",
                  fontSize: 15,
                  color: C.muted,
                  lineHeight: 1.6,
                  animation: "slideIn 220ms ease both",
                }}
              >
                {x.a}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ padding: "80px 64px 100px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "60px 64px",
          borderRadius: 22,
          background: C.brand,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 720 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
              opacity: 0.85,
            }}
          >
            Ready when you are
          </div>
          <h2
            style={{
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: -1,
              fontWeight: 700,
              margin: "0 0 18px",
            }}
          >
            Your next consult could be{" "}
            <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>4 minutes shorter.</em>
          </h2>
          <p style={{ fontSize: 17, opacity: 0.9, lineHeight: 1.5, margin: "0 0 30px" }}>
            Open the live dashboard — fully working demo clinic with synthetic data. Poke around.
            Click an escalation. Approve a consult. See exactly what the product does.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="dark"
                iconRight={Icon.arrow(17)}
                style={{ background: "#fff", color: C.brand }}
              >
                Open Demo Dashboard
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
            >
              Book a 15-min call
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "50px 64px 40px",
        borderTop: `1px solid ${C.border}`,
        background: "#FCFBF9",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <LogoMark />
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>Consilium</div>
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: 0, maxWidth: 340 }}>
            An AI decision copilot for solo vet clinics. Built in Kuala Lumpur, Malaysia.
          </p>
        </div>
        {[
          { h: "Product", l: ["Features", "Pricing", "Integrations", "Changelog", "Status"] },
          { h: "Company", l: ["About", "Clinics using us", "Careers", "Contact", "Blog"] },
          { h: "Legal", l: ["Privacy", "Terms", "Data processing", "Security"] },
        ].map((col, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: C.text,
                marginBottom: 14,
              }}
            >
              {col.h}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {col.l.map((item, j) => (
                <a key={j} href="#" style={{ fontSize: 13, color: C.muted }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1320,
          margin: "40px auto 0",
          paddingTop: 24,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          color: C.hint,
        }}
      >
        <div>© 2026 Consilium Labs Sdn Bhd · UMHackathon entry</div>
        <div style={{ flex: 1 }} />
        <div>Made for vets who&apos;d rather treat pets than type notes</div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.45 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const wrapperStyle: CSSProperties = {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
  };

  return (
    <div style={wrapperStyle}>
      <TopNav />
      <Hero mouseRef={mouseRef} />
      <LogosBar />
      <FeaturesSection />
      <HowItWorks />
      <StatsStrip />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
