import { useState } from "react";
import { Settings, GraduationCap, BookOpen, Heart, Calendar, LogOut, ChevronRight, Pencil, X, Check, Plus, Crown, Sparkles, Flame, TrendingUp, Clock } from "lucide-react";
import { GradientAvatar, AnimalAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER, ANIMALS, PROFILE_PROMPTS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AdminAnalytics } from "./AdminAnalytics";
import { useSubscription, subscriptionStore } from "@/lib/subscriptionStore";
import { useFocusStats, deriveStats } from "@/lib/focusStatsStore";
import { UpgradeModal } from "./UpgradeModal";
import { toast } from "@/hooks/use-toast";

export function ProfilePage({ onSignOut }: { onSignOut: () => void }) {
  const [animal, setAnimal] = useState(CURRENT_USER.animal);
  const [prompts, setPrompts] = useState(CURRENT_USER.prompts);
  const [editingAnimal, setEditingAnimal] = useState(false);
  const [editingPrompts, setEditingPrompts] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const sub = useSubscription();

  return (
    <div className="flex flex-col pb-6">
      {/* Hero header */}
      <div className="gradient-hero px-6 pt-10 pb-8 text-primary-foreground">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
            My profile
          </p>
          <button
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 flex items-center gap-4">
          <button
            onClick={() => setEditingAnimal(true)}
            className="relative shrink-0"
            aria-label="Change profile animal"
          >
            <GradientAvatar animal={animal} initials={CURRENT_USER.initials} size="lg" />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-primary shadow-card">
              <Pencil className="h-3 w-3" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold leading-tight text-primary-foreground">
              {CURRENT_USER.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-primary-foreground/80">
              {CURRENT_USER.email}
            </p>
            <p className="text-xs text-primary-foreground/70">
              {CURRENT_USER.university}
            </p>
          </div>
        </div>
      </div>

      {/* Stats card — sits flush below hero, no overlap */}
      <div className="px-6 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4 text-foreground shadow-soft">
          <div className="grid grid-cols-2 divide-x divide-border">
            <Stat label="Sessions" value="24" />
            <Stat label="Buddies" value="18" />
          </div>
        </div>
      </div>

      {/* Focus stats — streaks + weekly */}
      <div className="px-6 pt-4">
        <FocusStatsCard />
      </div>

      <div className="mt-6 space-y-4 px-6">
        <Section
          title="Prompts"
          action={
            <button
              onClick={() => setEditingPrompts(true)}
              className="text-[11px] font-medium uppercase tracking-wider text-primary"
            >
              Edit
            </button>
          }
        >
          <div className="space-y-2 p-3">
            {prompts.map((p, i) => (
              <div key={i} className="rounded-xl bg-accent-soft/50 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {p.question}
                </p>
                <p className="mt-1 font-display text-base leading-snug text-foreground">
                  {p.answer}
                </p>
              </div>
            ))}
            {prompts.length === 0 && (
              <button
                onClick={() => setEditingPrompts(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-6 text-xs font-medium text-muted-foreground hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Add a prompt
              </button>
            )}
          </div>
        </Section>

        <Section title="Academic">
          <Row icon={<GraduationCap className="h-4 w-4" />} label="University" value={CURRENT_USER.university} />
          <Row icon={<BookOpen className="h-4 w-4" />} label="Major" value={CURRENT_USER.major} />
          <Row icon={<Calendar className="h-4 w-4" />} label="Year" value={CURRENT_USER.year} />
        </Section>

        <Section title="Study preferences">
          <Row icon={<BookOpen className="h-4 w-4" />} label="Preferred noise" value="Quiet → Moderate" />
          <Row icon={<Calendar className="h-4 w-4" />} label="Best time" value="Mornings" />
        </Section>

        <Section title="Hobbies">
          <div className="flex flex-wrap gap-1.5 px-4 py-3">
            {CURRENT_USER.hobbies.map((h) => (
              <span key={h} className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
                <Heart className="h-3 w-3" /> {h}
              </span>
            ))}
          </div>
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          {sub.isPro ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 font-display text-base font-semibold text-foreground">
                    StudySync Pro
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                      {sub.plan === "pro-yearly" ? "YEARLY" : "MONTHLY"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Renews{" "}
                    {sub.renewsAt
                      ? new Date(sub.renewsAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  subscriptionStore.cancel();
                  toast({
                    title: "Subscription cancelled",
                    description: "You're back on the Free plan.",
                  });
                }}
                className="mt-3 w-full rounded-xl border border-border bg-card py-2.5 text-xs font-medium text-muted-foreground"
              >
                Cancel subscription
              </button>
            </div>
          ) : (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-semibold text-foreground">
                  Upgrade to Pro
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Advanced Focus, spot reservations & insights — from €3.33/mo
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </Section>

        {(CURRENT_USER.role === "admin" || CURRENT_USER.role === "moderator") && (
          <div className="mb-3">
            <AdminAnalytics />
          </div>
        )}

        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-medium text-destructive shadow-soft"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <AnimalPickerModal
        open={editingAnimal}
        current={animal}
        onClose={() => setEditingAnimal(false)}
        onPick={(id) => {
          setAnimal(id);
          setEditingAnimal(false);
        }}
      />

      <PromptsEditorModal
        open={editingPrompts}
        initial={prompts}
        onClose={() => setEditingPrompts(false)}
        onSave={(p) => {
          setPrompts(p);
          setEditingPrompts(false);
        }}
      />

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="inline-flex items-center gap-1 font-display text-xl font-semibold text-foreground">
        {icon}
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function FocusStatsCard() {
  const sessions = useFocusStats();
  const { weeklySeconds, sessionsThisWeek, streak, days } = deriveStats(sessions);
  const weeklyHours = weeklySeconds / 3600;
  const goalHours = 10;
  const progress = Math.min(1, weeklyHours / goalHours);
  const maxMin = Math.max(60, ...days.map((d) => d.minutes));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Focus stats</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">
            {streak}-day streak
          </span>
        </div>
      </div>

      {/* Weekly goal */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-2xl font-semibold text-foreground tabular-nums">
            {weeklyHours.toFixed(1)}<span className="text-sm font-medium text-muted-foreground">h</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            <Clock className="mr-1 inline h-3 w-3" />
            {sessionsThisWeek} sessions · goal {goalHours}h
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Weekly bars */}
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const h = (d.minutes / maxMin) * 100;
          return (
            <div key={d.t} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, d.minutes > 0 ? 10 : 4)}%` }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className={cn(
                  "w-full rounded-md",
                  isToday ? "bg-primary" : "bg-accent"
                )}
              />
              <span
                className={cn(
                  "text-[9px]",
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
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
        {action}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">{children}</div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-primary">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function AnimalPickerModal({
  open,
  current,
  onClose,
  onPick,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl font-semibold">Pick your animal</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the cute creature that resonates with you most.
            </p>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {ANIMALS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onPick(a.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition",
                    current === a.id
                      ? "border-primary bg-accent-soft"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <AnimalAvatar animal={a.id} size="md" />
                  <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PromptsEditorModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: { question: string; answer: string }[];
  onClose: () => void;
  onSave: (p: { question: string; answer: string }[]) => void;
}) {
  const [draft, setDraft] = useState(initial);

  const setQuestion = (i: number, q: string) =>
    setDraft((d) => d.map((p, idx) => (idx === i ? { ...p, question: q } : p)));
  const setAnswer = (i: number, a: string) =>
    setDraft((d) => d.map((p, idx) => (idx === i ? { ...p, answer: a } : p)));

  const addPrompt = () => {
    if (draft.length >= 1) return;
    setDraft((d) => [...d, { question: PROFILE_PROMPTS[0], answer: "" }]);
  };
  const removePrompt = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));

  const valid = draft.every((p) => p.answer.trim().length >= 3 && p.answer.length <= 200);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl font-semibold">Your prompt</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick one prompt and answer it — give people a peek at your vibe.
            </p>

            <div className="mt-5 space-y-4">
              {draft.map((p, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Prompt {i + 1}
                    </p>
                    <button
                      onClick={() => removePrompt(i)}
                      className="text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PROFILE_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuestion(i, q)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                          p.question === q
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={p.answer}
                    onChange={(e) => setAnswer(i, e.target.value.slice(0, 200))}
                    placeholder="Your answer…"
                    className="mt-3 min-h-[80px] rounded-xl text-sm"
                    maxLength={200}
                  />
                  <p className="mt-1 text-right text-[10px] text-muted-foreground">
                    {p.answer.length}/200
                  </p>
                </div>
              ))}

              {draft.length < 1 && (
                <button
                  onClick={addPrompt}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-4 text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4" /> Add a prompt
                </button>
              )}
            </div>

            <Button
              onClick={() => onSave(draft)}
              disabled={!valid}
              className="mt-5 h-12 w-full rounded-xl"
            >
              <Check className="mr-1 h-4 w-4" strokeWidth={3} /> Save prompts
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
