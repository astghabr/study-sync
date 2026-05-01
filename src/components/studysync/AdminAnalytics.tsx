import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, ChevronRight, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  useCancellations,
  reasonLabel,
  CANCEL_REASONS,
} from "@/lib/cancellationStore";

/**
 * Admin/moderator-only view of cancellation analytics.
 * Aggregates reasons across all sessions to surface why groups go at risk.
 */

/** Compact card shown on the Profile page — opens the full analytics view. */
export function AnalyticsCard({ onOpen }: { onOpen: () => void }) {
  const records = useCancellations();
  const topReason = useMemo(() => {
    if (records.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const r of records) counts[r.reasonId] = (counts[r.reasonId] ?? 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? reasonLabel(top[0] as any) : null;
  }, [records]);

  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:border-primary/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-primary">
        <BarChart3 className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-base font-semibold">Cancellation analytics</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {records.length} tracked
          {topReason ? ` · top reason: ${topReason}` : ""}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/** Full-page detailed cancellation analytics. */
export function AnalyticsPage({ onBack }: { onBack: () => void }) {
  const records = useCancellations();

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

  return (
    <div className="flex flex-col gap-5 px-6 pb-8 pt-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back to profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:border-primary/40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="font-display text-2xl font-semibold leading-tight">
            Cancellation analytics
          </h1>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-base font-semibold">Reasons</p>
          <p className="text-xs text-muted-foreground">
            {records.length} cancellation{records.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="mt-3 space-y-2.5">
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
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <p className="font-display text-base font-semibold">All cancellations</p>
        {records.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No cancellations yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-2 rounded-xl bg-background px-3 py-2 text-xs"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {r.spotName} · {reasonLabel(r.reasonId)}
                  </p>
                  {r.note && <p className="mt-0.5 text-muted-foreground">"{r.note}"</p>}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
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
