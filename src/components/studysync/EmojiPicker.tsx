import { useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// A curated starter set across categories. Users can also type any emoji
// (or paste one) into the free-text input below the grid.
const STARTER_EMOJI = [
  // animals
  "🦊","🐼","🐨","🐯","🦁","🐸","🐧","🦉","🐰","🐻","🐶","🐱","🐹","🐢","🐙","🦄",
  // faces
  "😀","😎","🤓","🥳","😴","🤩","🫶","🙃",
  // objects / vibes
  "📚","✏️","☕️","🧠","💡","🚀","🔥","⭐️","🌙","🌸","🍀","🍵","🎧","🎨","🏆","✨",
];

// Extract a single grapheme (handles multi-codepoint emoji).
function firstGrapheme(input: string): string {
  if (!input) return "";
  // @ts-expect-error - Intl.Segmenter is widely available in modern browsers
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-expect-error
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const it = seg.segment(input)[Symbol.iterator]();
    const first = it.next();
    return first.done ? "" : (first.value as { segment: string }).segment;
  }
  return Array.from(input)[0] ?? "";
}

export function EmojiPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}) {
  const [custom, setCustom] = useState("");

  const submitCustom = () => {
    const g = firstGrapheme(custom.trim());
    if (g) {
      onChange(g);
      setCustom("");
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-8 gap-2">
        {STARTER_EMOJI.map((e) => {
          const active = value === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => onChange(e)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border text-xl transition",
                active
                  ? "border-primary bg-accent-soft"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <span className="leading-none">{e}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
        <Smile className="ml-1 h-4 w-4 text-muted-foreground" />
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitCustom();
            }
          }}
          placeholder="Or type any emoji…"
          maxLength={8}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={submitCustom}
          disabled={!firstGrapheme(custom.trim())}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          Use
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Tip: open your keyboard's emoji picker and paste any emoji you like.
      </p>
    </div>
  );
}
