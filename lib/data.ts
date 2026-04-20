import type {
  Patient,
  FollowUp,
  MetricCardData,
  ConsultOutput,
  DiagnosisRow,
  CorrectionRow,
} from "./types";

export const PATIENTS: Patient[] = [
  {
    id: "p1",
    time: "09:00",
    name: "Milo",
    species: "Dog",
    breed: "Golden Retriever",
    age: "4yo",
    sex: "Male (neutered)",
    owner: "Aisyah Rahman",
    ownerPhone: "+60 12 345 6789",
    tag: "Follow-up",
    tagColor: "amber",
    reason: "Ear recheck + vaccine due",
    brief: {
      lastVisit: "14 Mar — Otitis externa (right), responded well to Otomax",
      chronic: "None",
      compliance: "Owner declined dental recommendation ×2 (2024, 2025)",
      pending: "Annual vaccine overdue by 6 weeks (DHPP + Lepto)",
      probe: "Check if right ear condition fully resolved — re-examine canal",
    },
  },
  {
    id: "p2",
    time: "09:30",
    name: "Luna",
    species: "Cat",
    breed: "British Shorthair",
    age: "2yo",
    sex: "Female (spayed)",
    owner: "Daniel Tan",
    ownerPhone: "+60 16 778 2310",
    tag: "New patient",
    tagColor: "green",
    reason: "Not eating for 2 days",
    brief: {
      lastVisit: "First visit — no prior records in system",
      chronic: "Unknown — first visit",
      compliance: "N/A",
      pending: "Intake exam, FIV/FeLV, weight baseline",
      probe: "Appetite + dental inspection — rule out oral pain first",
    },
  },
  {
    id: "p3",
    time: "10:00",
    name: "Rex",
    species: "Dog",
    breed: "German Shepherd",
    age: "7yo",
    sex: "Male (intact)",
    owner: "Priya Subramaniam",
    ownerPhone: "+60 19 234 5566",
    tag: "Post-op Day 3",
    tagColor: "red",
    reason: "CCL repair recheck",
    brief: {
      lastVisit: "17 Apr — Right stifle CCL repair (TPLO), uncomplicated",
      chronic: "Mild hip dysplasia (bilateral, Meloxicam PRN)",
      compliance: "Excellent — always on time, follows instructions",
      pending: "Suture check today, radiograph in 6 weeks",
      probe: "Incision site, weight-bearing, icing compliance",
    },
  },
  {
    id: "p4",
    time: "10:45",
    name: "Mochi",
    species: "Dog",
    breed: "Shih Tzu",
    age: "9yo",
    sex: "Female (spayed)",
    owner: "Lim Wei Ming",
    ownerPhone: "+60 17 889 0022",
    tag: "Chronic care",
    tagColor: "amber",
    reason: "Skin — recurrent hotspot",
    brief: {
      lastVisit: "02 Apr — Pyoderma L flank, Cephalexin 7d — cleared",
      chronic: "Atopic dermatitis (3 recurrences in 8 months)",
      compliance: "Inconsistent — stops topical once itch subsides",
      pending: "Apoquel trial discussion, allergy workup",
      probe: "Seasonal pattern? Diet? Long-term Apoquel vs referral",
    },
  },
  {
    id: "p5",
    time: "11:15",
    name: "Bella",
    species: "Cat",
    breed: "Domestic Shorthair",
    age: "12yo",
    sex: "Female (spayed)",
    owner: "Hafiz Ismail",
    ownerPhone: "+60 13 556 9988",
    tag: "Senior wellness",
    tagColor: "green",
    reason: "Weight loss + PU/PD",
    brief: {
      lastVisit: "11 Feb — Senior panel, BUN slightly elevated (32)",
      chronic: "Early CKD suspected — IRIS 2",
      compliance: "Good — diet switched to k/d as recommended",
      pending: "Renal recheck, USG + UPC, BP",
      probe: "Rule out hyperthyroidism (T4), repeat chem + urine",
    },
  },
];

export const INITIAL_FOLLOWUPS: FollowUp[] = [
  {
    id: "f1",
    level: "escalate",
    patient: "Milo",
    procedure: "Post-spay Day 2",
    owner: "Aisyah Rahman",
    daysPost: 2,
    ownerMessage:
      "She's been lying there and won't touch her food since morning. The wound looks a bit red too.",
    differentials: [
      { cause: "Normal post-anaesthesia recovery", prob: 0.65, tone: "green" },
      { cause: "Early wound infection", prob: 0.35, tone: "red" },
    ],
    recommendation:
      "Bring in today for wound check — photo + temp reading first if possible",
    draft:
      "Hi Aisyah, thank you for the update. Based on what you're describing, we'd like to see Milo today for a quick wound check. Before you come in, could you send a clear photo of the incision and, if you have a thermometer, take her temperature? We can fit you in at 2:30pm. — PawsClinic KL",
    tsLabel: "12 min ago",
  },
  {
    id: "f2",
    level: "escalate",
    patient: "Coco",
    procedure: "Dental — Day 1 post-op",
    owner: "Sarah Goh",
    daysPost: 1,
    ownerMessage:
      "He's drooling a lot of blood and I can see his gum is really swollen on the left. Is this normal? He won't let me near his mouth.",
    differentials: [
      {
        cause: "Extraction socket breakdown / infection",
        prob: 0.72,
        tone: "red",
      },
      { cause: "Normal post-op oozing", prob: 0.28, tone: "green" },
    ],
    recommendation:
      "Same-day recheck — likely needs socket re-examination under sedation",
    draft:
      "Hi Sarah, that level of bleeding and swelling on Day 1 isn't something we want to wait on. Please bring Coco in today — we can see him at 3:15pm. Do not give any food or water in the 2 hours before coming. — PawsClinic KL",
    tsLabel: "38 min ago",
  },
  {
    id: "f3",
    level: "monitor",
    patient: "Biscuit",
    procedure: "GI upset — Day 3",
    owner: "James Lee",
    daysPost: 3,
    ownerMessage:
      "Stool is firmer today, still a bit soft. Appetite back to normal. Drinking well.",
    recommendation: "Continue bland diet 2 more days, transition slowly to normal",
  },
  {
    id: "f4",
    level: "monitor",
    patient: "Pepper",
    procedure: "Ear infection — Day 5",
    owner: "Nadia Osman",
    daysPost: 5,
    ownerMessage:
      "Scratching less but still a bit. No smell anymore. Finished 5 of 7 days of drops.",
    recommendation: "Complete full course, recheck in 10 days",
  },
  {
    id: "f5",
    level: "clear",
    patient: "Tofu",
    procedure: "Vaccine — Day 2",
    owner: "Marcus Chen",
    daysPost: 2,
    ownerMessage: "All good! Back to his crazy self, eating like a horse. Thanks doc!",
    recommendation: "Auto-reply sent, case closed",
  },
];

export const MONTH_METRICS: MetricCardData[] = [
  { label: "Time saved", value: "47h", sub: "this month", tone: "green" },
  {
    label: "Billing recovered",
    value: "RM 9,240",
    sub: "vs avg 8–12k target",
    tone: "green",
  },
  {
    label: "Complications caught",
    value: "3",
    sub: "2 prevented ER",
    tone: "amber",
  },
  { label: "Follow-up response", value: "78%", sub: ">70% target", tone: "green" },
];

export const GLM_CONSULT_OUTPUT: ConsultOutput = {
  soap: {
    S: "Owner reports limping on right hind for 2 weeks, worsening after stairs. No trauma witnessed. Appetite normal.",
    O: "BW 32.4kg. BCS 6/9. Pain on right stifle palpation, mild effusion. Positive cranial drawer (partial). T 38.6°C, HR 96, RR 24.",
    A: "Suspected partial cranial cruciate ligament tear, right stifle. Differential: meniscal injury, early OA.",
    P: "Radiograph R stifle (lateral + caudocranial). Strict rest ×14d. Meloxicam 0.1mg/kg SID ×7d. E-collar. Recheck in 7d.",
  },
  prescription: [
    {
      drug: "Meloxicam 1.5 mg/mL oral susp.",
      dose: "0.1 mg/kg PO SID",
      dur: "7 days",
      qty: "20 mL",
    },
    {
      drug: "Gabapentin 100 mg capsules",
      dose: "10 mg/kg PO BID",
      dur: "7 days",
      qty: "14 caps",
    },
  ],
  billing: [
    { item: "Consultation fee", price: 50, flagged: false, note: "" },
    { item: "Meloxicam dispensed (20mL)", price: 35, flagged: false, note: "" },
    { item: "Gabapentin dispensed (14)", price: 42, flagged: false, note: "" },
    {
      item: "Radiograph R stifle (2 views)",
      price: 120,
      flagged: true,
      note: "Mentioned in notes, not yet billed",
    },
    {
      item: "E-collar (size L)",
      price: 25,
      flagged: true,
      note: "Recommended, not yet billed",
    },
  ],
  todos: [
    { task: "Book radiograph appointment (same visit)", who: "Reception" },
    { task: "Prepare discharge instructions", who: "Nurse" },
    { task: "Schedule follow-up in 7 days", who: "Reception" },
    { task: "Send vaccine reminder — overdue", who: "Telegram bot" },
  ],
};

export const TOP_DIAGNOSES: DiagnosisRow[] = [
  { label: "Otitis externa", count: 38 },
  { label: "Gastroenteritis", count: 29 },
  { label: "Atopic dermatitis", count: 24 },
  { label: "Dental disease", count: 19 },
  { label: "CCL injury", count: 11 },
];

export const CORRECTIONS_LOG: CorrectionRow[] = [
  {
    date: "18 Apr",
    feature: "Triage",
    glm: "MONITOR",
    fix: "ESCALATE — wound looked infected on photo",
    who: "Dr. Amirah",
  },
  {
    date: "16 Apr",
    feature: "Billing",
    glm: "Missed nail trim",
    fix: "Added RM 15 — performed during consult",
    who: "Dr. Amirah",
  },
  {
    date: "14 Apr",
    feature: "Prescription",
    glm: "Meloxicam 0.2 mg/kg",
    fix: "Reduced to 0.1 mg/kg — senior patient",
    who: "Dr. Amirah",
  },
  {
    date: "12 Apr",
    feature: "Triage",
    glm: "ESCALATE",
    fix: "MONITOR — owner overanxious, normal healing",
    who: "Dr. Amirah",
  },
];
