import { cn } from "@/lib/utils";

export function GradientAvatar({
  initials,
  gradient = "from-amber-200 to-orange-300",
  size = "md",
  className,
}: {
  initials: string;
  gradient?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-primary ring-2 ring-background",
        gradient,
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
