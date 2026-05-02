// Lightweight client-side profanity / slur filter for user-submitted text
// (e.g. report details). This is a UX guardrail, not a security boundary —
// real moderation must still happen server-side.

// Keep the list compact and English-focused. Matched as whole words,
// case-insensitive, and tolerant of common leetspeak (0/o, 1/i/l, 3/e, 4/a,
// 5/s, 7/t, @/a, $/s).
const BLOCKED_WORDS: string[] = [
  // profanity
  "fuck", "fucker", "fucking", "shit", "bullshit", "bitch", "asshole",
  "bastard", "dick", "cunt", "pussy", "wanker", "twat", "prick",
  "motherfucker", "cock", "dickhead", "douche", "douchebag",
  // slurs (non-exhaustive — safe defaults)
  "nigger", "nigga", "faggot", "fag", "dyke", "tranny", "retard", "retarded",
  "chink", "spic", "kike", "gook", "wetback", "raghead", "towelhead",
];

const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a",
  "@": "a", "5": "s", "$": "s", "7": "t", "+": "t",
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => LEET_MAP[c] ?? c)
    .join("")
    // collapse repeated separators inside words: f-u-c.k -> fuck
    .replace(/[\s\-_.*]+/g, (m) => (m.length > 0 ? "" : m));
}

const PATTERNS: RegExp[] = BLOCKED_WORDS.map(
  (w) => new RegExp(`\\b${w}\\b`, "i")
);

export function findProfanity(text: string): string | null {
  if (!text) return null;
  const normalized = normalize(text);
  for (let i = 0; i < BLOCKED_WORDS.length; i++) {
    if (PATTERNS[i].test(text) || PATTERNS[i].test(normalized)) {
      return BLOCKED_WORDS[i];
    }
  }
  return null;
}

export function containsProfanity(text: string): boolean {
  return findProfanity(text) !== null;
}
