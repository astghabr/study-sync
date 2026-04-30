import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Users, Check, ArrowRight, X, Volume2, VolumeX, Volume1, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GROUPS, SPOTS, type StudyGroup } from "@/data/mockData";
import { cn } from "@/lib/utils";

type Noise = "Quiet" | "Moderate" | "Lively";
const NOISE_OPTIONS: { value: Noise; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: "Quiet", label: "Quiet", hint: "Library energy", icon: <VolumeX className="h-4 w-4" /> },
  { value: "Moderate", label: "Moderate", hint: "Soft chatter", icon: <Volume1 className="h-4 w-4" /> },
  { value: "Lively", label: "Lively", hint: "Cafe buzz", icon: <Volume2 className="h-4 w-4" /> },
];

export function GroupsPage() {
  const [groups, setGroups] = useState(GROUPS);
  const [joined, setJoined] = useState<Set<string>>(new Set(["g1"]));
  const [smartOpen, setSmartOpen] = useState(false);
  const [confirming, setConfirming] = useState<StudyGroup | null>(null);

  const handleJoin = (id: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id && g.spotsRemaining > 0
          ? { ...g, spotsRemaining: g.spotsRemaining - 1, anonymousMembers: g.anonymousMembers + 1 }
          : g
      )
    );
    setJoined((prev) => new Set(prev).add(id));
    setConfirming(null);
  };

  return (
    <div className="flex flex-col pb-6">
      <header className="px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Smart match</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight">Group sessions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anonymous study groups in pre-reserved spots — matched by vibe, not subject.
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
              <p className="font-display text-base font-semibold text-primary">Smart Study match</p>
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
          const isFull = g.spotsRemaining === 0;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold">{g.spotName}</p>
                    <NoiseTag noise={g.noisePreference} />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {g.date} · {g.time}</p>
                    <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Table pre-reserved · anonymous</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-display text-2xl font-semibold leading-none",
                    isFull ? "text-muted-foreground" : "text-primary"
                  )}>
                    {g.spotsRemaining}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">spots left</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
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
                    <Users className="mr-1 h-3 w-3" /> {g.anonymousMembers}/{g.spotsTotal}
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={isJoined || isFull}
                  onClick={() => setConfirming(g)}
                  className={cn(
                    "h-9 rounded-full px-4 text-xs font-semibold",
                    isJoined && "bg-success hover:bg-success/90"
                  )}
                >
                  {isJoined ? (<><Check className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Joined</>) : isFull ? "Full" : "Join table"}
                </Button>
              </div>
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
                <p className="mt-1 text-sm text-muted-foreground">Table is already reserved. Other members stay anonymous until you arrive.</p>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-border bg-background p-4">
                <Row label="Where" value={confirming.spotName} />
                <Row label="When" value={`${confirming.date}, ${confirming.time}`} />
                <Row label="Vibe" value={confirming.noisePreference} />
                <Row label="Group size" value={`${confirming.anonymousMembers + 1}/${confirming.spotsTotal}`} />
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
  const [spotId, setSpotId] = useState<string | null>(null);
  const [stage, setStage] = useState<"noise" | "spot" | "searching" | "found">("noise");
  const [match, setMatch] = useState<StudyGroup | null>(null);

  const startMatching = (chosenSpotId: string, chosenNoise: Noise) => {
    setStage("searching");
    setTimeout(() => {
      // pick others with same noise preference, randomly seated at the chosen spot
      const found =
        existingGroups.find(
          (g) => g.spotName === SPOTS.find((s) => s.id === chosenSpotId)?.name && g.noisePreference === chosenNoise && g.spotsRemaining > 0
        ) ??
        existingGroups.find((g) => g.noisePreference === chosenNoise && g.spotsRemaining > 0) ??
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
            <p className="mt-1 text-sm text-muted-foreground">We'll pre-reserve a table here for you and your match.</p>
            <div className="mt-5 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {SPOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSpotId(s.id); startMatching(s.id, noise); }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary"
                >
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.type} · {s.distance} · {s.noise}</p>
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
