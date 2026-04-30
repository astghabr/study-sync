import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, MapPin, Users, ArrowRight, Sparkles, AlertTriangle, MessageSquare } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { StatusBadge } from "./Badge";
import { AdSlot } from "./AdSlot";
import { NotificationCenter } from "./NotificationCenter";
import { BUDDIES, CURRENT_USER, GROUPS, SPOTS } from "@/data/mockData";
import { Tab } from "./BottomNav";
import { useRiskNotices, riskNoticeStore } from "@/lib/riskNoticeStore";
import { useNotifications } from "@/lib/notificationStore";
import { chatOpener } from "@/lib/messagesStore";
import { cn } from "@/lib/utils";

export function HomePage({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const upcoming = GROUPS[0];
  const recommended = BUDDIES.slice(0, 4);
  const featured = SPOTS.slice(0, 3);
  const notices = useRiskNotices().filter((n) => !n.dismissed);
  const notifications = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const [notifOpen, setNotifOpen] = useState(false);

  // Find the at-risk notice (if any) that matches the upcoming session,
  // so we can merge the warning into the upcoming-session card.
  const upcomingNotice =
    notices.find((n) => n.spotName === upcoming.spotName && n.time === upcoming.time) ?? null;
  const otherNotices = notices.filter((n) => n.id !== upcomingNotice?.id);

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
            <button
              onClick={() => onNavigate("buddies")}
              aria-label="Open messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:border-primary/40"
            >
              <MessageSquare className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => setNotifOpen(true)}
              aria-label={`Open notifications${unread > 0 ? `, ${unread} unread` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:border-primary/40"
            >
              <Bell className="h-4 w-4 text-foreground" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-card bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate("profile")}
              aria-label="Open profile"
              className="rounded-full outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-primary"
            >
              <GradientAvatar animal={CURRENT_USER.animal} initials={CURRENT_USER.initials} size="md" />
            </button>
          </div>
        </div>
      </header>

      {/* Upcoming session — merges at-risk warning when relevant */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-elevated",
            upcomingNotice ? "bg-[hsl(var(--primary))] ring-2 ring-destructive/60" : "gradient-hero"
          )}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Upcoming session
              </div>
              {upcomingNotice && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                  <AlertTriangle className="h-3 w-3" /> At risk
                </span>
              )}
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

            {upcomingNotice && (
              <div className="mt-4 rounded-2xl bg-destructive/15 p-3 text-xs text-primary-foreground">
                <p className="font-semibold">People cancelled.</p>
                <p className="mt-0.5 text-primary-foreground/85">
                  Refill in 2 mins so the session still happens.
                </p>
              </div>
            )}

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
              {upcomingNotice ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => riskNoticeStore.dismiss(upcomingNotice.id)}
                    className="rounded-full border border-primary-foreground/30 px-3 py-2 text-[11px] font-medium text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => onNavigate("groups")}
                    className="inline-flex items-center gap-1 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground"
                  >
                    Find new people <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate("groups")}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-primary"
                >
                  View details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Other at-risk sessions (not the upcoming one) */}
        {otherNotices.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {otherNotices.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                    Session at risk
                  </p>
                  <p className="font-display text-sm font-semibold">{n.spotName} · {n.date} {n.time}</p>
                </div>
                <button
                  onClick={() => onNavigate("groups")}
                  className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                >
                  Refill
                </button>
              </div>
            ))}
          </div>
        )}
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

      {/* Ad slot (free users only) */}
      <section className="px-6">
        <AdSlot variant="default" />
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

      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onOpenChat={(buddyId) => {
          onNavigate("buddies");
          // Defer so BuddiesPage has mounted and subscribed before we request the chat to open.
          setTimeout(() => chatOpener.request(buddyId), 50);
        }}
      />
    </div>
  );
}
