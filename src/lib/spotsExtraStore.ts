// Frontend-only mock store for spot favorites & user-submitted reviews.
import { useSyncExternalStore } from "react";

export type SpotReview = {
  id: string;
  spotId: string;
  authorName: string;
  authorAnimal: string;
  rating: number; // 1–5
  text: string;
  createdAt: number;
};

type State = {
  favorites: Set<string>;
  reviews: SpotReview[];
};

const STORAGE_KEY = "studysync.spotsExtra.v1";

const seedReviews: SpotReview[] = [
  { id: "rv1", spotId: "s1", authorName: "Liam J.", authorAnimal: "bear", rating: 5, text: "Best almond croissant + reliable wifi. My thesis HQ.", createdAt: Date.now() - 2 * 86400000 },
  { id: "rv2", spotId: "s1", authorName: "Sofia P.", authorAnimal: "rabbit", rating: 4, text: "Lovely mornings, gets packed after 13:00 though.", createdAt: Date.now() - 5 * 86400000 },
  { id: "rv3", spotId: "s2", authorName: "Noah D.", authorAnimal: "penguin", rating: 5, text: "Quiet zones are actually quiet. Group rooms easy to book.", createdAt: Date.now() - 1 * 86400000 },
  { id: "rv4", spotId: "s3", authorName: "Emma V.", authorAnimal: "frog", rating: 3, text: "Great vibe, but no laptops Sat/Sun – plan around it.", createdAt: Date.now() - 4 * 86400000 },
  { id: "rv5", spotId: "s4", authorName: "Mila H.", authorAnimal: "cat", rating: 5, text: "Silent zone is heaven. Bring a sweater, it's chilly.", createdAt: Date.now() - 6 * 86400000 },
  { id: "rv6", spotId: "s5", authorName: "Lucas M.", authorAnimal: "owl", rating: 4, text: "Brunch is excellent. Treat it as a break, not a workspace.", createdAt: Date.now() - 3 * 86400000 },
  { id: "rv7", spotId: "s6", authorName: "Anaïs C.", authorAnimal: "panda", rating: 4, text: "Group rooms bookable, hub stays open late on weekdays.", createdAt: Date.now() - 7 * 86400000 },
];

const initial: State = (() => {
  if (typeof window === "undefined") return { favorites: new Set(), reviews: seedReviews };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { favorites: string[]; reviews: SpotReview[] };
      return {
        favorites: new Set(parsed.favorites ?? []),
        reviews: parsed.reviews?.length ? parsed.reviews : seedReviews,
      };
    }
  } catch {}
  return { favorites: new Set(), reviews: seedReviews };
})();

let state = initial;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ favorites: Array.from(state.favorites), reviews: state.reviews })
    );
  } catch {}
}
function emit() { listeners.forEach((l) => l()); }

export const spotsExtraStore = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  toggleFavorite: (spotId: string) => {
    const next = new Set(state.favorites);
    next.has(spotId) ? next.delete(spotId) : next.add(spotId);
    state = { ...state, favorites: next };
    persist(); emit();
  },
  addReview: (r: Omit<SpotReview, "id" | "createdAt">) => {
    const review: SpotReview = { ...r, id: `rv-${Date.now()}`, createdAt: Date.now() };
    state = { ...state, reviews: [review, ...state.reviews] };
    persist(); emit();
  },
};

export function useSpotsExtra() {
  return useSyncExternalStore(spotsExtraStore.subscribe, spotsExtraStore.get, spotsExtraStore.get);
}

export function getSpotReviews(spotId: string) {
  return state.reviews.filter((r) => r.spotId === spotId);
}

export function spotAverageRating(spotId: string) {
  const rs = state.reviews.filter((r) => r.spotId === spotId);
  if (!rs.length) return null;
  return rs.reduce((s, r) => s + r.rating, 0) / rs.length;
}
