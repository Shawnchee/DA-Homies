/**
 * Typed client for the /api/* routes. Server routes in app/api/*
 * remain the single source of truth for shape — this module is a
 * thin fetch wrapper so components don't hardcode URLs or shape.
 */
import type {
  ConsultRequest,
  ConsultResponse,
  CorrectionRequest,
  CorrectionResponse,
  GetAnalyticsResponse,
  GetBriefResponse,
  GetFollowupsResponse,
  GetMetricsResponse,
  GetPatientResponse,
  GetPatientsResponse,
  TriageRequest,
  TriageResponse,
} from "./api-types";

async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function postJSON<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  return getJSON<TRes>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const api = {
  getPatients: () => getJSON<GetPatientsResponse>("/api/patients"),
  getPatient: (id: string) =>
    getJSON<GetPatientResponse>(`/api/patients?id=${encodeURIComponent(id)}`),
  getBrief: (patientId: string) =>
    getJSON<GetBriefResponse>(
      `/api/brief?patient_id=${encodeURIComponent(patientId)}`,
    ),
  getFollowups: () => getJSON<GetFollowupsResponse>("/api/followups"),
  getMetrics: () => getJSON<GetMetricsResponse>("/api/metrics"),
  getAnalytics: () => getJSON<GetAnalyticsResponse>("/api/analytics"),
  consult: (req: ConsultRequest) =>
    postJSON<ConsultRequest, ConsultResponse>("/api/consult", req),
  triage: (req: TriageRequest) =>
    postJSON<TriageRequest, TriageResponse>("/api/triage", req),
  correction: (req: CorrectionRequest) =>
    postJSON<CorrectionRequest, CorrectionResponse>("/api/corrections", req),
};
