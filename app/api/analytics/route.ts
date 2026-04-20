import { CORRECTIONS_LOG, TOP_DIAGNOSES } from "@/lib/data";
import { errorResponse, json } from "@/lib/api-response";
import type { GetAnalyticsResponse } from "@/lib/api-types";

export async function GET() {
  try {
    return json<GetAnalyticsResponse>({
      diagnoses: TOP_DIAGNOSES,
      corrections: CORRECTIONS_LOG,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
