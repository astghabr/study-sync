// One-shot guided tour flag.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "studysync.tour.v1";

let seen: boolean = (() => {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
})();

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export const tourStore = {
  get: () => seen,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  markSeen: () => {
    seen = true;
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    emit();
  },
  reset: () => {
    seen = false;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    emit();
  },
};

export function useTourSeen() {
  return useSyncExternalStore(tourStore.subscribe, tourStore.get, tourStore.get);
}
