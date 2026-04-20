import { INITIAL_FOLLOWUPS } from "@/lib/data";
import { errorResponse, json } from "@/lib/api-response";
import type { GetFollowupsResponse } from "@/lib/api-types";

export async function GET() {
  try {
    return json<GetFollowupsResponse>({
      followups: INITIAL_FOLLOWUPS,
      resolvedCount: 12,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
