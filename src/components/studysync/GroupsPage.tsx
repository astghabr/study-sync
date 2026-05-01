import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Check,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  Volume1,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Wifi,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GROUPS, SPOTS, REFILL_POOL, type StudyGroup, type RefillCandidate, ANIMALS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { cancellationStore, type CancelReasonId } from "@/lib/cancellationStore";
import { riskNoticeStore } from "@/lib/riskNoticeStore";
import { CancelReasonModal } from "./CancelReasonModal";

type Noise = "Quiet" | "Moderate" | "Lively";
const NOISE_OPTIONS: { value: Noise; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: "Quiet", label: "Quiet", hint: "Library energy", icon: <VolumeX className="h-4 w-4" /> },
  { value: "Moderate", label: "Moderate", hint: "Soft chatter", icon: <Volume1 className="h-4 w-4" /> },
  { value: "Lively", label: "Lively", hint: "Cafe buzz", icon: <Volume2 className="h-4 w-4" /> },
];

const isCapped = (g: StudyGroup) => g.spotsTotal !== null;
const isFull = (g: StudyGroup) => isCapped(g) && (g.spotsRemaining ?? 0) <= 0;

export function GroupsPage() {
  const [groups, setGroups] = useState(GROUPS);
  const [joined, setJoined] = useState<Set<string>>(new Set(["g1"]));
  const [smartOpen, setSmartOpen] = useState(false);
  const [confirming, setConfirming] = useState<StudyGroup | null>(null);
  const [refilling, setRefilling] = useState<StudyGroup | null>(null);
  const [cancelling, setCancelling] = useState<StudyGroup | null>(null);
  const [soloCancel, setSoloCancel] = useState<StudyGroup | null>(null);

  const handleJoin = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        if (isCapped(g) && (g.spotsRemaining ?? 0) <= 0) return g;
        return {
          ...g,
          spotsRemaining: isCapped(g) ? (g.spotsRemaining ?? 1) - 1 : null,
          anonymousMembers: g.anonymousMembers + 1,
        };
      })
    );
    setJoined((prev) => new Set(prev).add(id));
    setConfirming(null);
  };

  const handleRefill = (group: StudyGroup, picks: RefillCandidate[]) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === group.id
          ? {
              ...g,
              atRisk: false,
              anonymousMembers: g.anonymousMembers + picks.length,
              spotsRemaining: isCapped(g)
                ? Math.max((g.spotsRemaining ?? 0) - picks.length, 0)
                : null,
            }
          : g
      )
    );
    setRefilling(null);
    toast.success(`${picks.length} new ${picks.length === 1 ? "person" : "people"} added`, {
      description: `${group.spotName} · ${group.time} is back on track.`,
    });
  };

  const handleCancel = (group: StudyGroup, reasonId?: CancelReasonId, note?: string) => {
    // 1. Persist cancellation reason for analytics — but only if a reason was given.
    //    Solo cancellations (last person left) are not recorded on the stats page.
    if (reasonId) {
      cancellationStore.add(
        { groupId: group.id, reasonId, note },
        group.spotName,
      );
    }

    // 2. Update group state: remove user, mark at-risk if too thin.
    let becameAtRisk = false;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== group.id) return g;
        const nextMembers = Math.max(g.anonymousMembers - 1, 0);
        const nextRemaining = isCapped(g)
          ? Math.min((g.spotsRemaining ?? 0) + 1, g.spotsTotal ?? 0)
          : null;
        const wasAtRisk = !!g.atRisk;
        const nowAtRisk = nextMembers <= 1;
        if (!wasAtRisk && nowAtRisk) becameAtRisk = true;
        return {
          ...g,
          anonymousMembers: nextMembers,
          spotsRemaining: nextRemaining,
          atRisk: nowAtRisk,
        };
      }),
    );
    setJoined((prev) => {
      const next = new Set(prev);
      next.delete(group.id);
      return next;
    });
    setCancelling(null);

    // 3. Notify the user; raise a push-style notice if session is at risk.
    toast("Seat cancelled", {
      description: "Thanks — your reason helps us keep groups healthy.",
    });
    if (becameAtRisk) {
      riskNoticeStore.add({
        groupId: group.id,
        spotName: group.spotName,
        time: group.time,
        date: group.date,
      });
      toast.warning(`${group.spotName} is now at risk`, {
        description: "Tap the Home banner to refill the session in 2 mins.",
      });
    }
  };

  return (
    <div className="flex flex-col pb-6">
      <header className="px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Smart match</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight">Group sessions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anonymous study groups in pre-reserved spots — booked 24h ahead, matched by vibe.
        </p>

        <button
          onClick={() => setSmartOpen(true)}
          className="group mt-5 flex w-full items-center justify-between rounded-2xl gradient-peach p-4 shadow-peach transition-transform hover:scale-[0.99]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-primary">Study match</p>
              <p className="text-xs text-primary/80">Pick your noise level — we'll seat you</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </button>
      </header>

      <h2 className="mb-3 mt-7 px-6 font-display text-lg font-semibold">Open tables</h2>

      <div className="flex flex-col gap-3 px-6">
        {groups.map((g, i) => {
          const isJoined = joined.has(g.id);
          const full = isFull(g);
          const capped = isCapped(g);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-2xl border bg-card p-4 shadow-soft transition-colors",
                g.atRisk ? "border-destructive/40 bg-destructive/5" : "border-border"
              )}
            >
              {g.atRisk && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Session at risk · 2 people just cancelled
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold">{g.spotName}</p>
                    <NoiseTag noise={g.noisePreference} />
                    {capped ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                        Cafe · 4 max
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                        Open table · no limit
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {g.date} · {g.time}</p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Booked 24h ahead {g.bookedAt ? `· ${g.bookedAt}` : ""}
                    </p>
                    <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Table pre-reserved · anonymous</p>
                  </div>
                </div>
                <div className="text-right">
                  {capped ? (
                    <>
                      <p className={cn(
                        "font-display text-2xl font-semibold leading-none",
                        full ? "text-muted-foreground" : "text-primary"
                      )}>
                        {g.spotsRemaining}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">spots left</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-2xl font-semibold leading-none text-primary">∞</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">no cap</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(g.anonymousMembers, 4) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-accent-soft text-[11px] font-semibold text-primary"
                    >
                      ?
                    </div>
                  ))}
                  <div className="flex h-7 items-center justify-center rounded-full border-2 border-card bg-secondary px-2 text-[10px] font-medium text-foreground">
                    <Users className="mr-1 h-3 w-3" /> {g.anonymousMembers}
                    {capped ? `/${g.spotsTotal}` : ""}
                  </div>
                </div>
                {isJoined ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // If you are the only person left, confirm before
                        // cancelling — and don't record it in analytics.
                        if (g.anonymousMembers <= 1) {
                          setSoloCancel(g);
                        } else {
                          setCancelling(g);
                        }
                      }}
                      className="h-9 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                      Cancel
                    </button>
                    <Button
                      size="sm"
                      disabled
                      className="h-9 rounded-full bg-success px-4 text-xs font-semibold hover:bg-success/90"
                    >
                      <Check className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Joined
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={full}
                    onClick={() => setConfirming(g)}
                    className="h-9 rounded-full px-4 text-xs font-semibold"
                  >
                    {full ? "Full" : "Join table"}
                  </Button>
                )}
              </div>

              {g.atRisk && isJoined && (
                <button
                  onClick={() => setRefilling(g)}
                  className="mt-3 flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-soft transition-transform hover:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Find new people for this session</p>
                      <p className="text-[11px] opacity-80">Auto-match in 2 mins · same place, same time</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {smartOpen && (
          <SmartMatchModal
            onClose={() => setSmartOpen(false)}
            onMatched={(group) => {
              setSmartOpen(false);
              setConfirming(group);
            }}
            existingGroups={groups}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {refilling && (
          <RefillModal
            group={refilling}
            onClose={() => setRefilling(null)}
            onConfirm={(picks) => handleRefill(refilling, picks)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelling && (
          <CancelReasonModal
            spotName={cancelling.spotName}
            onClose={() => setCancelling(null)}
            onConfirm={(reasonId, note) => handleCancel(cancelling, reasonId, note)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {soloCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
            onClick={() => setSoloCancel(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">Cancel solo session?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You're the only person left in <span className="font-medium text-foreground">{soloCancel.spotName}</span>.
              </p>
              <ul className="mt-3 space-y-1.5 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                <li>• No reason needed — nobody else is affected.</li>
                <li>• This cancellation won't appear on the cancel stats page.</li>
              </ul>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSoloCancel(null)}
                  className="h-12 flex-1 rounded-xl"
                >
                  Keep my seat
                </Button>
                <Button
                  onClick={() => {
                    handleCancel(soloCancel);
                    setSoloCancel(null);
                  }}
                  className="h-12 flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancel anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
            >
              <button onClick={() => setConfirming(null)} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">Confirm your seat</h2>
                <p className="mt-1 text-sm text-muted-foreground">Table is already reserved 24h ahead. Other members stay anonymous until you arrive.</p>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-border bg-background p-4">
                <Row label="Where" value={confirming.spotName} />
                <Row label="When" value={`${confirming.date}, ${confirming.time}`} />
                <Row label="Vibe" value={confirming.noisePreference} />
                <Row
                  label="Group size"
                  value={
                    isCapped(confirming)
                      ? `${confirming.anonymousMembers + 1}/${confirming.spotsTotal}`
                      : `${confirming.anonymousMembers + 1} · no cap`
                  }
                />
              </div>

              <Button onClick={() => handleJoin(confirming.id)} className="mt-6 h-12 w-full rounded-xl text-sm font-semibold">
                Confirm seat <Check className="ml-1 h-4 w-4" strokeWidth={3} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoiseTag({ noise }: { noise: Noise }) {
  const opt = NOISE_OPTIONS.find((o) => o.value === noise)!;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-primary">
      {opt.icon} {noise}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function RefillModal({
  group,
  onClose,
  onConfirm,
}: {
  group: StudyGroup;
  onClose: () => void;
  onConfirm: (picks: RefillCandidate[]) => void;
}) {
  const [stage, setStage] = useState<"searching" | "results">("searching");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // simulate auto-match
  useState(() => {
    const t = setTimeout(() => setStage("results"), 1400);
    return () => clearTimeout(t);
  });

  const matches = REFILL_POOL;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
        <button onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <X className="h-4 w-4" />
        </button>

        {stage === "searching" && (
          <div className="flex flex-col items-center py-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-accent border-t-transparent"
            />
            <p className="mt-5 font-display text-xl font-semibold">Refilling your session…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Finding students nearby at {group.spotName} with matching availability.
            </p>
          </div>
        )}

        {stage === "results" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-peach">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">
              {matches.length} students ready to join
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Same {group.noisePreference.toLowerCase()} vibe at {group.spotName}, free at {group.time}. One tap to add them.
            </p>

            <div className="mt-5 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {matches.map((c) => {
                const animal = ANIMALS.find((a) => a.id === c.animal);
                const picked = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border bg-background px-3 py-3 text-left transition",
                      picked ? "border-primary bg-accent-soft" : "border-border hover:border-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg", animal?.bg ?? "from-accent to-accent-soft")}>
                        {animal?.emoji ?? "🙂"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {c.initials}
                          {c.online && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-medium text-success">
                              <Wifi className="h-2.5 w-2.5" /> Online
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.availability}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{c.distance}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        picked ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      )}
                    >
                      {picked ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              disabled={selected.size === 0}
              onClick={() => onConfirm(matches.filter((m) => selected.has(m.id)))}
              className="mt-6 h-12 w-full rounded-xl text-sm font-semibold"
            >
              Add {selected.size || ""} to session <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function SmartMatchModal({
  onClose,
  onMatched,
  existingGroups,
}: {
  onClose: () => void;
  onMatched: (g: StudyGroup) => void;
  existingGroups: StudyGroup[];
}) {
  const [noise, setNoise] = useState<Noise | null>(null);
  const [, setSpotId] = useState<string | null>(null);
  const [stage, setStage] = useState<"noise" | "spot" | "searching" | "found">("noise");
  const [match, setMatch] = useState<StudyGroup | null>(null);

  const startMatching = (chosenSpotId: string, chosenNoise: Noise) => {
    setStage("searching");
    setTimeout(() => {
      const found =
        existingGroups.find(
          (g) =>
            g.spotName === SPOTS.find((s) => s.id === chosenSpotId)?.name &&
            g.noisePreference === chosenNoise &&
            !isFull(g)
        ) ??
        existingGroups.find((g) => g.noisePreference === chosenNoise && !isFull(g)) ??
        existingGroups[0];
      setMatch(found);
      setStage("found");
    }, 1500);
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
        <button onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <X className="h-4 w-4" />
        </button>

        {stage === "noise" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-peach">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">What's your vibe?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll match you anonymously with students who like the same noise level.</p>
            <div className="mt-5 flex flex-col gap-2">
              {NOISE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setNoise(o.value); setStage("spot"); }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-primary">{o.icon}</div>
                    <div>
                      <p className="text-sm font-semibold">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.hint}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </>
        )}

        {stage === "spot" && noise && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-peach">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Pick a place</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll pre-reserve a table here for you and your match — 24h in advance.</p>
            <div className="mt-5 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {SPOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSpotId(s.id); startMatching(s.id, noise); }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary"
                >
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.type} · {s.distance} · {s.noise}{s.type === "Cafe" ? " · 4 max" : " · no cap"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </>
        )}

        {stage === "searching" && (
          <div className="flex flex-col items-center py-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-accent border-t-transparent"
            />
            <p className="mt-5 font-display text-xl font-semibold">Matching you anonymously…</p>
            <p className="mt-1 text-sm text-muted-foreground">Finding students who prefer {noise?.toLowerCase()} sessions.</p>
          </div>
        )}

        {stage === "found" && match && (
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success text-success-foreground"
            >
              <Check className="h-7 w-7" strokeWidth={3} />
            </motion.div>
            <p className="mt-4 font-display text-xl font-semibold">Table found!</p>
            <p className="mt-2 text-sm text-foreground">
              <span className="font-semibold">{match.anonymousMembers}</span> anonymous student{match.anonymousMembers === 1 ? "" : "s"} at{" "}
              <span className="font-semibold">{match.spotName}</span> · {match.time}.
            </p>
            <Button onClick={() => onMatched(match)} className="mt-6 h-12 w-full rounded-xl text-sm font-semibold">
              Reserve my seat <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
