// Frontend-only mock Pro subscription store.
// In production, subscription state must live server-side and be verified
// via webhooks from a payment provider — never trust the client.

import { useSyncExternalStore } from "react";

export type Plan = "free" | "pro-monthly" | "pro-yearly";

export type SubscriptionState = {
  plan: Plan;
  /** ISO date string, mock renewal date when on Pro. */
  renewsAt?: string;
};

const STORAGE_KEY = "studysync.subscription.v1";

const initial: SubscriptionState = (() => {
  if (typeof window === "undefined") return { plan: "free" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SubscriptionState;
  } catch {
    // ignore
  }
  return { plan: "free" };
})();

let state: SubscriptionState = initial;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const subscriptionStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setPlan: (plan: Plan) => {
    const renewsAt =
      plan === "free"
        ? undefined
        : new Date(
            Date.now() +
              (plan === "pro-yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString();
    state = { plan, renewsAt };
    persist();
    emit();
  },
  cancel: () => {
    state = { plan: "free" };
    persist();
    emit();
  },
};

export const PLAN_PRICING = {
  monthly: { price: 4.90, currency: "€", label: "Monthly" },
  yearly: { price: 39.90, currency: "€", label: "Yearly", perMonth: 3.33, savings: "Save 32%" },
} as const;

export const PRO_FEATURES = [
  "Ad-free experience across the app",
  "Advanced Focus mode (custom timers & full history)",
  "Spot reservations 24h+ in advance",
  "Spot insights: busy-time forecasts & student menu perks",
  "Priority support",
] as const;

export function isPro(s: SubscriptionState = state) {
  return s.plan === "pro-monthly" || s.plan === "pro-yearly";
}

/** React hook */
export function useSubscription() {
  const s = useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.get,
    subscriptionStore.get
  );
  return { ...s, isPro: isPro(s) };
}
