import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimalAvatar } from "./Avatar";
import { ANIMALS, PROFILE_PROMPTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

const ALLOWED_DOMAINS = ["kuleuven.be", "ugent.be", "vub.be", "uantwerpen.be", "ulb.be"];

const HOBBIES = ["Gaming", "Reading", "Coffee", "Hiking", "Music", "Films", "Yoga", "Cycling", "Chess", "Photography", "Painting", "Tea"];

type Step = 0 | 1 | 2 | 3 | 4;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<string[]>(["Gaming", "Coffee"]);
  const [animal, setAnimal] = useState<string>("fox");
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>([
    { question: PROFILE_PROMPTS[0], answer: "" },
    { question: PROFILE_PROMPTS[2], answer: "" },
  ]);

  const handleVerify = () => {
    const lower = email.trim().toLowerCase();
    if (!lower.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    const domain = lower.split("@")[1];
    if (!ALLOWED_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) {
      setError("Only verified university emails are accepted (e.g. @kuleuven.be).");
      return;
    }
    setError("");
    setStep(1);
  };

  const togglePick = (h: string) =>
    setPicked((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]));

  const setQ = (i: number, q: string) =>
    setPrompts((arr) => arr.map((p, idx) => (idx === i ? { ...p, question: q } : p)));
  const setA = (i: number, a: string) =>
    setPrompts((arr) => arr.map((p, idx) => (idx === i ? { ...p, answer: a } : p)));
  const removePrompt = (i: number) => setPrompts((arr) => arr.filter((_, idx) => idx !== i));
  const addPrompt = () => {
    if (prompts.length >= 3) return;
    const used = new Set(prompts.map((p) => p.question));
    const next = PROFILE_PROMPTS.find((q) => !used.has(q)) ?? PROFILE_PROMPTS[0];
    setPrompts((arr) => [...arr, { question: next, answer: "" }]);
  };

  const promptsValid = prompts.length >= 1 && prompts.every((p) => p.answer.trim().length >= 3);

  return (
    <div className="relative flex min-h-full flex-1 flex-col gradient-warm">
      {/* Final step uses full navy bg; earlier steps keep the navy header band */}
      {step !== 4 && <div className="absolute inset-x-0 top-0 h-[55%] gradient-hero" />}
      {step === 4 && <div className="absolute inset-0 gradient-hero" />}

      <div className="relative flex flex-1 flex-col px-6 pb-8 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-primary-foreground"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <GraduationCap className="h-5 w-5 text-primary" strokeWidth={2.4} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">StudySync</span>
        </motion.div>

        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-primary-foreground">
              Find your study people.
            </h1>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/80">
              Verified students. Real study spots. Sessions that actually happen.
            </p>

            <div className="mt-auto rounded-3xl bg-card p-6 shadow-elevated">
              <p className="font-display text-2xl font-semibold text-foreground">
                Verify your university
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We use your institutional email to keep the community exclusive and safe.
              </p>

              <div className="relative mt-5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kuleuven.be"
                  className="h-12 rounded-xl pl-9 text-sm"
                  type="email"
                  autoComplete="email"
                />
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

              <Button onClick={handleVerify} className="mt-4 h-12 w-full rounded-xl text-sm font-semibold">
                Verify email <ArrowRight className="ml-1 h-4 w-4" />
              </Button>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Try <button onClick={() => setEmail("marie.dubois@kuleuven.be")} className="underline underline-offset-2">marie.dubois@kuleuven.be</button>
              </p>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-primary-foreground">
              What do you love?
            </h1>
            <p className="mt-3 text-sm text-primary-foreground/80">
              We'll match you with buddies who share your vibe.
            </p>

            <div className="mt-auto rounded-3xl bg-card p-6 shadow-elevated">
              <p className="text-sm font-medium text-foreground">Pick at least 3 hobbies</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {HOBBIES.map((h) => {
                  const on = picked.includes(h);
                  return (
                    <button
                      key={h}
                      onClick={() => togglePick(h)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      )}
                    >
                      {on && <Check className="mr-1 inline h-3 w-3" strokeWidth={3} />}
                      {h}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={picked.length < 3}
                className="mt-6 h-12 w-full rounded-xl text-sm font-semibold"
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-primary-foreground">
              Pick your animal.
            </h1>
            <p className="mt-3 text-sm text-primary-foreground/80">
              No selfies here — just the cute creature that feels like you.
            </p>

            <div className="mt-auto rounded-3xl bg-card p-6 shadow-elevated">
              <div className="flex items-center gap-4">
                <AnimalAvatar animal={animal} size="lg" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected</p>
                  <p className="font-display text-lg font-semibold">
                    {ANIMALS.find((a) => a.id === animal)?.label}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {ANIMALS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAnimal(a.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition",
                      animal === a.id
                        ? "border-primary bg-accent-soft"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <AnimalAvatar animal={a.id} size="sm" />
                    <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
                  </button>
                ))}
              </div>

              <Button onClick={() => setStep(3)} className="mt-6 h-12 w-full rounded-xl text-sm font-semibold">
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-primary-foreground">
              Show your vibe.
            </h1>
            <p className="mt-3 text-sm text-primary-foreground/80">
              Pick a couple of prompts and answer them. Real beats polished.
            </p>

            <div className="mt-6 max-h-[55vh] space-y-3 overflow-y-auto rounded-3xl bg-card p-5 shadow-elevated">
              {prompts.map((p, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Prompt {i + 1}
                    </p>
                    {prompts.length > 1 && (
                      <button
                        onClick={() => removePrompt(i)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PROFILE_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQ(i, q)}
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
                    onChange={(e) => setA(i, e.target.value.slice(0, 200))}
                    placeholder="Your answer…"
                    className="mt-3 min-h-[80px] rounded-xl text-sm"
                    maxLength={200}
                  />
                  <p className="mt-1 text-right text-[10px] text-muted-foreground">
                    {p.answer.length}/200
                  </p>
                </div>
              ))}
              {prompts.length < 3 && (
                <button
                  onClick={addPrompt}
                  className="flex w-full items-center justify-center rounded-2xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  + Add another prompt
                </button>
              )}
            </div>

            <Button
              onClick={() => setStep(4)}
              disabled={!promptsValid}
              className="mt-4 h-12 w-full rounded-xl text-sm font-semibold"
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-peach"
            >
              <Check className="h-10 w-10 text-primary" strokeWidth={3} />
            </motion.div>
            <h2 className="mt-6 font-display text-3xl font-semibold text-primary-foreground">
              You're verified!
            </h2>
            <p className="mt-2 max-w-xs text-sm text-primary-foreground/80">
              Welcome to StudySync, KU Leuven. Let's find your first study session.
            </p>
            <Button onClick={onComplete} className="mt-10 h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/90">
              Enter StudySync <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
