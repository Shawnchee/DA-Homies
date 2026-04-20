import { PATIENTS } from "@/lib/data";
import { ApiError } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import type {
  GetPatientResponse,
  GetPatientsResponse,
} from "@/lib/api-types";

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const patient = PATIENTS.find((p) => p.id === id);
      if (!patient) throw new ApiError(404, `patient ${id} not found`);
      return json<GetPatientResponse>({ patient });
    }
    return json<GetPatientsResponse>({ patients: PATIENTS });
  } catch (err) {
    return errorResponse(err);
  }
}
