import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowRight, Check, X, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimalAvatar } from "./Avatar";
import { ANIMALS, PROFILE_PROMPTS } from "@/data/mockData";
import { tourStore } from "@/lib/tourStore";
import { cn } from "@/lib/utils";

// Allowed institutional domains. We accept exact match or any subdomain (e.g. student.kuleuven.be).
// Generic .edu / .ac.* TLDs are also accepted as a catch-all for international students.
const ALLOWED_DOMAINS = ["kuleuven.be", "ugent.be", "vub.be", "uantwerpen.be", "ulb.be", "uliege.be", "uhasselt.be"];
const ACADEMIC_TLDS = [".edu", ".ac.uk", ".ac.be", ".ac.nl", ".edu.au", ".ac.jp"];

const HOBBIES = ["Gaming", "Reading", "Coffee", "Hiking", "Music", "Films", "Yoga", "Cycling", "Chess", "Photography", "Painting", "Tea"];

type Step = 0 | 1 | 2 | 3 | 4;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [picked, setPicked] = useState<string[]>(["Gaming", "Coffee"]);
  const [animal, setAnimal] = useState<string>("fox");
  const [prompt, setPrompt] = useState<{ question: string; answer: string }>({
    question: PROFILE_PROMPTS[0],
    answer: "",
  });

  const validEmail = (raw: string): { ok: boolean; reason?: string } => {
    const lower = raw.trim().toLowerCase();
    // basic shape
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) {
      return { ok: false, reason: "Please enter a valid email address." };
    }
    const domain = lower.split("@")[1];
    const domainOk =
      ALLOWED_DOMAINS.some((d) => domain === d || domain.endsWith("." + d)) ||
      ACADEMIC_TLDS.some((tld) => domain.endsWith(tld));
    if (!domainOk) {
      return { ok: false, reason: "Use your university email (e.g. @kuleuven.be or .edu)." };
    }
    return { ok: true };
  };

  const handleVerify = () => {
    const check = validEmail(email);
    if (!check.ok) {
      setError(check.reason ?? "Invalid email.");
      return;
    }
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setVerifying(true);
    // Simulated verification delay (in production: send magic link / OTP)
    window.setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      window.setTimeout(() => {
        if (mode === "login") {
          // Skip the rest of onboarding for returning users
          onComplete();
        } else {
          setStep(1);
        }
      }, 600);
    }, 900);
  };

  const togglePick = (h: string) =>
    setPicked((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]));

  const promptValid = prompt.answer.trim().length >= 3;

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
              Study sessions that actually happen.
            </h1>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/95">
              Verified students. Real study spots. Sessions that actually happen.
            </p>

            <div className="mt-auto rounded-3xl bg-card p-6 shadow-elevated">
              {/* Login / Register switcher */}
              <div className="flex rounded-full bg-secondary p-1">
                {(["register", "login"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                    }}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                      mode === m
                        ? "bg-card text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "register" ? "Create account" : "Log in"}
                  </button>
                ))}
              </div>

              <p className="mt-5 font-display text-2xl font-semibold text-foreground">
                {mode === "register" ? "Verify your university" : "Welcome back"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "register"
                  ? "We'll check your institutional email to keep things safe."
                  : "Sign in with your university email to pick up where you left off."}
              </p>

              <div className="relative mt-5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@kuleuven.be"
                  className="h-12 rounded-xl pl-9 text-sm"
                  type="email"
                  autoComplete="email"
                  disabled={verifying || verified}
                />
                {verified && (
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" strokeWidth={3} />
                )}
              </div>

              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder={mode === "register" ? "Create a password (min 8 chars)" : "Password"}
                className="mt-2 h-12 rounded-xl text-sm"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                maxLength={72}
                disabled={verifying || verified}
              />

              {mode === "register" && (
                <Input
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Confirm password"
                  className="mt-2 h-12 rounded-xl text-sm"
                  type="password"
                  autoComplete="new-password"
                  maxLength={72}
                  disabled={verifying || verified}
                />
              )}

              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              {!error && mode === "register" && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Accepted: @kuleuven.be, @ugent.be, .edu, .ac.uk and other academic domains.
                </p>
              )}

              <Button
                onClick={handleVerify}
                disabled={verifying || verified}
                className="mt-4 h-12 w-full rounded-xl text-sm font-semibold"
              >
                {verifying ? (
                  <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> {mode === "login" ? "Signing in…" : "Verifying…"}</>
                ) : verified ? (
                  <><Check className="mr-1 h-4 w-4" strokeWidth={3} /> {mode === "login" ? "Signed in" : "Verified"}</>
                ) : (
                  <>{mode === "login" ? "Log in" : "Verify email"} <ArrowRight className="ml-1 h-4 w-4" /></>
                )}
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
            <p className="mt-3 text-sm text-primary-foreground/95">
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
            <p className="mt-3 text-sm text-primary-foreground/95">
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
            <p className="mt-3 text-sm text-primary-foreground/95">
              Pick one prompt and answer it. Real beats polished.
            </p>

            <div className="mt-auto rounded-3xl bg-card p-5 shadow-elevated">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Pick a prompt
                </p>
                <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                  {PROFILE_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setPrompt((p) => ({ ...p, question: q }))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                        prompt.question === q
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={prompt.answer}
                  onChange={(e) => setPrompt((p) => ({ ...p, answer: e.target.value.slice(0, 200) }))}
                  placeholder="Your answer…"
                  className="mt-3 min-h-[90px] rounded-xl text-sm"
                  maxLength={200}
                />
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {prompt.answer.length}/200
                </p>
              </div>
            </div>

            <Button
              onClick={() => setStep(4)}
              disabled={!promptValid}
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
            <p className="mt-2 max-w-xs text-sm text-primary-foreground/95">
              Welcome to StudySync, KU Leuven. Let's find your first study session.
            </p>
            <Button
              onClick={() => {
                tourStore.reset();
                onComplete();
              }}
              className="mt-10 h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/90"
            >
              Enter StudySync <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
