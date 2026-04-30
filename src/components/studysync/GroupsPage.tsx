import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Users, Check, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GROUPS, type StudyGroup } from "@/data/mockData";
import { cn } from "@/lib/utils";

const SUBJECTS = ["Statistics", "Algorithms", "EU Law Review", "Macroeconomics", "Molecular Biology"];

export function GroupsPage() {
  const [groups, setGroups] = useState(GROUPS);
  const [joined, setJoined] = useState<Set<string>>(new Set(["g1"]));
  const [smartOpen, setSmartOpen] = useState(false);
  const [confirming, setConfirming] = useState<StudyGroup | null>(null);

  const handleJoin = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id && g.spotsRemaining > 0 ? { ...g, spotsRemaining: g.spotsRemaining - 1 } : g))
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
          Curated by StudySync — verified students, reserved tables.
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
              <p className="text-xs text-primary/80">Pick a subject, we'll find your group</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </button>
      </header>

      <h2 className="mb-3 mt-7 px-6 font-display text-lg font-semibold">Available groups</h2>

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
                    <p className="font-display text-base font-semibold">{g.subject}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">{g.level}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {g.date} · {g.time}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {g.spotName}</p>
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
                  {g.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br from-amber-200 to-orange-300 text-[10px] font-semibold text-primary"
                    >
                      {m}
                    </div>
                  ))}
                  <div className="flex h-7 items-center justify-center rounded-full border-2 border-card bg-secondary px-2 text-[10px] font-medium text-foreground">
                    <Users className="mr-1 h-3 w-3" /> {g.spotsTotal - g.spotsRemaining}/{g.spotsTotal}
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
                  {isJoined ? (<><Check className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Joined</>) : isFull ? "Full" : "Join group"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Smart match modal */}
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

      {/* Reservation confirmation */}
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
              className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
            >
              <button onClick={() => setConfirming(null)} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">Confirm your spot</h2>
                <p className="mt-1 text-sm text-muted-foreground">A table will be reserved automatically.</p>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-border bg-background p-4">
                <Row label="Subject" value={confirming.subject} />
                <Row label="When" value={`${confirming.date}, ${confirming.time}`} />
                <Row label="Where" value={confirming.spotName} />
                <Row label="Group size" value={`${confirming.spotsTotal - confirming.spotsRemaining + 1}/${confirming.spotsTotal}`} />
              </div>

              <Button onClick={() => handleJoin(confirming.id)} className="mt-6 h-12 w-full rounded-xl text-sm font-semibold">
                Confirm & reserve table <Check className="ml-1 h-4 w-4" strokeWidth={3} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [subject, setSubject] = useState<string | null>(null);
  const [stage, setStage] = useState<"pick" | "searching" | "found">("pick");
  const [match, setMatch] = useState<StudyGroup | null>(null);

  const start = (s: string) => {
    setSubject(s);
    setStage("searching");
    setTimeout(() => {
      const found =
        existingGroups.find((g) => g.subject === s && g.spotsRemaining > 0) ?? existingGroups[0];
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

        {stage === "pick" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-peach">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">What are you studying?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll match you with a verified group nearby.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => start(s)}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {s}
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
            <p className="mt-5 font-display text-xl font-semibold">Finding your group…</p>
            <p className="mt-1 text-sm text-muted-foreground">Scanning verified {subject} students.</p>
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
            <p className="mt-4 font-display text-xl font-semibold">Found a match!</p>
            <p className="mt-2 text-sm text-foreground">
              A group of <span className="font-semibold">{match.spotsTotal - match.spotsRemaining}</span> at{" "}
              <span className="font-semibold">{match.spotName}</span> at{" "}
              <span className="font-semibold">{match.time}</span>.
            </p>
            <Button onClick={() => onMatched(match)} className="mt-6 h-12 w-full rounded-xl text-sm font-semibold">
              Join this group <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
