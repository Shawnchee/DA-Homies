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
    console.log("[corrections]", id, correction);
    return json<CorrectionResponse>({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
