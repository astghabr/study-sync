import { useSyncExternalStore } from "react";

export type RiskNotice = {
  id: string;
  groupId: string;
  spotName: string;
  time: string;
  date: string;
  createdAt: number;
  dismissed: boolean;
};

let notices: RiskNotice[] = [
  // Seeded so the user sees the at-risk card on Home immediately for the
  // pre-existing at-risk Café Nero session.
  {
    id: "seed-risk-1",
    groupId: "g1",
    spotName: "Café Nero Leuven",
    time: "14:00",
    date: "Today",
    createdAt: Date.now() - 1000 * 60 * 35,
    dismissed: false,
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const riskNoticeStore = {
  add(notice: Omit<RiskNotice, "id" | "createdAt" | "dismissed">) {
    // Avoid duplicates per group.
    if (notices.some((n) => n.groupId === notice.groupId && !n.dismissed)) return;
    notices = [
      { ...notice, id: crypto.randomUUID(), createdAt: Date.now(), dismissed: false },
      ...notices,
    ];
    emit();
  },
  dismiss(id: string) {
    notices = notices.map((n) => (n.id === id ? { ...n, dismissed: true } : n));
    emit();
  },
  getAll() {
    return notices;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useRiskNotices() {
  return useSyncExternalStore(
    riskNoticeStore.subscribe,
    riskNoticeStore.getAll,
    riskNoticeStore.getAll,
  );
}
