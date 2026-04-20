import type { Tone } from "./tokens";

export type TagColor = "green" | "amber" | "red";

export interface Brief {
  lastVisit: string;
  chronic: string;
  compliance: string;
  pending: string;
  probe: string;
}

export interface Patient {
  id: string;
  time: string;
  name: string;
  species: "Dog" | "Cat";
  breed: string;
  age: string;
  sex: string;
  owner: string;
  ownerPhone: string;
  tag: string;
  tagColor: TagColor;
  reason: string;
  brief: Brief;
}

export type FollowUpLevel = "escalate" | "monitor" | "clear";

export interface Differential {
  cause: string;
  prob: number;
  tone: "red" | "green";
}

export interface FollowUp {
  id: string;
  level: FollowUpLevel;
  patient: string;
  procedure: string;
  owner: string;
  daysPost: number;
  ownerMessage: string;
  differentials?: Differential[];
  recommendation: string;
  draft?: string;
  tsLabel?: string;
}

export interface MetricCardData {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
}

export interface BillingItem {
  item: string;
  price: number;
  flagged: boolean;
  note: string;
}

export interface PrescriptionItem {
  drug: string;
  dose: string;
  dur: string;
  qty: string;
}

export interface TodoItem {
  task: string;
  who: string;
}

export interface SoapNote {
  S: string;
  O: string;
  A: string;
  P: string;
}

export interface ConsultOutput {
  soap: SoapNote;
  prescription: PrescriptionItem[];
  billing: BillingItem[];
  todos: TodoItem[];
}

export interface DiagnosisRow {
  label: string;
  count: number;
}

export interface CorrectionRow {
  date: string;
  feature: "Triage" | "Billing" | "Prescription";
  glm: string;
  fix: string;
  who: string;
}
