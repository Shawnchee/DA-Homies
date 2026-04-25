import { ApiError, parseCorrectionRequest } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import type { CorrectionResponse } from "@/lib/api-types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => {
      throw new ApiError(400, "invalid JSON");
    });
    const correction = parseCorrectionRequest(body);
    const id = `mock-correction-${Date.now()}`;
    // Don't log full correction payload — glmOutput / doctorCorrection may
    // contain patient PII and clinical text. Just record the categorical
    // fact (which feature, approve vs reject) for debug visibility.
    console.log(
      `[corrections] ${id} feature=${correction.feature} approved=${correction.approved}` +
        (correction.rejectionReason ? ` reason=${correction.rejectionReason}` : ""),
    );
    return json<CorrectionResponse>({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
