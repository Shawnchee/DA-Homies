import { GLM_CONSULT_OUTPUT, PATIENTS } from "@/lib/data";
import { ApiError, parseConsultRequest } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import type { ConsultResponse } from "@/lib/api-types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => {
      throw new ApiError(400, "invalid JSON");
    });
    const { patientId } = parseConsultRequest(body);
    const patient = PATIENTS.find((p) => p.id === patientId);
    if (!patient) throw new ApiError(404, `patient ${patientId} not found`);

    // Simulate GLM latency so loading states show up in the UI.
    await new Promise((r) => setTimeout(r, 600));

    return json<ConsultResponse>({
      visitId: `mock-visit-${Date.now()}`,
      output: GLM_CONSULT_OUTPUT,
      source: "mock",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
