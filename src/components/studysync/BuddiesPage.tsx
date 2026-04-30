import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, X, MessageCircle, Check } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { BUDDIES, type Buddy } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAJORS = ["All", "Computer Science", "Economics", "Psychology", "Engineering", "Law", "Mathematics", "Biology"];
const HOBBIES = ["Gaming", "Reading", "Coffee", "Hiking", "Music", "Chess", "Photography"];
const GENDERS = ["All", "Male", "Female", "Non-binary"] as const;

export function BuddiesPage() {
  const [query, setQuery] = useState("");
  const [major, setMajor] = useState("All");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("All");
  const [hobby, setHobby] = useState<string | null>(null);
  const [selected, setSelected] = useState<Buddy | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return BUDDIES.filter((b) => {
      if (query && !b.name.toLowerCase().includes(query.toLowerCase()) && !b.major.toLowerCase().includes(query.toLowerCase())) return false;
      if (major !== "All" && b.major !== major) return false;
      if (gender !== "All" && b.gender !== gender) return false;
      if (hobby && !b.hobbies.includes(hobby)) return false;
      return true;
    });
  }, [query, major, gender, hobby]);

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

      {/* Pill filters */}
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

      {/* Grid */}
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
                <GradientAvatar initials={b.initials} gradient={b.avatarColor} size="md" />
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {b.rating}
                </span>
              </div>
              <p className="mt-3 line-clamp-1 font-display text-sm font-semibold">{b.name}</p>
              <p className="line-clamp-1 text-[11px] text-muted-foreground">{b.major}</p>
              <p className="text-[11px] text-muted-foreground">{b.year}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <StatusBadge variant="verified">Verified</StatusBadge>
                {isReq && <StatusBadge variant="success">Requested</StatusBadge>}
              </div>
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
              className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated md:rounded-3xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
              <button
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <GradientAvatar initials={selected.initials} gradient={selected.avatarColor} size="xl" />
                <h2 className="mt-4 font-display text-2xl font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.major} · {selected.year}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge variant="verified">Verified @ {selected.university}</StatusBadge>
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {selected.rating}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-center text-sm leading-relaxed text-foreground">
                {selected.bio}
              </p>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
