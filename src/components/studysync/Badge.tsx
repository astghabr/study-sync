import { Check, AlertTriangle, VolumeX, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "verified" | "no-laptop" | "quiet" | "official" | "neutral" | "warning" | "success";

const styles: Record<Variant, string> = {
  verified: "bg-success/10 text-success border-success/20",
  "no-laptop": "bg-destructive/10 text-destructive border-destructive/20",
  quiet: "bg-primary/5 text-primary border-primary/10",
  official: "bg-accent/20 text-primary border-accent/30",
  neutral: "bg-muted text-muted-foreground border-border",
  warning: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-success/10 text-success border-success/20",
};

const icons: Partial<Record<Variant, React.ReactNode>> = {
  verified: <Check className="h-3 w-3" strokeWidth={3} />,
  "no-laptop": <AlertTriangle className="h-3 w-3" />,
  quiet: <VolumeX className="h-3 w-3" />,
  official: <ShieldCheck className="h-3 w-3" />,
};

export function StatusBadge({
  variant,
  children,
  className,
}: {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[variant],
        className
      )}
    >
      {icons[variant]}
      {children}
    </span>
  );
}
