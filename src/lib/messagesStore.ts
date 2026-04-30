import { useSyncExternalStore } from "react";

export type ChatMessage = {
  id: string;
  buddyId: string;
  // "me" for current user; "them" for the buddy
  from: "me" | "them";
  text: string;
  sentAt: number;
};

const STORAGE_KEY = "studysync.messages.v1";

const seed = (): ChatMessage[] => {
  const now = Date.now();
  const m = 60 * 1000;
  return [
    { id: "m-1", buddyId: "1", from: "them", text: "Hey! Down for the algorithms session tomorrow?", sentAt: now - 90 * m },
    { id: "m-2", buddyId: "1", from: "me", text: "Yes — Agora at 10:30?", sentAt: now - 88 * m },
    { id: "m-3", buddyId: "2", from: "them", text: "Library opens at 8 if you want to grab the corner table 🙂", sentAt: now - 6 * 60 * m },
  ];
};

const load = (): ChatMessage[] => {
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

let state: ChatMessage[] = load();
const listeners = new Set<() => void>();

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
};

const emit = () => {
  persist();
  listeners.forEach((l) => l());
};

export const messagesStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getAll(): ChatMessage[] {
    return state;
  },
  getForBuddy(buddyId: string): ChatMessage[] {
    return state.filter((m) => m.buddyId === buddyId).sort((a, b) => a.sentAt - b.sentAt);
  },
  send(buddyId: string, text: string) {
    const trimmed = text.trim().slice(0, 1000);
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      buddyId,
      from: "me",
      text: trimmed,
      sentAt: Date.now(),
    };
    state = [...state, msg];
    emit();
    // Simulated buddy reply for demo realism
    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        buddyId,
        from: "them",
        text: "Got it — talk soon!",
        sentAt: Date.now(),
      };
      state = [...state, reply];
      emit();
    }, 1400);
  },
  remove(messageId: string) {
    state = state.filter((m) => m.id !== messageId);
    emit();
  },
};

// Cache per-buddy snapshots so useSyncExternalStore returns a stable reference
// between renders (otherwise filter()/sort() produce a new array each call → infinite loop).
const snapshotCache = new Map<string, { source: ChatMessage[]; result: ChatMessage[] }>();
const EMPTY: ChatMessage[] = [];

function getStableSnapshot(buddyId: string | null): ChatMessage[] {
  if (!buddyId) return EMPTY;
  const cached = snapshotCache.get(buddyId);
  if (cached && cached.source === state) return cached.result;
  const result = state.filter((m) => m.buddyId === buddyId).sort((a, b) => a.sentAt - b.sentAt);
  snapshotCache.set(buddyId, { source: state, result });
  return result;
}

export function useMessages(buddyId: string | null): ChatMessage[] {
  return useSyncExternalStore(
    messagesStore.subscribe,
    () => getStableSnapshot(buddyId),
    () => getStableSnapshot(buddyId),
  );
}
