import { MONTH_METRICS } from "@/lib/data";
import { errorResponse, json } from "@/lib/api-response";
import type { GetMetricsResponse } from "@/lib/api-types";

export async function GET() {
  try {
    return json<GetMetricsResponse>({ metrics: MONTH_METRICS });
  } catch (err) {
    return errorResponse(err);
  }
}
