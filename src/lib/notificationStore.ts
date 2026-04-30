import { useSyncExternalStore } from "react";
import { BUDDIES } from "@/data/mockData";

export type NotificationType = "message" | "request" | "match" | "session";

export type Notification = {
  id: string;
  type: NotificationType;
  buddyId?: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

const STORAGE_KEY = "studysync.notifications.v1";

const seed = (): Notification[] => {
  const now = Date.now();
  const m = 60 * 1000;
  return [
    {
      id: "n-1",
      type: "message",
      buddyId: "1",
      title: `${BUDDIES[0].name} sent you a message`,
      body: "Hey! Down for the algorithms session tomorrow?",
      createdAt: now - 12 * m,
      read: false,
    },
    {
      id: "n-2",
      type: "request",
      buddyId: "3",
      title: `${BUDDIES[2].name} wants to study with you`,
      body: "Computer Science · 1st Year Master",
      createdAt: now - 90 * m,
      read: false,
    },
    {
      id: "n-3",
      type: "match",
      buddyId: "4",
      title: `New match: ${BUDDIES[3].name}`,
      body: "You both like Coffee, Films and study at KU Leuven.",
      createdAt: now - 6 * 60 * m,
      read: true,
    },
  ];
};

const load = (): Notification[] => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return seed();
  } catch {
    return seed();
  }
};

let state: Notification[] = load();
const listeners = new Set<() => void>();

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

const emit = () => {
  persist();
  listeners.forEach((l) => l());
};

export const notificationStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getAll(): Notification[] {
    return state;
  },
  add(n: Omit<Notification, "id" | "createdAt" | "read">) {
    const note: Notification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      read: false,
    };
    state = [note, ...state];
    emit();
  },
  markAllRead() {
    if (state.every((n) => n.read)) return;
    state = state.map((n) => ({ ...n, read: true }));
    emit();
  },
  markRead(id: string) {
    const target = state.find((n) => n.id === id);
    if (!target || target.read) return;
    state = state.map((n) => (n.id === id ? { ...n, read: true } : n));
    emit();
  },
  remove(id: string) {
    state = state.filter((n) => n.id !== id);
    emit();
  },
  clear() {
    if (state.length === 0) return;
    state = [];
    emit();
  },
};

const sortedCache: { source: Notification[]; result: Notification[] } = {
  source: state,
  result: [...state].sort((a, b) => b.createdAt - a.createdAt),
};

function getStableSorted(): Notification[] {
  if (sortedCache.source !== state) {
    sortedCache.source = state;
    sortedCache.result = [...state].sort((a, b) => b.createdAt - a.createdAt);
  }
  return sortedCache.result;
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(
    notificationStore.subscribe,
    getStableSorted,
    getStableSorted,
  );
}
