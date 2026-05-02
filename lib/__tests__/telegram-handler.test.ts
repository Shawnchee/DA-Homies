import { describe, it, expect } from "vitest";
import {
  isTerminalDecision,
  ownerAutoReply,
  type HandleOwnerMessageResult,
} from "../telegram-handler";

describe("telegram-handler — owner-reply formatter", () => {
  it("UT-05a: terminal medical decisions ('escalate') return the holding reply, NOT the AI draft", () => {
    const result: HandleOwnerMessageResult = {
      reply:
        "Bring Leo in immediately — sounds like a urinary obstruction. Call us on the way.",
      decision: "escalate",
      followupId: "fu-1",
      confidence: 0.92,
    };

    expect(isTerminalDecision(result.decision)).toBe(true);

    const sent = ownerAutoReply(result);
    expect(sent).not.toContain("urinary obstruction");
    expect(sent.toLowerCase()).toContain("vet will review");
  });

  it("UT-05b: tool-call (info-gathering) replies are sent verbatim to the owner", () => {
    const result: HandleOwnerMessageResult = {
      reply:
        "Quick question — when was Leo's last meal, and how much did he eat?",
      decision: "awaiting_info",
      followupId: "fu-1",
      toolName: "request_appetite_timeline",
    };

    expect(isTerminalDecision(result.decision)).toBe(false);

    const sent = ownerAutoReply(result);
    expect(sent).toBe(result.reply);
    expect(sent).toContain("last meal");
  });

  it("UT-05c: 'monitor' and 'clear' are also terminal — owner gets the holding line", () => {
    expect(isTerminalDecision("monitor")).toBe(true);
    expect(isTerminalDecision("clear")).toBe(true);
    expect(isTerminalDecision("unlinked")).toBe(false);
    expect(isTerminalDecision("awaiting_info")).toBe(false);

    const monitor: HandleOwnerMessageResult = {
      reply: "Keep monitoring overnight; if straining returns, message back.",
      decision: "monitor",
    };
    expect(ownerAutoReply(monitor).toLowerCase()).toContain(
      "vet will review",
    );
  });
});
