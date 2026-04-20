import { ApiError, parseTriageRequest } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import type { TriageResponse } from "@/lib/api-types";

const RED_FLAG = [
  "blood",
  "bleeding",
  "swollen",
  "swelling",
  "infected",
  "pus",
  "fever",
  "not moving",
  "won't eat",
  "wont eat",
  "lying there",
  "lethargic",
  "collapse",
  "seizure",
  "vomit",
];
const MONITOR = [
  "soft",
  "a bit quiet",
  "slow",
  "scratching",
  "still a bit",
  "slightly",
  "mild",
];
const CLEAR = [
  "great",
  "fine",
  "normal",
  "active",
  "eating well",
  "back to",
  "playful",
  "perfect",
  "thanks",
  "all good",
];

function classify(msg: string): TriageResponse {
  const lower = msg.toLowerCase();
  const hit = (arr: string[]) => arr.some((k) => lower.includes(k));

  if (hit(RED_FLAG)) {
    return {
      decision: "escalate",
      confidence: 0.62,
      differentials: [
        { cause: "Post-procedure complication", probability: 0.6, tone: "red" },
        { cause: "Normal recovery variability", probability: 0.4, tone: "green" },
      ],
      recommendedAction: "Same-day recheck — photo + temperature first",
      ownerReplyDraft:
        "Thanks for letting us know. Please bring them in today so we can take a look — could you send a photo of the area first, and a temperature reading if you have a thermometer? — PawsClinic KL",
      doctorSummary: "Owner reports concerning symptoms — recommend recheck.",
      source: "mock",
    };
  }
  if (hit(CLEAR) && !hit(MONITOR)) {
    return {
      decision: "clear",
      confidence: 0.92,
      differentials: [
        { cause: "Normal recovery", probability: 0.95, tone: "green" },
      ],
      recommendedAction: "Auto-reassurance, close case",
      ownerReplyDraft:
        "Wonderful news! Keep up the current care plan and reach out if anything changes. — PawsClinic KL",
      doctorSummary: "Owner reports normal recovery — case closed.",
      source: "mock",
    };
  }
  return {
    decision: "monitor",
    confidence: 0.74,
    differentials: [
      { cause: "Slow but expected recovery", probability: 0.7, tone: "green" },
      { cause: "Mild complication", probability: 0.3, tone: "amber" },
    ],
    recommendedAction: "Continue care, check in tomorrow",
    ownerReplyDraft:
      "Thanks for the update — sounds like things are heading the right way. Keep up the current plan and we'll check back in tomorrow. — PawsClinic KL",
    doctorSummary: "Partial recovery — re-check in 24h.",
    source: "mock",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => {
      throw new ApiError(400, "invalid JSON");
    });
    const { message } = parseTriageRequest(body);
    await new Promise((r) => setTimeout(r, 400));
    return json<TriageResponse>(classify(message));
  } catch (err) {
    return errorResponse(err);
  }
}
