import { Home, Users, MapPin, CalendarCheck, Timer, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type Tab = "home" | "buddies" | "spots" | "focus" | "groups" | "profile";

const items: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "buddies", label: "Buddies", icon: Users },
  { id: "spots", label: "Spots", icon: MapPin },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "groups", label: "Groups", icon: CalendarCheck },
];

export function BottomNav({
  active,
  onChange,
  locked = false,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  locked?: boolean;
}) {
  return (
    <nav className="sticky bottom-0 z-40 mx-auto w-full max-w-md border-t border-border/60 bg-background/85 backdrop-blur-xl">
      <ul className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-2">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          const disabled = locked && it.id !== "focus";
          return (
            <li key={it.id} className="flex justify-center">
              <button
                onClick={() => !disabled && onChange(it.id)}
                disabled={disabled}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-2 py-2 outline-none",
                  disabled && "opacity-40"
                )}
                aria-label={it.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-0.5 inset-y-1 rounded-2xl bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
