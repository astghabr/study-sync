import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ALLOWED_DOMAINS = ["kuleuven.be", "ugent.be", "vub.be", "uantwerpen.be", "ulb.be"];

const HOBBIES = ["Gaming", "Reading", "Coffee", "Hiking", "Music", "Films", "Yoga", "Cycling", "Chess", "Photography", "Painting", "Tea"];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<string[]>(["Gaming", "Coffee"]);

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

  return (
    <div className="relative flex min-h-full flex-1 flex-col gradient-warm">
      <div className="absolute inset-x-0 top-0 h-[55%] gradient-hero" />

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
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-1 flex-col"
          >
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
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-1 flex-col"
          >
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
          <motion.div
            key="step2"
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
