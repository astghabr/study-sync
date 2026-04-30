import { cn } from "@/lib/utils";
import { ANIMALS } from "@/data/mockData";

const sizes = {
  sm: "h-8 w-8 text-base",
  md: "h-11 w-11 text-xl",
  lg: "h-16 w-16 text-3xl",
  xl: "h-24 w-24 text-5xl",
};

export function AnimalAvatar({
  animal,
  size = "md",
  className,
}: {
  animal: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const a = ANIMALS.find((x) => x.id === animal) ?? ANIMALS[0];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-background",
        a.bg,
        sizes[size],
        className
      )}
    >
      <span aria-label={a.label} className="leading-none">{a.emoji}</span>
    </div>
  );
}

/** Back-compat wrapper: existing call sites pass `initials` + `gradient`.
 *  We now show a cute animal instead. */
export function GradientAvatar({
  initials,
  gradient,
  size = "md",
  className,
  animal,
}: {
  initials?: string;
  gradient?: string;
  size?: keyof typeof sizes;
  className?: string;
  animal?: string;
}) {
  // Deterministic fallback animal from initials so it stays stable per buddy
  const pick =
    animal ??
    ANIMALS[
      Math.abs(
        (initials ?? "AA").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
      ) % ANIMALS.length
    ].id;
  return <AnimalAvatar animal={pick} size={size} className={className} />;
}
