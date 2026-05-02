import { useState } from "react";
import { X } from "lucide-react";
import { useSubscription } from "@/lib/subscriptionStore";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

type AdCreative = {
  tag: string;
  title: string;
  body: string;
  cta: string;
  gradient: string;
};

const CREATIVES: Record<string, AdCreative> = {
  default: {
    tag: "Sponsored",
    title: "Notion for Students — 50% off",
    body: "Notes, tasks & docs in one place. Free for verified students.",
    cta: "Claim deal",
    gradient: "from-slate-100 via-zinc-100 to-stone-200",
  },
  spots: {
    tag: "Sponsored",
    title: "Onder de Toren · Student lunch €8",
    body: "Coffee + soup + sandwich. Show your verified profile at the till.",
    cta: "View spot",
    gradient: "from-amber-100 via-orange-100 to-rose-100",
  },
};

export function AdSlot({
  variant = "default",
  className,
}: {
  variant?: keyof typeof CREATIVES;
  className?: string;
}) {
  const { isPro } = useSubscription();
  const [open, setOpen] = useState(false);
  if (isPro) return null;

  const ad = CREATIVES[variant];

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft",
          className
        )}
      >
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-60",
            ad.gradient
          )}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {ad.tag}
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm font-semibold text-foreground">
              {ad.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {ad.body}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                {ad.cta}
              </button>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Remove ads
              </button>
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal
        open={open}
        onClose={() => setOpen(false)}
        highlight="Go ad-free with Pro"
      />
    </>
  );
}
