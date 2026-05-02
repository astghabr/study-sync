import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Flag, ShieldAlert } from "lucide-react";
import { GradientAvatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type Buddy } from "@/data/mockData";
import { messagesStore, useMessages, type ChatMessage } from "@/lib/messagesStore";
import { cn } from "@/lib/utils";
import { containsProfanity } from "@/lib/profanityFilter";

const REPORT_REASONS = [
  "Inappropriate behaviour",
  "Harassment or bullying",
  "Spam",
  "Other",
];

export function ChatModal({
  buddy,
  onClose,
  onReportProfile,
}: {
  buddy: Buddy | null;
  onClose: () => void;
  onReportProfile: (b: Buddy) => void;
}) {
  const messages = useMessages(buddy?.id ?? null);
  const [draft, setDraft] = useState("");
  const [reportingMsg, setReportingMsg] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, buddy?.id]);

  const handleSend = () => {
    if (!buddy) return;
    const text = draft.trim();
    if (!text) return;
    messagesStore.send(buddy.id, text);
    setDraft("");
  };

  return (
    <>
      <AnimatePresence>
        {buddy && (
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
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <GradientAvatar animal={buddy.animal} initials={buddy.initials} size="sm" />
                  <div>
                    <p className="font-display text-sm font-semibold leading-tight">{buddy.name}</p>
                    <p className="text-[11px] text-muted-foreground">{buddy.major} · {buddy.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onReportProfile(buddy)}
                    className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium text-muted-foreground transition hover:text-destructive"
                    title="Report user"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report
                  </button>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background/60 px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                      No messages yet. Say hi 👋
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {messages.map((m) => {
                      const mine = m.from === "me";
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "group flex w-full items-end gap-1.5",
                            mine ? "justify-end" : "justify-start"
                          )}
                        >
                          {!mine && (
                            <button
                              onClick={() => setReportingMsg(m)}
                              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                              title="Report message"
                            >
                              <Flag className="h-3 w-3" />
                            </button>
                          )}
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-soft",
                              mine
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-card text-foreground"
                            )}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-border bg-card px-3 py-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message…"
                    maxLength={1000}
                    className="h-11 flex-1 rounded-xl text-sm"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="h-11 rounded-xl px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportMessageModal
        message={reportingMsg}
        buddyName={buddy?.name ?? ""}
        onClose={() => setReportingMsg(null)}
      />
    </>
  );
}

function ReportMessageModal({
  message,
  buddyName,
  onClose,
}: {
  message: ChatMessage | null;
  buddyName: string;
  onClose: () => void;
}) {
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
  const hasProfanity = containsProfanity(trimmed);
  const isValid = !!reason && trimmed.length >= 10 && trimmed.length <= 500 && !hasProfanity;

  const handleSubmit = () => {
    if (!isValid || !message) return;
    setSubmitted(true);
    toast({
      title: "Message reported",
      description: "Thanks — our team will review it within 24 hours.",
    });
    setTimeout(handleClose, 1200);
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/50 backdrop-blur-sm md:items-center"
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
                <h3 className="font-display text-lg font-semibold">Report message</h3>
                <p className="text-xs text-muted-foreground">From {buddyName} · confidential.</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-3 text-sm text-foreground">
              "{message.text}"
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
                <span className={cn(hasProfanity && "text-destructive")}>
                  {hasProfanity
                    ? "Please remove offensive language before submitting."
                    : trimmed.length < 10
                    ? "At least 10 characters required"
                    : "Looks good"}
                </span>
                <span>{details.length}/500</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitted}
              className="mt-5 h-12 w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitted ? "Report sent" : "Submit report"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
