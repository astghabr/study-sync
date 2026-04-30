import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CANCEL_REASONS,
  cancellationSchema,
  type CancelReasonId,
} from "@/lib/cancellationStore";

export function CancelReasonModal({
  spotName,
  onClose,
  onConfirm,
}: {
  spotName: string;
  onClose: () => void;
  onConfirm: (reasonId: CancelReasonId, note?: string) => void;
}) {
  const [reasonId, setReasonId] = useState<CancelReasonId | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!reasonId) {
      setError("Please pick a reason so we can keep matches accurate.");
      return;
    }
    const result = cancellationSchema.safeParse({
      groupId: "validate-only",
      reasonId,
      note: note.trim() || undefined,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    onConfirm(reasonId, note.trim() || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Cancel your seat?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {spotName}. Tell us why — it helps us keep groups healthy and lets us
          refill the session for the others.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {CANCEL_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setReasonId(r.id);
                setError(null);
              }}
              className={cn(
                "flex items-center justify-between rounded-2xl border bg-background px-4 py-3 text-left text-sm transition",
                reasonId === r.id
                  ? "border-primary bg-accent-soft font-semibold"
                  : "border-border hover:border-primary",
              )}
            >
              {r.label}
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  reasonId === r.id ? "border-primary bg-primary" : "border-border",
                )}
              />
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-muted-foreground">
          Add a note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 280))}
          maxLength={280}
          rows={3}
          placeholder="Anything the team should know?"
          className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {note.length}/280
        </p>

        {error && (
          <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={onClose} className="h-12 flex-1 rounded-xl">
            Keep my seat
          </Button>
          <Button
            onClick={submit}
            className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel seat
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
