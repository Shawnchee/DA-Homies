"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { FollowUp, MetricCardData, Patient } from "@/lib/types";

interface StoreCtx {
  // data
  followups: FollowUp[];
  patients: Patient[];
  metrics: MetricCardData[];
  resolvedCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  // UI state
  toast: string | null;
  escalation: FollowUp | null;
  openEscalation: (f: FollowUp) => void;
  closeEscalation: () => void;
  approveEscalation: () => void;
  setToast: (msg: string | null) => void;
  flashToast: (msg: string) => void;
  expandedPatient: string | null;
  setExpandedPatient: (id: string | null) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<FollowUp | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fu, pa, me] = await Promise.all([
        api.getFollowups(),
        api.getPatients(),
        api.getMetrics(),
      ]);
      setFollowups(fu.followups);
      setResolvedCount(fu.resolvedCount);
      setPatients(pa.patients);
      setMetrics(me.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3400);
  }, []);

  const openEscalation = useCallback((f: FollowUp) => setEscalation(f), []);
  const closeEscalation = useCallback(() => setEscalation(null), []);
  const approveEscalation = useCallback(() => {
    setEscalation((cur) => {
      if (!cur) return null;
      setFollowups((fs) => fs.filter((x) => x.id !== cur.id));
      setResolvedCount((c) => c + 1);
      // fire-and-forget — mock route just logs
      void api
        .correction({
          feature: "triage",
          followupId: cur.id,
          glmOutput: cur.level,
          approved: true,
        })
        .catch(() => {});
      flashToast(`Sent to ${cur.owner} · ${cur.patient} closed`);
      return null;
    });
  }, [flashToast]);

  return (
    <Ctx.Provider
      value={{
        followups,
        patients,
        metrics,
        resolvedCount,
        loading,
        error,
        refresh,
        toast,
        escalation,
        openEscalation,
        closeEscalation,
        approveEscalation,
        setToast,
        flashToast,
        expandedPatient,
        setExpandedPatient,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
