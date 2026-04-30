import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, MessageCircle, Check, Flag, ShieldAlert } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { BUDDIES, type Buddy } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MAJORS = ["All", "Computer Science", "Economics", "Psychology", "Engineering", "Law", "Mathematics", "Biology"];
const HOBBIES = ["Gaming", "Reading", "Coffee", "Hiking", "Music", "Chess", "Photography"];
const GENDERS = ["All", "Male", "Female", "Non-binary"] as const;
const YEARS = ["All", "1st Year", "2nd Year", "3rd Year", "1st Year Master", "2nd Year Master"];

const REPORT_REASONS = [
  "Inappropriate behaviour",
  "Harassment or bullying",
  "Fake or misleading profile",
  "Spam",
  "Other",
];

export function BuddiesPage() {
  const [query, setQuery] = useState("");
  const [major, setMajor] = useState("All");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("All");
  const [year, setYear] = useState("All");
  const [hobby, setHobby] = useState<string | null>(null);
  const [selected, setSelected] = useState<Buddy | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [reporting, setReporting] = useState<Buddy | null>(null);

  const filtered = useMemo(() => {
    return BUDDIES.filter((b) => {
      if (query && !b.name.toLowerCase().includes(query.toLowerCase()) && !b.major.toLowerCase().includes(query.toLowerCase())) return false;
      if (major !== "All" && b.major !== major) return false;
      if (gender !== "All" && b.gender !== gender) return false;
      if (year !== "All" && b.year !== year) return false;
      if (hobby && !b.hobbies.includes(hobby)) return false;
      return true;
    });
  }, [query, major, gender, year, hobby]);

  const activeFilterCount =
    (major !== "All" ? 1 : 0) +
    (gender !== "All" ? 1 : 0) +
    (year !== "All" ? 1 : 0) +
    (hobby ? 1 : 0);
  const clearFilters = () => {
    setMajor("All");
    setGender("All");
    setYear("All");
    setHobby(null);
  };

  const toggleRequest = (id: string) => {
    setRequested((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="flex flex-col pb-6">
      <header className="px-6 pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Discover</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight">Find buddies</h1>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or major"
            className="h-11 rounded-xl border-border bg-card pl-9 text-sm"
          />
        </div>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-hide">
        <button className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground">
          <SlidersHorizontal className="h-3 w-3" /> Filters
        </button>
        {MAJORS.slice(1).map((m) => (
          <button
            key={m}
            onClick={() => setMajor((cur) => (cur === m ? "All" : m))}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              major === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-hide">
        {GENDERS.map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium",
              gender === g ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
            )}
          >
            {g === "All" ? "All genders" : g}
          </button>
        ))}
        {HOBBIES.map((h) => (
          <button
            key={h}
            onClick={() => setHobby((cur) => (cur === h ? null : h))}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium",
              hobby === h ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-foreground"
            )}
          >
            #{h}
          </button>
        ))}
      </div>

      <div className="mt-4 px-6">
        <p className="text-xs text-muted-foreground">{filtered.length} verified students</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-6">
        {filtered.map((b, i) => {
          const isReq = requested.has(b.id);
          return (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(b)}
              className="flex flex-col items-start rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:shadow-card"
            >
              <div className="flex w-full items-start justify-between">
                <GradientAvatar animal={b.animal} initials={b.initials} size="md" />
              </div>
              <p className="mt-3 line-clamp-1 font-display text-sm font-semibold">{b.name}</p>
              <p className="line-clamp-1 text-[11px] text-muted-foreground">{b.major}</p>
              <p className="text-[11px] text-muted-foreground">{b.year}</p>
              {isReq && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <StatusBadge variant="success">Requested</StatusBadge>
                </div>
              )}
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">No matches. Try different filters.</p>
          </div>
        )}
      </div>

      {/* Bio modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
              <button
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <GradientAvatar animal={selected.animal} initials={selected.initials} size="xl" />
                <h2 className="mt-4 font-display text-2xl font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.major} · {selected.year}</p>
                <p className="mt-1 text-xs text-muted-foreground">{selected.university}</p>
              </div>

              <p className="mt-5 text-center text-sm leading-relaxed text-foreground">
                {selected.bio}
              </p>

              {selected.prompts.length > 0 && (
                <div className="mt-5 space-y-2">
                  {selected.prompts.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-accent-soft/40 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {p.question}
                      </p>
                      <p className="mt-1 font-display text-base leading-snug text-foreground">
                        {p.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hobbies</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {selected.hobbies.map((h) => (
                    <span key={h} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-12 rounded-xl">
                  <MessageCircle className="mr-1 h-4 w-4" /> Message
                </Button>
                <Button
                  onClick={() => toggleRequest(selected.id)}
                  className={cn("h-12 rounded-xl", requested.has(selected.id) && "bg-success hover:bg-success/90")}
                >
                  {requested.has(selected.id) ? (
                    <><Check className="mr-1 h-4 w-4" strokeWidth={3} /> Requested</>
                  ) : (
                    "Request to study"
                  )}
                </Button>
              </div>

              <button
                onClick={() => setReporting(selected)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-muted-foreground transition hover:text-destructive"
              >
                <Flag className="h-3.5 w-3.5" /> Report this profile
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportModal target={reporting} onClose={() => setReporting(null)} />
    </div>
  );
}

function ReportModal({ target, onClose }: { target: Buddy | null; onClose: () => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setReason(null);
    setDetails("");
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const trimmed = details.trim();
  const isValid = !!reason && trimmed.length >= 10 && trimmed.length <= 500;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
    toast({
      title: "Report submitted",
      description: "Thanks — our team will review this within 24 hours.",
    });
    setTimeout(handleClose, 1200);
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/50 backdrop-blur-sm md:items-center"
          onClick={handleClose}
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
              onClick={handleClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Report {target.name}</h3>
                <p className="text-xs text-muted-foreground">Reports are confidential.</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      reason === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Details
              </p>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                placeholder="Tell us what happened (10–500 characters)…"
                className="mt-2 min-h-[110px] rounded-2xl text-sm"
                maxLength={500}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{trimmed.length < 10 ? "At least 10 characters required" : "Looks good"}</span>
                <span>{details.length}/500</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitted}
              className="mt-5 h-12 w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitted ? (
                <><Check className="mr-1 h-4 w-4" strokeWidth={3} /> Report sent</>
              ) : (
                "Submit report"
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
