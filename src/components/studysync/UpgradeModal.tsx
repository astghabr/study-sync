import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLAN_PRICING,
  PRO_FEATURES,
  subscriptionStore,
  type Plan,
} from "@/lib/subscriptionStore";
import { toast } from "@/hooks/use-toast";

export function UpgradeModal({
  open,
  onClose,
  highlight,
}: {
  open: boolean;
  onClose: () => void;
  /** Optional: feature that triggered the upsell, surfaced at the top. */
  highlight?: string;
}) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const handleUpgrade = () => {
    const plan: Plan = billing === "yearly" ? "pro-yearly" : "pro-monthly";
    subscriptionStore.setPlan(plan);
    toast({
      title: "Welcome to StudySync Pro 🎉",
      description: `You're on the ${
        billing === "yearly" ? "yearly" : "monthly"
      } plan. All Pro features unlocked.`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card shadow-elevated md:rounded-3xl"
          >
            <div className="gradient-hero rounded-t-3xl px-6 pb-8 pt-7 text-primary-foreground md:rounded-t-3xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-primary-foreground/30 md:hidden" />
              <button
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.18em]">StudySync Pro</p>
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                Unlock the full study toolkit.
              </h3>
              {highlight && (
                <p className="mt-2 rounded-xl bg-primary-foreground/15 px-3 py-2 text-xs">
                  ✨ {highlight}
                </p>
              )}
            </div>

            <div className="px-6 py-5">
              {/* Billing toggle */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
                {(["monthly", "yearly"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cn(
                      "relative rounded-xl px-3 py-2 text-xs font-semibold capitalize transition",
                      billing === b
                        ? "bg-card text-foreground shadow-soft"
                        : "text-muted-foreground"
                    )}
                  >
                    {b}
                    {b === "yearly" && (
                      <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                        −32%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="mt-5 rounded-2xl border border-border bg-accent-soft/40 p-5 text-center">
                {billing === "monthly" ? (
                  <>
                    <p className="font-display text-4xl font-semibold tabular-nums">
                      {PLAN_PRICING.monthly.currency}
                      {PLAN_PRICING.monthly.price.toFixed(2)}
                      <span className="ml-1 text-base font-medium text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billed monthly · cancel anytime
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-4xl font-semibold tabular-nums">
                      {PLAN_PRICING.yearly.currency}
                      {PLAN_PRICING.yearly.perMonth.toFixed(2)}
                      <span className="ml-1 text-base font-medium text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {PLAN_PRICING.yearly.currency}
                      {PLAN_PRICING.yearly.price.toFixed(2)} billed yearly · {PLAN_PRICING.yearly.savings}
                    </p>
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="mt-5 space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleUpgrade}
                className="mt-6 h-12 w-full rounded-xl text-sm font-semibold"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Upgrade to Pro · {billing}
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Mock checkout — no real payment is processed.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
