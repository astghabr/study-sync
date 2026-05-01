import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

type Props = {
  open: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  allowLabel?: string;
  denyLabel?: string;
  onAllow: () => void;
  onDeny: () => void;
};

export function PermissionDialog({
  open,
  icon: Icon,
  title,
  description,
  allowLabel = "Allow",
  denyLabel = "Don't allow",
  onAllow,
  onDeny,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[300px] overflow-hidden rounded-3xl bg-card shadow-elevated"
          >
            <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <div className="grid grid-cols-2 border-t border-border">
              <button
                onClick={onDeny}
                className="border-r border-border py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
              >
                {denyLabel}
              </button>
              <button
                onClick={onAllow}
                className="py-3 text-sm font-semibold text-primary transition hover:bg-accent-soft"
              >
                {allowLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
