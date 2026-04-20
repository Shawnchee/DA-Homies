"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { INITIAL_FOLLOWUPS } from "@/lib/data";
import type { FollowUp } from "@/lib/types";

interface StoreCtx {
  followups: FollowUp[];
  resolvedCount: number;
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
  const [followups, setFollowups] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);
  const [resolvedCount, setResolvedCount] = useState(12);
  const [toast, setToast] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<FollowUp | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

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
      flashToast(`Sent to ${cur.owner} · ${cur.patient} closed`);
      return null;
    });
  }, [flashToast]);

  return (
    <Ctx.Provider
      value={{
        followups,
        resolvedCount,
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
