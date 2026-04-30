// Frontend-only mock focus stats. In production this would be derived
// server-side from real session logs.
import { useSyncExternalStore } from "react";

export type FocusSession = {
  id: string;
  endedAt: number; // ms
  durationSec: number;
  group: boolean;
};

const STORAGE_KEY = "studysync.focusStats.v1";

const dayMs = 24 * 60 * 60 * 1000;

const seed = (): FocusSession[] => {
  const now = Date.now();
  return [
    { id: "fs1", endedAt: now - 0.2 * dayMs, durationSec: 50 * 60, group: true },
    { id: "fs2", endedAt: now - 0.6 * dayMs, durationSec: 45 * 60, group: false },
    { id: "fs3", endedAt: now - 1.1 * dayMs, durationSec: 75 * 60, group: false },
    { id: "fs4", endedAt: now - 2.2 * dayMs, durationSec: 32 * 60, group: true },
    { id: "fs5", endedAt: now - 3.1 * dayMs, durationSec: 100 * 60, group: false },
    { id: "fs6", endedAt: now - 4.4 * dayMs, durationSec: 60 * 60, group: true },
    { id: "fs7", endedAt: now - 6.0 * dayMs, durationSec: 50 * 60, group: false },
  ];
};

let sessions: FocusSession[] = (() => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FocusSession[];
  } catch {}
  return seed();
})();

const listeners = new Set<() => void>();
function persist() {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}
function emit() { listeners.forEach((l) => l()); }

export const focusStatsStore = {
  get: () => sessions,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  log: (s: Omit<FocusSession, "id">) => {
    sessions = [{ ...s, id: `fs-${Date.now()}` }, ...sessions];
    persist(); emit();
  },
};

export function useFocusStats() {
  return useSyncExternalStore(focusStatsStore.subscribe, focusStatsStore.get, focusStatsStore.get);
}

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export function deriveStats(list: FocusSession[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = startOfToday - 6 * dayMs;

  const weekly = list.filter((s) => s.endedAt >= weekAgo);
  const weeklySeconds = weekly.reduce((sum, s) => sum + s.durationSec, 0);
  const sessionsThisWeek = weekly.length;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const t = startOfToday - (6 - i) * dayMs;
    const k = dayKey(t);
    const total = list
      .filter((s) => dayKey(s.endedAt) === k)
      .reduce((sum, s) => sum + s.durationSec, 0);
    return {
      t,
      label: new Date(t).toLocaleDateString(undefined, { weekday: "short" })[0],
      minutes: Math.round(total / 60),
    };
  });

  const daysSet = new Set(list.map((s) => dayKey(s.endedAt)));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const t = startOfToday - i * dayMs;
    if (daysSet.has(dayKey(t))) streak += 1;
    else break;
  }

  return { weeklySeconds, sessionsThisWeek, streak, days };
}
