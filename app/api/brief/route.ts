import { PATIENTS } from "@/lib/data";
import { ApiError } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import type { GetBriefResponse } from "@/lib/api-types";

export async function GET(req: Request) {
  try {
    const patientId = new URL(req.url).searchParams.get("patient_id");
    if (!patientId) throw new ApiError(400, "patient_id required");
    const patient = PATIENTS.find((p) => p.id === patientId);
    if (!patient) throw new ApiError(404, `patient ${patientId} not found`);
    return json<GetBriefResponse>({
      patientId,
      brief: patient.brief,
      source: "mock",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
