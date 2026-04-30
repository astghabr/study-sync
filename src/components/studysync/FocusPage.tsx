import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Timer as TimerIcon,
  Clock,
  Activity,
  Users,
  Flame,
  X,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  History,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalAvatar } from "./Avatar";
import { BUDDIES } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/subscriptionStore";
import { focusStatsStore } from "@/lib/focusStatsStore";
import { UpgradeModal } from "./UpgradeModal";
import { Crown } from "lucide-react";

type Mode = "pomodoro" | "timer" | "stopwatch";
type Phase = "focus" | "break";

type SessionLog = {
  id: string;
  mode: Mode;
  durationSec: number;
  group: boolean;
  participants: number;
  completed: boolean;
  endedAt: number;
};

const POMO_FOCUS = 25 * 60;
const POMO_BREAK = 5 * 60;

// Seed history (mocked recent sessions across last 7 days)
const seededHistory = (): SessionLog[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    { id: "h1", mode: "pomodoro", durationSec: 50 * 60, group: true, participants: 3, completed: true, endedAt: now - 0.2 * day },
    { id: "h2", mode: "timer", durationSec: 45 * 60, group: false, participants: 1, completed: true, endedAt: now - 0.6 * day },
    { id: "h3", mode: "pomodoro", durationSec: 75 * 60, group: false, participants: 1, completed: true, endedAt: now - 1.1 * day },
    { id: "h4", mode: "stopwatch", durationSec: 32 * 60, group: true, participants: 2, completed: true, endedAt: now - 2.2 * day },
    { id: "h5", mode: "pomodoro", durationSec: 100 * 60, group: false, participants: 1, completed: true, endedAt: now - 3.1 * day },
    { id: "h6", mode: "timer", durationSec: 60 * 60, group: true, participants: 4, completed: true, endedAt: now - 4.4 * day },
    { id: "h7", mode: "pomodoro", durationSec: 50 * 60, group: false, participants: 1, completed: true, endedAt: now - 6.0 * day },
  ];
};

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function formatHM(sec: number) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${mm}m`;
  return `${h}h ${mm}m`;
}

const modeMeta: Record<Mode, { label: string; icon: typeof TimerIcon; desc: string }> = {
  pomodoro: { label: "Pomodoro", icon: TimerIcon, desc: "25 / 5 cycles" },
  timer: { label: "Timer", icon: Clock, desc: "Custom duration" },
  stopwatch: { label: "Stopwatch", icon: Activity, desc: "Open-ended" },
};

export function FocusPage({ onLockChange }: { onLockChange: (locked: boolean) => void }) {
  const { isPro } = useSubscription();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [timerMinutes, setTimerMinutes] = useState(45);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();

  const requestUpgrade = (reason: string) => {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  };

  // session state
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>("focus");
  const [cycle, setCycle] = useState(1);
  const [elapsed, setElapsed] = useState(0); // seconds elapsed in current phase / stopwatch
  const [totalFocus, setTotalFocus] = useState(0); // total focus seconds in this session
  const [exitWarn, setExitWarn] = useState(false);
  const [summary, setSummary] = useState<SessionLog | null>(null);
  const [history, setHistory] = useState<SessionLog[]>(seededHistory);

  const startedAtRef = useRef<number>(0);

  // total target for the active phase (focus or break) — null means open-ended (stopwatch)
  const target = useMemo<number | null>(() => {
    if (!running) return null;
    if (mode === "stopwatch") return null;
    if (mode === "timer") return timerMinutes * 60;
    // pomodoro
    return phase === "focus" ? POMO_FOCUS : POMO_BREAK;
  }, [running, mode, timerMinutes, phase]);

  // tick
  useEffect(() => {
    if (!running || paused) return;
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
      if (mode !== "stopwatch" && phase === "focus") {
        setTotalFocus((t) => t + 1);
      }
      if (mode === "stopwatch") {
        setTotalFocus((t) => t + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, paused, mode, phase]);

  // pomodoro / timer auto-advance
  useEffect(() => {
    if (!running || target == null) return;
    if (elapsed < target) return;
    if (mode === "timer") {
      finishSession(true);
      return;
    }
    if (mode === "pomodoro") {
      // toggle phase
      setPhase((p) => (p === "focus" ? "break" : "focus"));
      if (phase === "break") setCycle((c) => c + 1);
      setElapsed(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, target]);

  // sync lock state with parent (block other nav while running)
  useEffect(() => {
    onLockChange(running);
  }, [running, onLockChange]);

  // browser-tab leave warning
  useEffect(() => {
    if (!running) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [running]);

  const startSession = () => {
    setElapsed(0);
    setTotalFocus(0);
    setPhase("focus");
    setCycle(1);
    setPaused(false);
    startedAtRef.current = Date.now();
    setRunning(true);
  };

  const finishSession = (completed: boolean) => {
    const log: SessionLog = {
      id: `s-${Date.now()}`,
      mode,
      durationSec: totalFocus + (mode === "stopwatch" || phase === "focus" ? 0 : 0),
      group: invitees.length > 0,
      participants: invitees.length + 1,
      completed,
      endedAt: Date.now(),
    };
    setRunning(false);
    setPaused(false);
    setExitWarn(false);
    setSummary(log);
    setHistory((h) => [log, ...h]);
    // Persist to shared focus stats store for the Profile page.
    focusStatsStore.log({
      endedAt: log.endedAt,
      durationSec: log.durationSec,
      group: log.group,
    });
  };

  return (
    <div className="flex flex-col pb-6">
      {/* HEADER */}
      <div className="relative gradient-hero px-6 pb-10 pt-10 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/85">Deep work hub</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">
          Focus, together or solo.
        </h1>
        <p className="mt-2 max-w-xs text-sm text-primary-foreground/95">
          Pick a mode, lock in, and let the timer do the rest.
        </p>
      </div>

      {/* MODE SELECTION CARD */}
      <div className="-mt-6 px-6">
        <div className="rounded-3xl bg-card p-5 shadow-elevated">
          <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Mode
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(modeMeta) as Mode[]).map((m) => {
              const Icon = modeMeta[m].icon;
              const active = mode === m;
              const locked = !isPro && m !== "pomodoro";
              return (
                <button
                  key={m}
                  onClick={() => {
                    if (locked) {
                      requestUpgrade(`${modeMeta[m].label} mode is part of Pro.`);
                      return;
                    }
                    setMode(m);
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                    locked && !active && "opacity-80"
                  )}
                >
                  {locked && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Crown className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                  <span className="text-xs font-semibold">{modeMeta[m].label}</span>
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {modeMeta[m].desc}
                  </span>
                </button>
              );
            })}
          </div>

          {mode === "timer" && (
            <div className="mt-5 rounded-2xl bg-accent-soft/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Custom duration
              </p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => setTimerMinutes((v) => Math.max(5, v - 5))}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <p className="font-display text-3xl font-semibold tabular-nums">
                    {timerMinutes}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    minutes
                  </p>
                </div>
                <button
                  onClick={() => setTimerMinutes((v) => Math.min(180, v + 5))}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* invite buddies */}
          <button
            onClick={() => setShowInvite(true)}
            className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  Invite study buddies
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {invitees.length === 0
                    ? "Solo session"
                    : `${invitees.length} buddy${invitees.length > 1 ? "s" : ""} joining`}
                </p>
              </div>
            </div>
            {invitees.length > 0 && (
              <div className="flex -space-x-2">
                {invitees.slice(0, 3).map((id) => {
                  const b = BUDDIES.find((x) => x.id === id);
                  if (!b) return null;
                  return (
                    <div key={id} className="ring-2 ring-card rounded-full">
                      <AnimalAvatar animal={b.animal} size="sm" />
                    </div>
                  );
                })}
              </div>
            )}
          </button>

          <Button
            onClick={startSession}
            className="mt-5 h-14 w-full rounded-2xl text-base font-semibold shadow-elevated"
          >
            <Play className="mr-2 h-5 w-5" fill="currentColor" /> Start session
          </Button>
        </div>
      </div>

      {/* DAILY STATS */}
      <div className="mt-6 px-6">
        <DailyStats history={history} />
      </div>

      {/* HISTORY */}
      <div className="mt-6 px-6">
        <SessionHistory
          history={history}
          isPro={isPro}
          onUpgrade={() => requestUpgrade("Full session history is part of Pro.")}
        />
      </div>

      {/* ACTIVE FOCUS LOCK OVERLAY */}
      <AnimatePresence>
        {running && (
          <ActiveFocusOverlay
            mode={mode}
            phase={phase}
            cycle={cycle}
            elapsed={elapsed}
            target={target}
            paused={paused}
            invitees={invitees}
            totalFocus={totalFocus}
            onPauseToggle={() => setPaused((p) => !p)}
            onEndRequest={() => setExitWarn(true)}
          />
        )}
      </AnimatePresence>

      {/* EXIT WARNING */}
      <AnimatePresence>
        {exitWarn && (
          <ExitWarning
            onCancel={() => setExitWarn(false)}
            onConfirm={() => finishSession(false)}
          />
        )}
      </AnimatePresence>

      {/* SUMMARY */}
      <AnimatePresence>
        {summary && (
          <SummaryModal
            log={summary}
            onClose={() => setSummary(null)}
          />
        )}
      </AnimatePresence>

      {/* INVITE MODAL */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            selected={invitees}
            onToggle={(id) =>
              setInvitees((arr) =>
                arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
              )
            }
            onClose={() => setShowInvite(false)}
          />
        )}
      </AnimatePresence>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        highlight={upgradeReason}
      />
    </div>
  );
}

/* ───────────────────────── Active overlay ───────────────────────── */

function ActiveFocusOverlay({
  mode,
  phase,
  cycle,
  elapsed,
  target,
  paused,
  invitees,
  totalFocus,
  onPauseToggle,
  onEndRequest,
}: {
  mode: Mode;
  phase: Phase;
  cycle: number;
  elapsed: number;
  target: number | null;
  paused: boolean;
  invitees: string[];
  totalFocus: number;
  onPauseToggle: () => void;
  onEndRequest: () => void;
}) {
  const remaining = target != null ? Math.max(0, target - elapsed) : elapsed;
  const progress = target != null ? Math.min(1, elapsed / target) : 0;

  const SIZE = 240;
  const STROKE = 10;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col items-center justify-between bg-[hsl(var(--primary))] px-6 py-12 text-primary-foreground"
    >
      {/* top */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Deep focus mode on
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              paused ? "bg-amber-300" : "animate-pulse bg-accent"
            )}
          />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            {paused ? "Paused" : phase === "focus" ? "Focusing" : "Break"}
          </span>
        </div>
      </div>

      {/* timer ring */}
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ scale: paused ? 1 : [1, 1.015, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="hsl(var(--primary-foreground) / 0.15)"
              strokeWidth={STROKE}
              fill="none"
            />
            {target != null && (
              <motion.circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                stroke="hsl(var(--accent))"
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/85">
              {modeMeta[mode].label}
              {mode === "pomodoro" && ` · Cycle ${cycle}`}
            </p>
            <p className="font-display text-5xl font-semibold tabular-nums leading-none">
              {formatTime(remaining)}
            </p>
            {mode === "stopwatch" && (
              <p className="mt-1 text-[11px] uppercase tracking-wider text-primary-foreground/80">
                Counting up
              </p>
            )}
          </div>
        </motion.div>

        {/* participants — shared/synced group timer */}
        {invitees.length > 0 && (
          <div className="mt-8 flex w-full flex-col items-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", paused ? "bg-amber-300" : "animate-pulse bg-accent")} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                Synced group timer
              </span>
            </div>

            <div className="mt-3 flex -space-x-3">
              {/* You — host */}
              <div className="relative rounded-full ring-2 ring-accent">
                <AnimalAvatar animal="fox" size="md" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-primary">
                  Host
                </span>
              </div>
              {invitees.slice(0, 4).map((id) => {
                const b = BUDDIES.find((x) => x.id === id);
                if (!b) return null;
                return (
                  <div key={id} className="rounded-full ring-2 ring-[hsl(var(--primary))]">
                    <AnimalAvatar animal={b.animal} size="md" />
                  </div>
                );
              })}
              {invitees.length > 4 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15 text-[11px] font-semibold ring-2 ring-[hsl(var(--primary))]">
                  +{invitees.length - 4}
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-primary-foreground/85">
              {paused
                ? `Paused for the whole group · ${invitees.length + 1} people`
                : `${invitees.length + 1} people focusing in sync`}
            </p>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="w-full space-y-3">
        <p className="text-center text-[11px] text-primary-foreground/85">
          {invitees.length > 0
            ? "You're the host — pause and end sync to your group."
            : "Stay put — navigation is locked while your session runs."}
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={onPauseToggle}
            className="h-14 flex-1 rounded-2xl bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
          >
            {paused ? (
              <>
                <Play className="mr-2 h-5 w-5" fill="currentColor" /> Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-5 w-5" /> Pause
              </>
            )}
          </Button>
          <Button
            onClick={onEndRequest}
            className="h-14 flex-1 rounded-2xl bg-accent text-primary hover:bg-accent/90"
          >
            <Square className="mr-2 h-5 w-5" fill="currentColor" /> End session
          </Button>
        </div>
        <p className="text-center text-[11px] text-primary-foreground/85">
          Total focus this session · {formatHM(totalFocus)}
        </p>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Modals ───────────────────────── */

function ExitWarning({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] mx-auto flex max-w-md items-end bg-black/50 sm:items-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="m-4 w-full rounded-3xl bg-card p-6 shadow-elevated"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
          Stay focused — your session is still running
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ending early won't count toward your streak. Are you sure you want to stop now?
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            onClick={onCancel}
            className="h-12 flex-1 rounded-xl bg-secondary text-foreground hover:bg-secondary/80"
          >
            Keep going
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="h-12 flex-1 rounded-xl"
          >
            End anyway
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SummaryModal({ log, onClose }: { log: SessionLog; onClose: () => void }) {
  // Simple focus score: 100 if completed full target; else proportional, min 40
  const score = log.completed ? 100 : Math.max(40, Math.min(95, Math.round((log.durationSec / (45 * 60)) * 100)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] mx-auto flex max-w-md items-end bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="m-4 w-full rounded-3xl bg-card p-6 shadow-elevated"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
          {log.completed ? "Session complete" : "Session logged"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {log.group ? `Focused with ${log.participants - 1} buddy${log.participants - 1 > 1 ? "s" : ""}` : "Solo session"} · {modeMeta[log.mode].label}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-accent-soft/60 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Duration
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {formatHM(log.durationSec)}
            </p>
          </div>
          <div className="rounded-2xl bg-accent-soft/60 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Focus score
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {score}
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="mt-5 h-12 w-full rounded-xl text-sm font-semibold">
          Log session
        </Button>
      </motion.div>
    </motion.div>
  );
}

function InviteModal({
  selected,
  onToggle,
  onClose,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] mx-auto flex max-w-md items-end bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl bg-card p-6 shadow-elevated"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Invite buddies
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick anyone you've already matched with.
        </p>
        <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
          {BUDDIES.map((b) => {
            const on = selected.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => onToggle(b.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                  on
                    ? "border-primary bg-accent-soft"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <AnimalAvatar animal={b.animal} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {b.major} · {b.year}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  )}
                >
                  {on && <span className="text-xs">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <Button onClick={onClose} className="mt-4 h-12 w-full rounded-xl text-sm font-semibold">
          Done
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Stats & history ───────────────────────── */

function DailyStats({ history }: { history: SessionLog[] }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const todays = history.filter((h) => h.endedAt >= startOfToday);
  const todayFocus = todays.reduce((s, h) => s + h.durationSec, 0);
  const sessionsToday = todays.length;

  // most-used mode this week
  const weekAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const weekly = history.filter((h) => h.endedAt >= weekAgo);
  const counts: Record<Mode, number> = { pomodoro: 0, timer: 0, stopwatch: 0 };
  weekly.forEach((h) => (counts[h.mode] += 1));
  const topMode = (Object.keys(counts) as Mode[]).reduce((a, b) =>
    counts[a] >= counts[b] ? a : b
  );

  // streak: consecutive days with at least one session ending in that day, up to today
  const dayKey = (t: number) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };
  const daysSet = new Set(history.map((h) => dayKey(h.endedAt)));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const t = startOfToday - i * 24 * 60 * 60 * 1000;
    if (daysSet.has(dayKey(t))) streak += 1;
    else break;
  }

  // bar chart: focus minutes per day for last 7 days (oldest -> newest)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const t = startOfToday - (6 - i) * 24 * 60 * 60 * 1000;
    const k = dayKey(t);
    const total = history
      .filter((h) => dayKey(h.endedAt) === k)
      .reduce((s, h) => s + h.durationSec, 0);
    return { t, label: new Date(t).toLocaleDateString(undefined, { weekday: "short" })[0], minutes: Math.round(total / 60) };
  });
  const maxMin = Math.max(60, ...days.map((d) => d.minutes));

  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Daily stats</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">
            {streak}-day streak
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Today" value={formatHM(todayFocus)} />
        <Stat label="Sessions" value={String(sessionsToday)} />
        <Stat label="Top mode" value={modeMeta[topMode].label} />
      </div>

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Focus time · last 7 days
        </p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {days.map((d, i) => {
            const h = (d.minutes / maxMin) * 100;
            const isToday = i === days.length - 1;
            return (
              <div key={d.t} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(h, d.minutes > 0 ? 8 : 4)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={cn(
                    "w-full rounded-md",
                    isToday ? "bg-primary" : "bg-accent"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isToday ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-accent-soft/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-display text-base font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function SessionHistory({
  history,
  isPro,
  onUpgrade,
}: {
  history: SessionLog[];
  isPro: boolean;
  onUpgrade: () => void;
}) {
  const visible = isPro ? history.slice(0, 6) : history.slice(0, 3);
  const hidden = history.length - visible.length;
  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Session history</p>
      </div>
      <div className="mt-3 divide-y divide-border">
        {visible.map((h) => {
          const Icon = modeMeta[h.mode].icon;
          const d = new Date(h.endedAt);
          const when = d.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          return (
            <div key={h.id} className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {modeMeta[h.mode].label} · {formatHM(h.durationSec)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {when} · {h.group ? `Group of ${h.participants}` : "Solo"}
                  {h.completed ? "" : " · ended early"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {!isPro && hidden > 0 && (
        <button
          onClick={onUpgrade}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-accent-soft/40 py-3 text-xs font-semibold text-primary"
        >
          <Crown className="h-3.5 w-3.5" />
          Unlock full history ({hidden} more) with Pro
        </button>
      )}
    </div>
  );
}
