import { PATIENTS } from "@/lib/data";
import { ApiError } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import { hasSupabase } from "@/lib/env";
import { getSupabaseServer } from "@/lib/supabase";
import { briefForPatient, type PatientRow } from "@/lib/supabase-mappers";
import type { GetBriefResponse } from "@/lib/api-types";

const PATIENT_COLS =
  "id,name,species,breed,age_years,sex,owner_name,owner_phone,owner_telegram";

// Brief generation moves to GLM in Phase 6. For now the DB-backed path
// resolves the patient from Supabase but still overlays the placeholder
// brief from lib/data.ts so the UI keeps working.
export async function GET(req: Request) {
  try {
    const patientId = new URL(req.url).searchParams.get("patient_id");
    if (!patientId) throw new ApiError(400, "patient_id required");

    if (hasSupabase()) {
      try {
        const db = getSupabaseServer();
        const { data, error } = await db
          .from("patients")
          .select(PATIENT_COLS)
          .eq("id", patientId)
          .maybeSingle<PatientRow>();
        if (error) throw error;
        if (!data) throw new ApiError(404, `patient ${patientId} not found`);
        return json<GetBriefResponse>({
          patientId,
          brief: briefForPatient(data),
          source: "mock",
        });
      } catch (dbErr) {
        if (dbErr instanceof ApiError) throw dbErr;
        console.warn("[api/brief] DB error, falling back to mock", dbErr);
      }
    }

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
