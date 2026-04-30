import { Star, Settings, GraduationCap, BookOpen, Heart, Calendar, LogOut, ChevronRight } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { CURRENT_USER } from "@/data/mockData";

export function ProfilePage({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex flex-col pb-6">
      <div className="relative gradient-hero px-6 pb-16 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">My profile</p>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="-mt-12 px-6">
        <div className="rounded-3xl bg-card p-6 shadow-elevated">
          <div className="flex items-start gap-4">
            <GradientAvatar initials={CURRENT_USER.initials} gradient="from-amber-200 to-rose-300" size="lg" />
            <div className="flex-1 pt-1">
              <h2 className="font-display text-xl font-semibold">{CURRENT_USER.name}</h2>
              <p className="text-xs text-muted-foreground">{CURRENT_USER.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge variant="verified">Verified @ {CURRENT_USER.university}</StatusBadge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
            <Stat label="Buddy rating" value={`${CURRENT_USER.rating}`} icon={<Star className="h-3.5 w-3.5 fill-accent text-accent" />} />
            <Stat label="Sessions" value="24" />
            <Stat label="Buddies" value="18" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 px-6">
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

        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-medium text-destructive shadow-soft"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="inline-flex items-center gap-1 font-display text-lg font-semibold">{icon}{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
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
