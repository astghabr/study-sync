import { motion } from "framer-motion";
import { Bell, Calendar, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { BUDDIES, CURRENT_USER, GROUPS, SPOTS } from "@/data/mockData";
import { Tab } from "./BottomNav";

export function HomePage({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const upcoming = GROUPS[0];
  const recommended = BUDDIES.slice(0, 4);
  const featured = SPOTS.slice(0, 3);

  return (
    <div className="flex flex-col gap-7 pb-6">
      {/* Header */}
      <header className="px-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Wednesday, 30 Apr</p>
            <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-foreground">
              Hi, {CURRENT_USER.name.split(" ")[0]}.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
              <Bell className="h-4 w-4 text-foreground" />
            </button>
            <GradientAvatar animal={CURRENT_USER.animal} initials={CURRENT_USER.initials} size="md" />
          </div>
        </div>
      </header>

      {/* Hero — upcoming session */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-elevated"
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Upcoming session
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
              {upcoming.spotName}
            </h2>
            <div className="mt-3 flex items-center gap-4 text-sm text-primary-foreground/95">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {upcoming.date} · {upcoming.time}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-primary-foreground/95">
              <MapPin className="h-4 w-4" /> {upcoming.noisePreference} vibe · anonymous group
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(upcoming.anonymousMembers, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-accent-soft text-[11px] font-semibold text-primary"
                  >
                    ?
                  </div>
                ))}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-accent text-[11px] font-bold text-primary">
                  +1
                </div>
              </div>
              <button
                onClick={() => onNavigate("groups")}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-primary"
              >
                View details <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3 px-6">
        <button
          onClick={() => onNavigate("buddies")}
          className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/30 hover:shadow-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="font-display text-base font-semibold">Find buddies</p>
          <p className="text-xs text-muted-foreground">12 new matches</p>
        </button>
        <button
          onClick={() => onNavigate("spots")}
          className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/30 hover:shadow-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <p className="font-display text-base font-semibold">Study spots</p>
          <p className="text-xs text-muted-foreground">6 nearby</p>
        </button>
      </section>

      {/* Recommended buddies */}
      <section>
        <div className="mb-3 flex items-center justify-between px-6">
          <h3 className="font-display text-lg font-semibold">For you</h3>
          <button onClick={() => onNavigate("buddies")} className="text-xs font-medium text-muted-foreground">
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-6 pb-1 scrollbar-hide">
          {recommended.map((b) => (
            <div
              key={b.id}
              className="flex w-44 shrink-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <GradientAvatar animal={b.animal} initials={b.initials} size="md" />
              </div>
              <p className="mt-3 truncate font-display text-sm font-semibold">{b.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{b.major} · {b.year}</p>
              <div className="mt-3">
                <StatusBadge variant="verified">Verified</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured spots */}
      <section>
        <div className="mb-3 flex items-center justify-between px-6">
          <h3 className="font-display text-lg font-semibold">Featured spots</h3>
          <button onClick={() => onNavigate("spots")} className="text-xs font-medium text-muted-foreground">
            See all
          </button>
        </div>
        <div className="flex flex-col gap-3 px-6">
          {featured.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
              <div className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${s.hero}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-sm font-semibold">{s.name}</p>
                  {s.official && <StatusBadge variant="official">Official</StatusBadge>}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {s.type} · {s.distance} · {s.noise}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {s.laptopPolicy === "Not Allowed" && <StatusBadge variant="no-laptop">No laptops</StatusBadge>}
                  {s.noise === "Quiet" && <StatusBadge variant="quiet">Quiet zone</StatusBadge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
