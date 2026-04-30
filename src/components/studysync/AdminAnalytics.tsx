import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, BarChart3, ChevronDown, AlertTriangle } from "lucide-react";
import {
  useCancellations,
  reasonLabel,
  CANCEL_REASONS,
} from "@/lib/cancellationStore";
import { cn } from "@/lib/utils";

/**
 * Admin/moderator-only view of cancellation analytics.
 * Aggregates reasons across all sessions to surface why groups go at risk.
 */
export function AdminAnalytics() {
  const records = useCancellations();
  const [open, setOpen] = useState(true);

  const totals = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of records) counts[r.reasonId] = (counts[r.reasonId] ?? 0) + 1;
    const total = records.length || 1;
    return CANCEL_REASONS.map((r) => ({
      ...r,
      count: counts[r.id] ?? 0,
      pct: Math.round(((counts[r.id] ?? 0) / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [records]);

  const recent = records.slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-semibold">Cancellation analytics</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {records.length} cancellation{records.length === 1 ? "" : "s"} tracked
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {totals.map((row) => (
                <div key={row.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {row.count} · {row.pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent
              </p>
              {recent.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cancellations yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start gap-2 rounded-xl bg-background px-3 py-2 text-xs"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {r.spotName} · {reasonLabel(r.reasonId)}
                        </p>
                        {r.note && (
                          <p className="mt-0.5 text-muted-foreground">"{r.note}"</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {timeAgo(r.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} d ago`;
}
