export type Buddy = {
  id: string;
  name: string;
  initials: string;
  major: string;
  year: string;
  university: string;
  gender: "Male" | "Female" | "Non-binary";
  hobbies: string[];
  rating: number;
  bio: string;
  avatarColor: string;
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
};

export type StudyGroup = {
  id: string;
  subject: string;
  spotName: string;
  time: string;
  date: string;
  spotsTotal: number;
  spotsRemaining: number;
  members: string[];
  level: string;
};

export const CURRENT_USER = {
  name: "Marie Dubois",
  initials: "MD",
  university: "KU Leuven",
  major: "Computer Science",
  year: "2nd Year Master",
  email: "marie.dubois@kuleuven.be",
  rating: 4.8,
  hobbies: ["Gaming", "Coffee", "Hiking"],
};

export const BUDDIES: Buddy[] = [
  { id: "1", name: "Liam Janssens", initials: "LJ", major: "Computer Science", year: "3rd Year", university: "KU Leuven", gender: "Male", hobbies: ["Gaming", "Chess", "Coffee"], rating: 4.9, bio: "ML enthusiast looking for algorithm study partners. Coffee fueled.", avatarColor: "from-amber-200 to-orange-300" },
  { id: "2", name: "Sofia Peeters", initials: "SP", major: "Economics", year: "2nd Year", university: "KU Leuven", gender: "Female", hobbies: ["Reading", "Yoga", "Hiking"], rating: 4.7, bio: "Macroeconomics & finance. Prefer quiet libraries in the morning.", avatarColor: "from-rose-200 to-pink-300" },
  { id: "3", name: "Noah De Smet", initials: "ND", major: "Computer Science", year: "1st Year Master", university: "KU Leuven", gender: "Male", hobbies: ["Gaming", "Music", "Cycling"], rating: 4.6, bio: "Distributed systems nerd. Love a good whiteboard session.", avatarColor: "from-blue-200 to-indigo-300" },
  { id: "4", name: "Emma Vermeulen", initials: "EV", major: "Psychology", year: "3rd Year", university: "KU Leuven", gender: "Female", hobbies: ["Coffee", "Films", "Painting"], rating: 5.0, bio: "Neuropsych research. Find me at Onder de Toren most afternoons.", avatarColor: "from-emerald-200 to-teal-300" },
  { id: "5", name: "Lucas Maes", initials: "LM", major: "Engineering", year: "2nd Year Master", university: "KU Leuven", gender: "Male", hobbies: ["Hiking", "Tech", "Coffee"], rating: 4.8, bio: "Mechanical eng. Group sessions > solo grinding.", avatarColor: "from-violet-200 to-purple-300" },
  { id: "6", name: "Mila Hendrickx", initials: "MH", major: "Law", year: "1st Year Master", university: "KU Leuven", gender: "Female", hobbies: ["Reading", "Debate", "Tea"], rating: 4.5, bio: "EU law focus. Quiet spaces only — I rehearse out loud.", avatarColor: "from-yellow-200 to-amber-300" },
  { id: "7", name: "Jasper Willems", initials: "JW", major: "Mathematics", year: "3rd Year", university: "KU Leuven", gender: "Male", hobbies: ["Chess", "Gaming", "Music"], rating: 4.9, bio: "Statistics tutor on the side. Happy to explain anything twice.", avatarColor: "from-sky-200 to-cyan-300" },
  { id: "8", name: "Anaïs Claes", initials: "AC", major: "Biology", year: "2nd Year", university: "KU Leuven", gender: "Female", hobbies: ["Hiking", "Photography", "Coffee"], rating: 4.7, bio: "Mol bio. Always down for a flashcard marathon.", avatarColor: "from-lime-200 to-green-300" },
];

export const SPOTS: Spot[] = [
  { id: "s1", name: "Onder de Toren", type: "Cafe", distance: "0.3 km", laptopPolicy: "Allowed", laptopNote: "Laptops allowed 9–17", wifi: "Fast", noise: "Moderate", pricing: "$$", amenities: ["wifi","power","coffee","food"], studentMenu: "€8 student lunch", reservationAvailable: true, official: false, status: "Open", lat: 50.879, lng: 4.7, hero: "from-amber-200 via-orange-200 to-rose-200" },
  { id: "s2", name: "Agora Learning Center", type: "University Hub", distance: "0.6 km", laptopPolicy: "Allowed", laptopNote: "24/7 laptop friendly", wifi: "Fast", noise: "Quiet", pricing: "Free", amenities: ["wifi","power","quiet","groups"], reservationAvailable: true, official: true, status: "Open", lat: 50.877, lng: 4.703, hero: "from-slate-200 via-blue-200 to-indigo-200" },
  { id: "s3", name: "Café Nero Leuven", type: "Cafe", distance: "0.9 km", laptopPolicy: "Restricted", laptopNote: "No laptops on weekends", wifi: "Medium", noise: "Lively", pricing: "$$", amenities: ["wifi","coffee","food"], studentMenu: "€6 coffee + pastry", reservationAvailable: true, official: false, status: "Busy", lat: 50.881, lng: 4.706, hero: "from-yellow-200 via-amber-200 to-orange-200" },
  { id: "s4", name: "Maurits Sabbe Library", type: "Library", distance: "1.1 km", laptopPolicy: "Allowed", laptopNote: "Silent zones marked", wifi: "Fast", noise: "Quiet", pricing: "Free", amenities: ["wifi","power","quiet"], reservationAvailable: false, official: true, status: "Open", lat: 50.875, lng: 4.698, hero: "from-emerald-200 via-teal-200 to-cyan-200" },
  { id: "s5", name: "Barbóék Coffee", type: "Cafe", distance: "0.5 km", laptopPolicy: "Not Allowed", laptopNote: "No laptops — conversation cafe", wifi: "Slow", noise: "Lively", pricing: "$$", amenities: ["coffee","food"], studentMenu: "€7 brunch", reservationAvailable: true, official: false, status: "Open", lat: 50.882, lng: 4.701, hero: "from-rose-200 via-pink-200 to-fuchsia-200" },
  { id: "s6", name: "Erasmushuis Hub", type: "University Hub", distance: "0.4 km", laptopPolicy: "Allowed", laptopNote: "Laptops welcome — group rooms bookable", wifi: "Fast", noise: "Moderate", pricing: "Free", amenities: ["wifi","power","groups","coffee"], reservationAvailable: true, official: true, status: "Closing soon", lat: 50.878, lng: 4.704, hero: "from-violet-200 via-purple-200 to-indigo-200" },
];

export const GROUPS: StudyGroup[] = [
  { id: "g1", subject: "Statistics", spotName: "Café Nero Leuven", time: "14:00", date: "Today", spotsTotal: 4, spotsRemaining: 1, members: ["LJ","SP","ND"], level: "Intermediate" },
  { id: "g2", subject: "Algorithms", spotName: "Agora Learning Center", time: "10:30", date: "Tomorrow", spotsTotal: 5, spotsRemaining: 3, members: ["JW","LM"], level: "Advanced" },
  { id: "g3", subject: "EU Law Review", spotName: "Maurits Sabbe Library", time: "16:00", date: "Today", spotsTotal: 3, spotsRemaining: 2, members: ["MH"], level: "Beginner" },
  { id: "g4", subject: "Macroeconomics", spotName: "Onder de Toren", time: "09:00", date: "Fri 3 May", spotsTotal: 4, spotsRemaining: 2, members: ["SP","EV"], level: "Intermediate" },
  { id: "g5", subject: "Molecular Biology", spotName: "Erasmushuis Hub", time: "13:00", date: "Tomorrow", spotsTotal: 4, spotsRemaining: 4, members: ["AC"], level: "Beginner" },
];
