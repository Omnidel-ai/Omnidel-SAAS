/**
 * Every piece of copy and every number the site shows lives here, as plain
 * data tables. Pages and components only lay it out. To change a price, a
 * feature line or an Acharya, edit this file — not the components.
 *
 * Prices are PLACEHOLDERS until the team confirms them.
 */

export type Billing = "monthly" | "yearly";
export type PlanId = "pulse" | "velocity";
export type AddOnId = "mart" | "studio" | "ads";

export const brand = {
  name: "OmniDEL.ai",
  badge: "O",
  tagline: "AI-native gamification of work. A KarmYog Education Network venture.",
  motto: { hi: "काम से कर्म तक", en: "From work to purpose" },
  legal: "© 2026 JVL Management and Services Pvt. Ltd. · New Town, Kolkata",
  trademark: "The “OmniDEL” trademark is used under licence.",
};

export const nav = [
  { label: "Products", href: "/#product" },
  { label: "How it works", href: "/#agent" },
  { label: "Acharyas", href: "/#acharyas" },
  { label: "Pricing", href: "/pricing" },
];

export const hero = {
  eyebrow: "OmniPulse · an AI agent for work crews",
  title: ["Your crew does the work.", "The agent does", "the rest."],
  lead: "Say what needs doing, in any language. OmniPulse plans the day, checks the photo proof, scores the work and settles the pay — quietly, in the background.",
  primary: { label: "Try the agent →", href: "/pricing" },
  video: { label: "See a day on site", note: "2 min", href: "#agent" },
  live: "Live pilot in Kolkata · 30 workers on board",
};

/** The agent strip under the hero: prompts it types, and the five steps it ticks off. */
export const agent = {
  site: "Flat 4B, New Town",
  speaker: "Captain Bikram says",
  langs: "हिन्दी · বাংলা · English",
  prompts: [
    {
      text: "Kal tak kitchen aur bathroom ki tiling khatam karni hai. Raju aur Meena lagao.",
      lang: "हिन्दी · Hinglish",
      reply: "Done. **7 tasks** for Raju and Meena, due tomorrow 6 pm. I’ll score each photo as it comes in.",
    },
    {
      text: "আজ টাওয়ার সি-তে দেয়ালে পুট্টি শেষ করতে হবে।",
      lang: "বাংলা · Bengali",
      reply: "Got it. **4 tasks** for Sunita’s crew at Tower C, due today 5 pm. Photos will be scored on arrival.",
    },
    {
      text: "Who hasn’t sent photos for Flat 4B yet?",
      lang: "English",
      reply: "**Arif K.** has 2 tasks without proof. I’ve sent him a voice reminder in Hindi.",
    },
  ],
  steps: [
    { icon: "ear", label: "Listen", detail: "Heard Bikram’s voice note", time: "00:02" },
    { icon: "plan", label: "Plan", detail: "7 tasks for Raju and Meena", time: "00:04" },
    { icon: "eye", label: "See", detail: "3 photos checked, tiles level", time: "16:31" },
    { icon: "score", label: "Score", detail: "Tile work, Flat 4B: 9.2", time: "16:31" },
    { icon: "pay", label: "Pay", detail: "₹640 added to Raju’s pay", time: "16:32" },
  ],
} as const;

export const trust = {
  title: "Backed by 30 years of institutional recognition",
  items: [
    { name: "NSDC", note: "Best Learning Methodology" },
    { name: "Tata Trusts", note: "Million-dollar grant" },
    { name: "IIT Kharagpur", note: "Founder alumni" },
    { name: "HKUST MBA", note: "Co-founder" },
    { name: "Live pilot · Kolkata", note: "30 workers onboarded" },
  ],
};

/** Real OmniDEL app screens (captured from Omnidel_Frontend with demo data). */
export const showcase = [
  {
    key: "home",
    tab: "Your day",
    url: "app.omnidel.ai/home",
    image: "/screens/home.webp",
    caption: ["Your day at a glance.", "What’s planned, what’s moving, what’s done."],
    callouts: [
      { kind: "num", value: "37", text: "tasks this week, sorted for you", style: { top: "30%", left: "-4%" } },
      { kind: "live", text: "**Kolkata crew** · 12 done today", style: { bottom: "14%", right: "-4%" } },
    ],
  },
  {
    key: "board",
    tab: "The board",
    url: "app.omnidel.ai/omnipulse/flat-4b",
    image: "/screens/board.webp",
    caption: ["Every job on one board.", "Workers update it by voice and photo."],
    callouts: [
      { kind: "live", text: "**Tile the kitchen wall** moved to In progress", style: { top: "36%", right: "-5%" } },
      { kind: "num", value: "30", text: "tasks · 4 stages · 1 captain", style: { bottom: "12%", left: "-4%" } },
    ],
  },
  {
    key: "review",
    tab: "Scores",
    url: "app.omnidel.ai/omnipulse/review",
    image: "/screens/review.webp",
    caption: ["Work scored fairly, every day.", "An Acharya reviews each photo."],
    callouts: [
      { kind: "dark", value: "9.2", text: "Site photo, Newtown block C · scored by an Acharya", style: { top: "54%", right: "-4%" } },
      { kind: "live", text: "**3** waiting for the captain’s nod", style: { bottom: "-10%", left: "6%" } },
    ],
  },
  {
    key: "acharyas",
    tab: "Acharyas",
    url: "macharya.ai · Acharya app",
    image: "/screens/acharya-list.webp",
    caption: ["An Acharya in every pocket.", "Workers pick their mentor, chat by voice, and follow their tasks."],
    /** Phone screens from the Acharya app (dev.macharya.ai). */
    phones: [
      { image: "/screens/acharya-list.webp", label: "Your Acharyas" },
      { image: "/screens/acharya-chat.webp", label: "Talk to MahAcharya’ji" },
      { image: "/screens/acharya-tasks.webp", label: "Tasks with Neeranjan Acharya" },
    ],
    callouts: [{ kind: "live", text: "**Voice first** · hold the mic to talk", style: { bottom: "18%", right: "4%" } }],
  },
] as const;

/** The OmniVarsity roster, as the app lists it. */
export const acharyas = [
  { initials: "M", name: "MahAcharya Ji", field: "Founder", color: "#254a33" },
  { initials: "VA", name: "Vivek", field: "Finance", color: "#254a33" },
  { initials: "NA", name: "Neeranjan", field: "Farming", color: "#1f6f5c" },
  { initials: "LA", name: "Lakshman", field: "Sales", color: "#8b3320" },
  { initials: "GA", name: "Gitanjali", field: "Quality", color: "#a5711a" },
  { initials: "AA", name: "Ananya", field: "Language", color: "#a74a2d" },
  { initials: "BA", name: "Bikram", field: "Dispatch", color: "#8b3320" },
  { initials: "EA", name: "Esha", field: "Support", color: "#7a3b22" },
  { initials: "SA", name: "Soumyajit", field: "Focus", color: "#1f3d2b" },
];

/** MahAcharya Ji's guide chat. Scripted until wired to the app's MahAcharya assistant. */
export const mahacharya = {
  name: "MahAcharya Ji",
  role: "Founding Acharya of the Gunakul · your guide",
  greeting: "Namaste. I’m MahAcharya Ji. Ask me anything about how OmniPulse and our Acharyas can help your crew.",
  placeholder: "Or ask in your own words…",
  fallback: "Good question. Our team will answer it on a short call — tap “Book a demo” at the top and we’ll ring you back the same day.",
  qa: [
    {
      q: "How will an Acharya help my crew?",
      a: "Each worker gets a mentor in their own language. The Acharya looks at every photo, gives a fair score, and teaches one small thing to do better tomorrow. Your captain only steps in when it matters.",
    },
    { q: "Do my workers need to read?", a: "No. They speak and send photos. I answer by voice too, in Hindi, Bengali or English." },
    {
      q: "Which plan should I start with?",
      a: "Start with OmniPulse for one crew. When you want goals, pace and streaks, add Velocity. You can switch any month.",
    },
    {
      q: "How do I begin?",
      a: "Log in with your OmniDEL ID, add your crew’s phone numbers, and say your first task out loud. I’ll take it from there.",
    },
  ],
};

export const beforeAfter = {
  eyebrow: "Before and after",
  title: "What changes on day one",
  lead: "Same crew, same site. Now the work is seen.",
  before: { tag: "Before", title: "Hard work nobody sees" },
  after: { tag: "With OmniPulse", title: "Every effort counted" },
  rows: [
    { before: "Work is forgotten by evening", after: "Every task is on the board, with photos" },
    { before: "Pay is settled by argument", after: "Pay adds up from scores, on its own" },
    { before: "Captains chase calls all day", after: "One captain, one calm board" },
  ],
};

export const plans: {
  id: PlanId;
  tab: string;
  name: string;
  for: string;
  price: Record<Billing, number>;
  lead?: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    id: "pulse",
    tab: "Starter plan",
    name: "OmniPulse",
    for: "For teams that want every day of work visible and scored.",
    price: { monthly: 499, yearly: 399 },
    features: [
      "Teams, projects and a live board — kanban, table, calendar",
      "Voice + photo task updates, in any language",
      "AI scoring and a review queue for captains",
      "Daily scoreboard for every worker",
      "Web and mobile access",
    ],
  },
  {
    id: "velocity",
    tab: "Most popular · Premium plan",
    name: "OmniPulse + Velocity",
    for: "For crews that want goals, pace and rewards on top.",
    price: { monthly: 899, yearly: 719 },
    lead: "Everything in OmniPulse, and:",
    features: [
      "Speak a goal — Velocity turns it into steps and assignments",
      "Pace tracking against deadlines",
      "Streaks and consistency bonuses",
      "Score = Pay payout reports",
      "Captain view for 8–10 workers per crew",
    ],
    featured: true,
  },
];

/**
 * OmniMart's features are the modules of the OmniMart app (Omnidel_Frontend).
 * OmniStudio and OmniAds have no product source yet: their lines are DRAFTS to confirm.
 */
export const addOns: { id: AddOnId; name: string; line: string; price: number; icon: "mart" | "studio" | "ads"; tint: string; ink: string; features: string[] }[] = [
  { id: "mart", name: "OmniMart", line: "Sales and delivery, from first lead to store.", price: 299, icon: "mart", tint: "var(--green-wash)", ink: "var(--green-deep)", features: ["Lead pipeline, from new lead to final approval", "Missions with a pace to hit", "Schedule and site visits", "Store dashboard with sales numbers"] },
  { id: "studio", name: "OmniStudio", line: "Turn proof-of-work into content you can use.", price: 199, icon: "studio", tint: "var(--ochre-wash)", ink: "#5e3f0c", features: ["Photo and video library from every job", "Before / after sets for customers", "Share to WhatsApp in one tap"] },
  { id: "ads", name: "OmniAds", line: "Promote your best work where customers look.", price: 249, icon: "ads", tint: "var(--terra-wash)", ink: "#7a3b22", features: ["Ads made from your top-scored jobs", "Reach customers in your area", "New leads go straight into OmniMart"] },
];

export const pricingCopy = {
  eyebrow: "Simple pricing",
  title: ["Simple pricing ", "for", " hard-working crews"],
  lead: "Start with OmniPulse. Add Velocity when you want goals, pace and rewards on top.",
  yearlySave: "Save 20%",
  enterprise: {
    eyebrow: "Enterprise & government",
    text: "50+ crews, multiple cities, custom leaderboards or an Olympiad? We’ll build a plan with you.",
    cta: "Talk to us →",
  },
  addOnsTitle: "Add what your business needs",
  addOnsLead: "Each add-on works with either plan.",
  loginNote: "Log in with your OmniDEL ID to buy",
};

export const checkoutSteps = ["Choose plan & add-ons", "Log in with your OmniDEL ID", "Pay & invite your crew"];

export const faq = [
  {
    q: "Why do I need to log in before buying?",
    a: "Every plan is attached to a verified OmniDEL ID, so your crew, scores and payouts stay with your account. You can explore plans freely — login is asked for only at checkout.",
  },
  { q: "Can I start with OmniPulse and add Velocity later?", a: "Yes. Upgrade any time; you pay the difference for the rest of the billing period." },
  { q: "Do my workers need to read or type?", a: "No. Updates are voice and photo first, in the worker’s own language." },
  { q: "How are add-ons billed?", a: "Each add-on is a flat monthly amount on top of your plan, and can be removed at the end of any month." },
];

export const closing = {
  title: ["From work", "to purpose."],
  lead: "Put your first crew on OmniPulse this week. The agent learns your site from day one.",
};

export const footer = [
  { title: "Products", links: ["OmniPulse", "Omni Velocity", "OmniMart", "OmniStudio", "OmniAds"] },
  { title: "Company", links: ["About", "Heritage", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy policy", "Terms of use", "Disclaimer"] },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
