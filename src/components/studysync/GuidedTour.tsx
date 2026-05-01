import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, MapPin, Users, Timer, CalendarCheck, Home } from "lucide-react";
import { tourStore, useTourSeen } from "@/lib/tourStore";
import type { Tab } from "./BottomNav";

type Step = {
  tab: Tab;
  title: string;
  body: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { tab: "home", title: "Your study HQ", body: "Today's session, recommended buddies and at-risk alerts — all in one place.", icon: <Home className="h-5 w-5" /> },
  { tab: "buddies", title: "Find study buddies", body: "Verified students filtered by major, year and hobbies. Request to study together.", icon: <Users className="h-5 w-5" /> },
  { tab: "spots", title: "Discover real spots", body: "Cafés, libraries and uni hubs with laptop policies, reviews and live noise levels.", icon: <MapPin className="h-5 w-5" /> },
  { tab: "focus", title: "Lock in", body: "Pomodoro, custom timer or stopwatch — solo or synced live with your study group.", icon: <Timer className="h-5 w-5" /> },
  { tab: "groups", title: "Smart matched groups", body: "Anonymous study groups in pre-reserved tables, booked 24h ahead by vibe.", icon: <CalendarCheck className="h-5 w-5" /> },
];

export function GuidedTour({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const seen = useTourSeen();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [seen]);

  if (seen || !open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    tourStore.markSeen();
    setOpen(false);
    onNavigate("home");
  };

  const next = () => {
    if (isLast) return finish();
    const n = step + 1;
    setStep(n);
    onNavigate(STEPS[n].tab);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-auto fixed inset-0 z-[80] mx-auto flex max-w-md items-end bg-primary/55 backdrop-blur-sm"
      >
        <motion.div
          key={step}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="m-4 mb-24 w-full rounded-3xl bg-card p-6 shadow-elevated"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              {current.icon}
            </div>
            <button
              onClick={finish}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-primary">
            Quick tour · {step + 1}/{STEPS.length}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
            {current.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{current.body}</p>

          <div className="mt-4 flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={finish}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="ml-auto inline-flex h-11 items-center gap-1 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-95"
            >
              {isLast ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
