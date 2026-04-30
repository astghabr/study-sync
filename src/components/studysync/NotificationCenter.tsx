import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MessageCircle, UserPlus, Sparkles, Calendar, Trash2 } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { BUDDIES } from "@/data/mockData";
import {
  notificationStore,
  useNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/notificationStore";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationType, typeof Bell> = {
  message: MessageCircle,
  request: UserPlus,
  match: Sparkles,
  session: Calendar,
};

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export function NotificationCenter({
  open,
  onClose,
  onOpenChat,
}: {
  open: boolean;
  onClose: () => void;
  onOpenChat?: (buddyId: string) => void;
}) {
  const notes = useNotifications();
  const unread = notes.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/40 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-elevated md:h-[640px] md:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold leading-tight">Notifications</p>
                  <p className="text-[11px] text-muted-foreground">
                    {unread > 0 ? `${unread} unread` : "All caught up"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            {notes.length > 0 && (
              <div className="flex items-center justify-between border-b border-border px-5 py-2">
                <button
                  onClick={() => notificationStore.markAllRead()}
                  disabled={unread === 0}
                  className="text-[11px] font-medium text-primary disabled:text-muted-foreground"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => notificationStore.clear()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-display text-base font-semibold">No notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Messages, study requests and new matches from buddies will show up here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notes.map((n) => (
                    <NotificationRow
                      key={n.id}
                      note={n}
                      onActivate={(note) => {
                        notificationStore.markRead(note.id);
                        if (note.type === "message" && note.buddyId && onOpenChat) {
                          onOpenChat(note.buddyId);
                          onClose();
                        }
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotificationRow({
  note,
  onActivate,
}: {
  note: Notification;
  onActivate: (note: Notification) => void;
}) {
  const Icon = ICONS[note.type];
  const buddy = note.buddyId ? BUDDIES.find((b) => b.id === note.buddyId) : null;
  const isClickable = note.type === "message" && !!note.buddyId;

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 px-5 py-3.5 transition-colors",
        !note.read && "bg-accent-soft/40",
        isClickable && "cursor-pointer hover:bg-accent-soft/60"
      )}
      onClick={() => onActivate(note)}
    >
      {buddy ? (
        <GradientAvatar animal={buddy.animal} initials={buddy.initials} size="sm" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{note.title}</p>
          {!note.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{note.body}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {formatRelative(note.createdAt)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          notificationStore.remove(note.id);
        }}
        aria-label="Dismiss"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
