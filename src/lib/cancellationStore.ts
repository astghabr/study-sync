import { useSyncExternalStore } from "react";
import { z } from "zod";

/**
 * Mock client-side store for cancellation analytics.
 * In production, this would be a Postgres table with RLS:
 *   - users can INSERT their own cancellations
 *   - admins/moderators can SELECT all rows
 */

export const CANCEL_REASONS = [
  { id: "schedule", label: "Schedule conflict" },
  { id: "sick", label: "Sick / not feeling well" },
  { id: "found-other", label: "Found another spot" },
  { id: "lost-interest", label: "Lost interest" },
  { id: "wrong-vibe", label: "Wrong vibe / noise level" },
  { id: "other", label: "Other" },
] as const;

export type CancelReasonId = (typeof CANCEL_REASONS)[number]["id"];

/** Validation: prevent injection / oversize input on the optional note. */
export const cancellationSchema = z.object({
  groupId: z.string().min(1).max(64),
  reasonId: z.enum([
    "schedule",
    "sick",
    "found-other",
    "lost-interest",
    "wrong-vibe",
    "other",
  ]),
  note: z
    .string()
    .trim()
    .max(280, { message: "Note must be 280 characters or fewer" })
    .optional(),
});

export type CancellationInput = z.infer<typeof cancellationSchema>;

export type CancellationRecord = CancellationInput & {
  id: string;
  createdAt: number;
  spotName: string;
};

// ---- tiny external store --------------------------------------------------

let records: CancellationRecord[] = [
  // Seed: explains why g1 (Café Nero) is currently at risk.
  {
    id: "seed-1",
    groupId: "g1",
    spotName: "Café Nero Leuven",
    reasonId: "schedule",
    note: "Class moved last minute.",
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: "seed-2",
    groupId: "g1",
    spotName: "Café Nero Leuven",
    reasonId: "sick",
    createdAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "seed-3",
    groupId: "g4",
    spotName: "Onder de Toren",
    reasonId: "found-other",
    note: "Library was quieter.",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "seed-4",
    groupId: "g3",
    spotName: "Maurits Sabbe Library",
    reasonId: "lost-interest",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "seed-5",
    groupId: "g2",
    spotName: "Agora Learning Center",
    reasonId: "wrong-vibe",
    note: "Too loud for exam prep.",
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const cancellationStore = {
  add(input: CancellationInput, spotName: string): CancellationRecord {
    const parsed = cancellationSchema.parse(input);
    const record: CancellationRecord = {
      ...parsed,
      id: crypto.randomUUID(),
      spotName,
      createdAt: Date.now(),
    };
    records = [record, ...records];
    emit();
    return record;
  },
  getAll(): CancellationRecord[] {
    return records;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useCancellations(): CancellationRecord[] {
  return useSyncExternalStore(
    cancellationStore.subscribe,
    cancellationStore.getAll,
    cancellationStore.getAll,
  );
}

export function reasonLabel(id: CancelReasonId): string {
  return CANCEL_REASONS.find((r) => r.id === id)?.label ?? id;
}
