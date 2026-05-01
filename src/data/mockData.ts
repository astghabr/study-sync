export type Buddy = {
  id: string;
  name: string;
  initials: string;
  major: string;
  year: string;
  university: string;
  gender: "Male" | "Female" | "Non-binary";
  hobbies: string[];
  bio: string;
  avatarColor: string;
  animal: string;
  prompts: { question: string; answer: string }[];
};

export type Spot = {
  id: string;
  name: string;
  type: "Cafe" | "Library" | "University Hub";
  distance: string;
  laptopPolicy: "Allowed" | "Restricted" | "Not Allowed";
  laptopNote?: string;
  wifi: "Fast" | "Medium" | "Slow";
  noise: "Quiet" | "Moderate" | "Lively";
  pricing: "$" | "$$" | "$$$" | "Free";
  amenities: string[];
  studentMenu?: string;
  reservationAvailable: boolean;
  official: boolean;
  status: "Open" | "Busy" | "Closing soon";
  lat: number;
  lng: number;
  hero: string;
  photo?: string;
};

export type StudyGroup = {
  id: string;
  spotName: string;
  spotType: "Cafe" | "Library" | "University Hub";
  time: string;
  date: string;
  /** null = no fixed limit (open table). Number = hard cap (e.g. 4 for cafes). */
  spotsTotal: number | null;
  spotsRemaining: number | null;
  noisePreference: "Quiet" | "Moderate" | "Lively";
  anonymousMembers: number;
  subject?: string;
  /** True when too many people cancelled and the session needs a refill. */
  atRisk?: boolean;
  /** Booked at least 24h in advance. */
  bookedAt?: string;
};

export type RefillCandidate = {
  id: string;
  initials: string;
  animal: string;
  subject: string;
  availability: string;
  distance: string;
  online: boolean;
};

/** Cute animal options for profile pictures */
export const ANIMALS = [
  { id: "fox", emoji: "🦊", label: "Fox", bg: "from-orange-200 to-amber-300" },
  { id: "bear", emoji: "🐻", label: "Bear", bg: "from-amber-200 to-yellow-300" },
  { id: "panda", emoji: "🐼", label: "Panda", bg: "from-slate-100 to-zinc-200" },
  { id: "cat", emoji: "🐱", label: "Cat", bg: "from-rose-200 to-pink-300" },
  { id: "dog", emoji: "🐶", label: "Dog", bg: "from-amber-100 to-orange-200" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit", bg: "from-pink-100 to-rose-200" },
  { id: "koala", emoji: "🐨", label: "Koala", bg: "from-slate-200 to-blue-200" },
  { id: "frog", emoji: "🐸", label: "Frog", bg: "from-lime-200 to-green-300" },
  { id: "owl", emoji: "🦉", label: "Owl", bg: "from-amber-200 to-stone-300" },
  { id: "penguin", emoji: "🐧", label: "Penguin", bg: "from-sky-200 to-indigo-200" },
  { id: "tiger", emoji: "🐯", label: "Tiger", bg: "from-orange-200 to-yellow-300" },
  { id: "monkey", emoji: "🐵", label: "Monkey", bg: "from-amber-200 to-orange-300" },
  { id: "hamster", emoji: "🐹", label: "Hamster", bg: "from-amber-100 to-rose-200" },
  { id: "duck", emoji: "🦆", label: "Duck", bg: "from-yellow-100 to-amber-200" },
  { id: "octopus", emoji: "🐙", label: "Octopus", bg: "from-rose-200 to-fuchsia-300" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn", bg: "from-violet-200 to-pink-200" },
];

/** Available profile prompts users can pick from */
export const PROFILE_PROMPTS = [
  "This year, I really want to…",
  "I knew my major was for me when…",
  "My study playlist says a lot about me because…",
  "My ideal study session looks like…",
  "The snack that gets me through finals is…",
  "I procrastinate by…",
  "A class that changed how I think was…",
  "After graduation, you'll find me…",
  "My weirdest study habit is…",
  "The best café in town is… (don't tell anyone)",
];

export type AppRole = "student" | "moderator" | "admin";

export const CURRENT_USER = {
  name: "Marie Dubois",
  initials: "MD",
  university: "KU Leuven",
  major: "Computer Science",
  year: "2nd Year Master",
  email: "marie.dubois@kuleuven.be",
  hobbies: ["Gaming", "Coffee", "Hiking"],
  animal: "fox",
  // NOTE: in production, roles must live in a separate `user_roles` table
  // with RLS, never on the user/profile object. This is a UI mock only.
  role: "admin" as AppRole,
  prompts: [
    { question: "This year, I really want to…", answer: "finish my thesis without surviving on instant noodles." },
  ],
};

export const BUDDIES: Buddy[] = [
  { id: "1", name: "Liam Janssens", initials: "LJ", major: "Computer Science", year: "3rd Year", university: "KU Leuven", gender: "Male", hobbies: ["Gaming", "Chess", "Coffee"], bio: "ML enthusiast looking for algorithm study partners. Coffee fueled.", avatarColor: "from-amber-200 to-orange-300", animal: "bear", prompts: [
    { question: "I knew my major was for me when…", answer: "I spent a whole weekend optimizing a sorting algorithm for fun." },
  ] },
  { id: "2", name: "Sofia Peeters", initials: "SP", major: "Economics", year: "2nd Year", university: "KU Leuven", gender: "Female", hobbies: ["Reading", "Yoga", "Hiking"], bio: "Macroeconomics & finance. Prefer quiet libraries in the morning.", avatarColor: "from-rose-200 to-pink-300", animal: "rabbit", prompts: [
    { question: "This year, I really want to…", answer: "land an internship at a central bank." },
  ] },
  { id: "3", name: "Noah De Smet", initials: "ND", major: "Computer Science", year: "1st Year Master", university: "KU Leuven", gender: "Male", hobbies: ["Gaming", "Music", "Cycling"], bio: "Distributed systems nerd. Love a good whiteboard session.", avatarColor: "from-blue-200 to-indigo-300", animal: "penguin", prompts: [
    { question: "My weirdest study habit is…", answer: "explaining concepts out loud to my plant." },
  ] },
  { id: "4", name: "Emma Vermeulen", initials: "EV", major: "Psychology", year: "3rd Year", university: "KU Leuven", gender: "Female", hobbies: ["Coffee", "Films", "Painting"], bio: "Neuropsych research. Find me at Onder de Toren most afternoons.", avatarColor: "from-emerald-200 to-teal-300", animal: "frog", prompts: [
    { question: "A class that changed how I think was…", answer: "Cognitive Neuroscience — I haven't shut up about it since." },
  ] },
  { id: "5", name: "Lucas Maes", initials: "LM", major: "Engineering", year: "2nd Year Master", university: "KU Leuven", gender: "Male", hobbies: ["Hiking", "Tech", "Coffee"], bio: "Mechanical eng. Group sessions > solo grinding.", avatarColor: "from-violet-200 to-purple-300", animal: "owl", prompts: [
    { question: "My ideal study session looks like…", answer: "four people, one big table, snacks in the middle." },
  ] },
  { id: "6", name: "Mila Hendrickx", initials: "MH", major: "Law", year: "1st Year Master", university: "KU Leuven", gender: "Female", hobbies: ["Reading", "Debate", "Tea"], bio: "EU law focus. Quiet spaces only — I rehearse out loud.", avatarColor: "from-yellow-200 to-amber-300", animal: "cat", prompts: [
    { question: "I procrastinate by…", answer: "reorganizing my flashcards by color. Again." },
  ] },
  { id: "7", name: "Jasper Willems", initials: "JW", major: "Mathematics", year: "3rd Year", university: "KU Leuven", gender: "Male", hobbies: ["Chess", "Gaming", "Music"], bio: "Statistics tutor on the side. Happy to explain anything twice.", avatarColor: "from-sky-200 to-cyan-300", animal: "fox", prompts: [
    { question: "I knew my major was for me when…", answer: "a proof made me genuinely emotional. Yes, really." },
  ] },
  { id: "8", name: "Anaïs Claes", initials: "AC", major: "Biology", year: "2nd Year", university: "KU Leuven", gender: "Female", hobbies: ["Hiking", "Photography", "Coffee"], bio: "Mol bio. Always down for a flashcard marathon.", avatarColor: "from-lime-200 to-green-300", animal: "panda", prompts: [
    { question: "The best café in town is… (don't tell anyone)", answer: "the tiny place behind the botanical garden. Shhh." },
  ] },
];

export const SPOTS: Spot[] = [
  { id: "s1", name: "Onder de Toren", type: "Cafe", distance: "0.3 km", laptopPolicy: "Allowed", laptopNote: "Laptops allowed 9–17", wifi: "Fast", noise: "Moderate", pricing: "$$", amenities: ["wifi","power","coffee","food"], studentMenu: "€8 student lunch", reservationAvailable: true, official: false, status: "Open", lat: 50.879, lng: 4.7, hero: "from-amber-200 via-orange-200 to-rose-200", photo: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=70" },
  { id: "s2", name: "Agora Learning Center", type: "University Hub", distance: "0.6 km", laptopPolicy: "Allowed", laptopNote: "24/7 laptop friendly", wifi: "Fast", noise: "Quiet", pricing: "Free", amenities: ["wifi","power","quiet","groups"], reservationAvailable: true, official: true, status: "Open", lat: 50.877, lng: 4.703, hero: "from-slate-200 via-blue-200 to-indigo-200", photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70" },
  { id: "s3", name: "Café Nero Leuven", type: "Cafe", distance: "0.9 km", laptopPolicy: "Restricted", laptopNote: "No laptops on weekends", wifi: "Medium", noise: "Lively", pricing: "$$", amenities: ["wifi","coffee","food"], studentMenu: "€6 coffee + pastry", reservationAvailable: true, official: false, status: "Busy", lat: 50.881, lng: 4.706, hero: "from-yellow-200 via-amber-200 to-orange-200", photo: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=70" },
  { id: "s4", name: "Maurits Sabbe Library", type: "Library", distance: "1.1 km", laptopPolicy: "Allowed", laptopNote: "Silent zones marked", wifi: "Fast", noise: "Quiet", pricing: "Free", amenities: ["wifi","power","quiet"], reservationAvailable: false, official: true, status: "Open", lat: 50.875, lng: 4.698, hero: "from-emerald-200 via-teal-200 to-cyan-200", photo: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=70" },
  { id: "s5", name: "Barbóék Coffee", type: "Cafe", distance: "0.5 km", laptopPolicy: "Not Allowed", laptopNote: "No laptops — conversation cafe", wifi: "Slow", noise: "Lively", pricing: "$$", amenities: ["coffee","food"], studentMenu: "€7 brunch", reservationAvailable: true, official: false, status: "Open", lat: 50.882, lng: 4.701, hero: "from-rose-200 via-pink-200 to-fuchsia-200", photo: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=70" },
  { id: "s6", name: "Erasmushuis Hub", type: "University Hub", distance: "0.4 km", laptopPolicy: "Allowed", laptopNote: "Laptops welcome — group rooms bookable", wifi: "Fast", noise: "Moderate", pricing: "Free", amenities: ["wifi","power","groups","coffee"], reservationAvailable: true, official: true, status: "Closing soon", lat: 50.878, lng: 4.704, hero: "from-violet-200 via-purple-200 to-indigo-200", photo: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=70" },
];

export const GROUPS: StudyGroup[] = [
  // Cafe → 4-person hard limit. AT RISK: was 4/4, two cancelled overnight.
  { id: "g1", spotName: "Café Nero Leuven", spotType: "Cafe", time: "14:00", date: "Today", spotsTotal: 4, spotsRemaining: 3, noisePreference: "Lively", anonymousMembers: 1, subject: "Microeconomics", atRisk: true, bookedAt: "Yesterday 14:00" },
  // Library → no limit
  { id: "g2", spotName: "Agora Learning Center", spotType: "University Hub", time: "10:30", date: "Tomorrow", spotsTotal: null, spotsRemaining: null, noisePreference: "Quiet", anonymousMembers: 6, subject: "Algorithms", bookedAt: "Yesterday 10:00" },
  { id: "g3", spotName: "Maurits Sabbe Library", spotType: "Library", time: "16:00", date: "Today", spotsTotal: null, spotsRemaining: null, noisePreference: "Quiet", anonymousMembers: 4, subject: "EU Law", bookedAt: "Yesterday 16:00" },
  // Cafe → 4 cap
  { id: "g4", spotName: "Onder de Toren", spotType: "Cafe", time: "09:00", date: "Fri 3 May", spotsTotal: 4, spotsRemaining: 2, noisePreference: "Moderate", anonymousMembers: 2, subject: "Statistics", bookedAt: "Wed 1 May 09:00" },
  // Hub → no limit
  { id: "g5", spotName: "Erasmushuis Hub", spotType: "University Hub", time: "13:00", date: "Tomorrow", spotsTotal: null, spotsRemaining: null, noisePreference: "Moderate", anonymousMembers: 0, subject: "Mech Eng", bookedAt: "Yesterday 13:00" },
];

/** Mock pool of nearby/online students used by the refill flow. */
export const REFILL_POOL: RefillCandidate[] = [
  { id: "r1", initials: "TV", animal: "fox", subject: "Microeconomics", availability: "Free 14:00–16:00", distance: "0.4 km", online: true },
  { id: "r2", initials: "KB", animal: "rabbit", subject: "Microeconomics", availability: "Free 13:30–17:00", distance: "0.8 km", online: true },
  { id: "r3", initials: "RM", animal: "owl", subject: "Economics", availability: "Free this afternoon", distance: "Online", online: true },
  { id: "r4", initials: "AD", animal: "panda", subject: "Microeconomics", availability: "Free 14:00–15:30", distance: "1.2 km", online: false },
];
