export const C = {
  bg: "#F5F3EE",
  bgAlt: "#FBFAF6",
  card: "#FFFFFF",
  border: "#E8E6E0",
  borderSoft: "#EFEDE8",

  brand: "#4F46E5",
  brandDark: "#3730A3",
  brandLight: "#EEF2FF",
  brandBorder: "#C7D2FE",
  brandGlow: "#818CF8",

  green: "#059669",
  greenDark: "#047857",
  greenLight: "#ECFDF5",
  greenBorder: "#A7F3D0",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  amberBorder: "#FDE68A",
  red: "#DC2626",
  redLight: "#FEF2F2",
  redBorder: "#FECACA",

  text: "#0F172A",
  muted: "#64748B",
  hint: "#94A3B8",
  ink: "#1E293B",
} as const;

export const SHADOW_CARD = "0 1px 3px rgba(15,23,42,0.04)";
export const SHADOW_CARD_H =
  "0 6px 20px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)";
export const SHADOW_CTA = "0 8px 24px rgba(79,70,229,0.28)";
export const SHADOW_CTA_H = "0 10px 30px rgba(79,70,229,0.38)";

export type Tone = "green" | "amber" | "red" | "neutral";
