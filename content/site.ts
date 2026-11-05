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
  { label: "Acharyas", href: "/acharya" },
  { label: "Pricing", href: "/pricing" },
];

export const hero = {
  eyebrow: "OmniPulse · AI agent for work crews",
  title: ["Your crew does the work.", "The agent does", "the rest."],
  lead: "Say the task in any language. OmniPulse plans it, checks the photo proof, scores the work and settles pay.",
  primary: { label: "Try the agent →", href: "/pricing" },
  video: { label: "See it work", note: "Live demo below", href: "#agent" },
  live: "Live in Kolkata · 30 workers",
};

/**
 * The agent demo under the hero. Each run is one voice command and the trace
 * of what the agent did with it, step by step. `steps` read like an agent log:
 * a past-tense verb, then the specifics. Times are when each step happened.
 */
export const agent = {
  name: "OmniPulse agent",
  /** Who answers the captain: MahAcharya Ji, as the voice of the agent. */
  replier: { name: "MahAcharya Ji", photo: "/acharyas/mahacharya-avatar.webp" },
  you: "You say it",
  it: "It gets done",
  runs: [
    {
      site: "Flat 4B, New Town",
      speaker: "Captain Bikram",
      lang: "Hinglish",
      text: "Kal tak kitchen aur bathroom ki tiling khatam karni hai. Raju aur Meena lagao.",
      reply: "**7 tasks** set for Raju and Meena, due tomorrow 6 pm.",
      steps: [
        { icon: "ear", label: "Understood", detail: "Hinglish voice note", time: "09:02" },
        { icon: "plan", label: "Planned", detail: "7 tasks · Raju, Meena · due 6 pm", time: "09:02" },
        { icon: "cam", label: "Checked", detail: "3 photos · tiles level", time: "16:31" },
        { icon: "score", label: "Scored", detail: "Kitchen tiling · 9.2 / 10", time: "16:31" },
        { icon: "pay", label: "Paid", detail: "₹640 added to Raju’s pay", time: "16:32" },
      ],
    },
    {
      site: "Tower C, New Town",
      speaker: "Captain Sunita",
      lang: "বাংলা",
      text: "আজ টাওয়ার সি-তে দেয়ালে পুট্টি শেষ করতে হবে।",
      reply: "**4 tasks** set for your crew at Tower C, due today 5 pm.",
      steps: [
        { icon: "ear", label: "Understood", detail: "Bengali voice note", time: "08:15" },
        { icon: "plan", label: "Planned", detail: "4 tasks · Sunita’s crew · due 5 pm", time: "08:15" },
        { icon: "cam", label: "Checked", detail: "8 photos · 1 wall needs a 2nd coat", time: "15:40" },
        { icon: "score", label: "Scored", detail: "Wall putty · 8.4 / 10", time: "15:41" },
        { icon: "pay", label: "Paid", detail: "₹1,920 across 4 workers", time: "15:42" },
      ],
    },
    {
      site: "Flat 4B, New Town",
      speaker: "Captain Bikram",
      lang: "English",
      text: "Who hasn’t sent photos for Flat 4B yet?",
      reply: "**Arif K.** owes 2 photos. I’ve sent him a voice reminder in Hindi.",
      steps: [
        { icon: "ear", label: "Understood", detail: "Question in English", time: "17:05" },
        { icon: "eye", label: "Searched", detail: "Flat 4B board · 12 tasks today", time: "17:05" },
        { icon: "cam", label: "Found", detail: "Arif K. · 2 tasks without photos", time: "17:05" },
        { icon: "send", label: "Reminded", detail: "Voice note to Arif, in Hindi", time: "17:06" },
      ],
    },
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

/**
 * The product tour under "See it in the app": one short clip per feature,
 * screen-recorded in the OmniDEL demo apps (Omnidel_Frontend, demo data) and
 * kept in public/tour/. Each plays once, then the tour moves to the next.
 */
export const showcase = [
  {
    key: "day",
    tab: "Your day",
    title: "Your day at a glance",
    text: "What’s planned, what’s moving and what’s done, for your own work and the work you hand out.",
    kind: "desk",
    url: "app.omnidel.ai/home",
    clip: "/tour/day",
  },
  {
    key: "board",
    tab: "The board",
    title: "One board for the whole crew",
    text: "Every task is a card with an owner, a deadline and its proof. Open one to see all of it.",
    kind: "desk",
    url: "app.omnidel.ai/pulse/board",
    clip: "/tour/board",
  },
  {
    key: "scores",
    tab: "Scores",
    title: "The Acharya scores, the captain decides",
    text: "Photo proof arrives already scored. Take the Acharya’s score or enter your own, then approve it or send it back.",
    kind: "desk",
    url: "app.omnidel.ai/pulse/review",
    clip: "/tour/scores",
  },
  {
    key: "acharyas",
    tab: "Acharyas",
    title: "A mentor in every worker’s pocket",
    text: "Karigars learn each task from their Acharya, ask questions in their own language and test themselves with a short quiz.",
    kind: "phone",
    url: "",
    clip: "/tour/acharya",
  },
] as const;

/** The OmniVarsity roster, as the app lists it (dev.omnidel.ai/omnivarsity/acharyas). Photos in public/acharyas/. */
export const acharyas: { initials: string; name: string; field: string; color: string; photo?: string }[] = [
  { initials: "M", name: "MahAcharya Ji", field: "Founder", color: "#254a33", photo: "/acharyas/acharya-mahacharya.png" },
  { initials: "SA", name: "Dr Swapan", field: "Health", color: "#7a3b22", photo: "/acharyas/acharya-swapan.webp" },
  { initials: "NA", name: "Neeranjan", field: "Farming", color: "#1f6f5c", photo: "/acharyas/acharya-neeranjan.webp" },
  { initials: "SA", name: "Subhas", field: "Business", color: "#8b3320", photo: "/acharyas/acharya-subhas.webp" },
  { initials: "VA", name: "Vivek", field: "Finance", color: "#254a33", photo: "/acharyas/acharya-vivek.webp" },
  { initials: "LA", name: "Lakshman", field: "Sales", color: "#a5711a", photo: "/acharyas/acharya-lakshman.webp" },
  { initials: "SA", name: "Soumyajit", field: "Focus", color: "#a74a2d", photo: "/acharyas/acharya-soumyajit.webp" },
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

/* ── /acharya page ─────────────────────────────────────────────────────── */

/**
 * The Acharya page (/acharya). Hero, "Listen to Acharya Ji" voice clips, what an
 * Acharya can do, app screens and the other Acharyas.
 *
 * Portrait: MahAcharya Ji's photo from the OmniVarsity app. Set `portrait` to
 * null to fall back to the "M" monogram; swap in a transparent cut-out later.
 */
export const acharyaPage = {
  hello: "Hello,",
  name: "I’m Acharya Ji",
  role: "Your 24/7 AI Acharya",
  lead: "A mentor who knows your company, speaks your crew’s language, and is awake whenever the work is.",
  portrait: "/acharyas/acharya-mahacharya.png" as string | null,
  /** Full-length cut-out (transparent PNG) shown and animated in the hero. */
  figure: "/acharyas/mahacharya-full.png",
  /**
   * MahAcharya Ji introducing himself, in his own words (from his persona in
   * OmniVarsity), spoken in his OmniVarsity voice (Gemini Live "Charon").
   * `cues` are the start times (seconds) of each line, for the captions.
   * Set `src` to null to show captions only.
   */
  intro: {
    src: "/audio/mahacharya-intro.mp3" as string | null,
    /**
     * Lip-synced video of the same intro (MoDA talking-head, made from the
     * full-length image's head and shoulders). It is laid over the figure in
     * the hero while he speaks, and carries the sound. null = audio only.
     */
    video: "/acharyas/mahacharya-talking.mp4" as string | null,
    cues: [0.15, 4.84, 10.63, 14.74, 22.16, 26.5],
    lines: [
      "Namaste. I am MahAcharya Ji,",
      "the founding Acharya of KarmYog for the 21st Century.",
      "Every Acharya here teaches in my line.",
      "My work is simple: to remove the friction between your intention and your next useful action.",
      "Speak to me in Hindi, Bengali or English.",
      "I will meet you where you are, and give you one clear next step at a time.",
    ],
  },
  cta: { label: "Book a demo", href: "mailto:ram.badrinathan@jvl.run?subject=Acharya%20demo" },

  listen: {
    title: ["Listen to", "Acharya Ji"],
    lead: "Real conversations, in the voice your crew hears.",
    clips: [
      {
        title: "Leave Policy Query",
        note: "A Karyakarta asks about leave in Hindi. Acharya Ji checks the company policy and files the request.",
        lang: "हिन्दी · Hindi",
        src: "/audio/acharya-leave-query.mp3",
        duration: 22,
        peaks: [0.69, 0.67, 0.33, 0.67, 0.7, 0.17, 0.69, 0.36, 0.23, 0.27, 0.77, 0.33, 0.08, 0.08, 0.37, 0.8, 0.47, 0.35, 0.57, 0.38, 0.59, 0.5, 0.08, 0.68, 0.53, 0.69, 0.26, 0.49, 0.57, 0.51, 0.42, 0.74, 0.31, 0.11, 0.08, 0.73, 0.78, 0.63, 0.68, 0.78, 0.14, 0.68, 0.7, 0.13, 0.65, 0.51, 0.76, 0.17, 0.22, 1.0, 0.49, 0.24, 0.4, 0.59, 0.08, 0.08, 0.64, 0.56, 0.52, 0.67, 0.51, 0.54, 0.48, 0.08],
      },
      {
        title: "Daily Task Planning",
        note: "A Karyakarta asks what’s on today. Acharya Ji puts the most urgent task first and opens it.",
        lang: "English",
        src: "/audio/acharya-daily-tasks.mp3",
        duration: 23,
        peaks: [0.79, 0.55, 0.19, 0.08, 0.92, 0.58, 0.08, 0.19, 0.88, 0.98, 0.43, 0.09, 0.08, 0.81, 0.65, 0.08, 0.69, 0.35, 0.08, 0.08, 0.43, 0.92, 0.95, 0.77, 0.52, 0.98, 0.9, 0.93, 0.28, 0.08, 0.71, 0.89, 0.51, 0.08, 1.0, 0.85, 0.75, 0.94, 0.86, 0.18, 0.08, 0.92, 0.78, 0.13, 0.77, 0.76, 0.4, 0.08, 0.53, 0.96, 0.49, 0.08, 0.5, 0.53, 0.08, 0.08, 0.71, 0.49, 0.73, 0.55, 0.63, 0.68, 0.35, 0.09],
      },
    ],
  },

  capabilities: {
    eyebrow: "What Acharya Ji can do",
    title: "One mentor, many kinds of help",
    items: [
      {
        key: "knowledge",
        nav: "Company knowledge",
        title: ["Knows your", "company"],
        lead: "Upload your policies, SOPs and FAQs once. Acharya Ji answers from them, not from guesswork.",
        mock: {
          head: "Knowledge base · 42 documents",
          meta: "synced 2 min ago",
          rows: [
            { tag: "POLICY", text: "Leave policy 2026", status: "Learned", tone: "ok" },
            { tag: "SOP", text: "Tile work quality checklist", status: "Learned", tone: "ok" },
            { tag: "FAQ", text: "Pay and advance questions", status: "Learned", tone: "ok" },
            { tag: "UPLOAD", text: "Safety rules, Tower C.pdf", status: "Reading", tone: "amber" },
          ],
        },
      },
      {
        key: "references",
        nav: "References",
        title: ["Shows where the", "answer came from"],
        lead: "Every answer points back to the page it came from, so a captain can check it in one tap.",
        mock: {
          head: "“How many casual leaves do I get?”",
          meta: "answered in 1.2 s",
          rows: [
            { tag: "ANSWER", text: "12 per year · you have 7 left", status: "", tone: "" },
            { tag: "SOURCE", text: "Leave policy 2026 · section 3.1", status: "Open", tone: "blue" },
            { tag: "SOURCE", text: "Your leave record · Sept", status: "Open", tone: "blue" },
          ],
        },
      },
      {
        key: "tasks",
        nav: "Everyday tasks",
        title: ["Helps with the", "day’s work"],
        lead: "What’s due, what’s next, what’s blocked. Acharya Ji sorts the day and nudges at the right time.",
        mock: {
          head: "Today · Raju K.",
          meta: "3 tasks",
          rows: [
            { tag: "2 PM", text: "Client follow-up call", status: "Due soon", tone: "amber" },
            { tag: "5 PM", text: "Weekly site report", status: "Planned", tone: "blue" },
            { tag: "DONE", text: "Kitchen wall tiling · photo scored 9.2", status: "Done", tone: "ok" },
          ],
        },
      },
      {
        key: "navigate",
        nav: "App guide",
        title: ["Finds the way", "around the app"],
        lead: "“Where do I upload my photo?” Acharya Ji explains the steps and opens the right screen.",
        mock: {
          head: "“How do I submit my task report?”",
          meta: "3 steps",
          rows: [
            { tag: "1", text: "Open ‘My tasks’", status: "Opened", tone: "ok" },
            { tag: "2", text: "Pick the finished task, add a photo or note", status: "", tone: "" },
            { tag: "3", text: "Tap ‘Submit’. It goes straight to your captain.", status: "", tone: "" },
          ],
        },
      },
      {
        key: "personal",
        nav: "Personalization",
        title: ["Shaped to your", "company"],
        lead: "Your names, your sites, your rules. Each crew member gets answers that fit their role and history.",
        mock: {
          head: "Profile · Meena S.",
          meta: "Tiling crew · Flat 4B",
          rows: [
            { tag: "ROLE", text: "Tiler · 3 years", status: "", tone: "" },
            { tag: "PREFERS", text: "Voice replies in Hindi", status: "On", tone: "ok" },
            { tag: "TEACHING", text: "Grout spacing, one tip a day", status: "Day 4", tone: "blue" },
          ],
        },
      },
      {
        key: "languages",
        nav: "Indian languages",
        title: ["Speaks your", "crew’s language"],
        lead: "Voice and text in the languages India works in. Ask in one, get the answer in the same one.",
        langs: ["हिन्दी", "বাংলা", "मराठी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "മലയാളം", "ગુજરાતી", "ਪੰਜਾਬੀ", "اردو", "English"],
      },
    ],
  },

  screens: {
    eyebrow: "Inside the Acharya app",
    title: "Everything runs through an Acharya",
    lead: "Tasks, chat and scores all live with the mentor your crew already talks to.",
    phones: [
      { image: "/screens/acharya-list.webp", label: "Pick your Acharya" },
      { image: "/screens/acharya-chat.webp", label: "Talk to MahAcharya Ji" },
      { image: "/screens/acharya-tasks.webp", label: "Tasks with an Acharya" },
    ],
  },

  others: {
    eyebrow: "Meet other Acharyas",
    title: "A mentor for every kind of work",
    lead: "Hover to say hello.",
  },
};

/* ── Landing: hero world, journey timeline, numbers ───────────────────── */

/**
 * The hero's world (components/HeroWorld.tsx): a 3D globe turned to India,
 * threads of light from Indian cities to a phone, the phone cycling through
 * the OmniDEL app, and notifications arriving beside it. The globe's images
 * are in public/hero/ (scripts/hero-footage/build_hero.py); which way it faces
 * is in content/globe.json. The phone's screens and the notifications follow
 * the jobs in `agent` (Flat 4B and Tower C).
 */
export const heroWorld = {
  label:
    "Animation: a globe turned to India, with threads of light from Kolkata, Delhi, Mumbai and Bengaluru to a phone. The phone shows the OmniDEL app: the list of Acharyas, a task’s photo proof and score, then the worker’s pay, while notifications arrive beside it.",
  globe: {
    day: "/hero/earth-day.webp",
    clouds: "/hero/earth-clouds.webp",
    still: "/hero/globe.webp",
    still400: "/hero/globe-400.webp",
  },
  /** The city whose pin gets a label: where the pilot runs. */
  live: "Kolkata",
  phone: {
    brand: "OmniDEL.ai",
    tagline: "Your crew does the work.",
    list: { title: "Acharyas", sub: "A guide for every job" },
    tabs: [
      { icon: "pulse", label: "Today" },
      { icon: "seed", label: "Acharyas" },
      { icon: "plan", label: "Tasks" },
      { icon: "pay", label: "Pay" },
    ],
    task: {
      title: "Kitchen tiling",
      meta: "Flat 4B · Raju · due 6 pm",
      proof: "Photo proof",
      checked: "3 photos checked",
      scoreLabel: "Acharya’s score",
      score: 9.2,
      note: "Tiles level · grout lines clean",
      approve: "Approve",
      approved: "Approved",
    },
    pay: {
      who: "Raju’s pay",
      amount: 640,
      note: "Added just now",
      lines: [
        { label: "Kitchen tiling", value: "+₹640" },
        { label: "Bathroom grout", value: "+₹420" },
        { label: "This week", value: "₹3,860" },
      ],
    },
  },
  notes: [
    { icon: "ear", tone: "green", title: "Voice note understood", text: "Captain Bikram · Hinglish" },
    { icon: "plan", tone: "ochre", title: "7 tasks planned", text: "Raju, Meena · due 6 pm" },
    { icon: "cam", tone: "green", title: "Photo proof checked", text: "3 photos · tiles level" },
    { icon: "score", tone: "ochre", title: "Scored 9.2 / 10", text: "By the Acharya · kitchen tiling" },
    { icon: "pay", tone: "terra", title: "₹640 paid to Raju", text: "Kitchen tiling · 4:32 pm" },
    { icon: "ear", tone: "green", title: "Voice note in Bengali", text: "Captain Sunita · Tower C" },
    { icon: "cam", tone: "terra", title: "1 wall needs a 2nd coat", text: "Tower C · 8 photos checked" },
    { icon: "pay", tone: "terra", title: "4 workers paid ₹1,920", text: "Tower C · 3:42 pm" },
    { icon: "send", tone: "ochre", title: "Reminder sent to Arif", text: "Voice note, in Hindi" },
  ],
} as const;

/** "From sign-up to a working crew": the onboarding steps, in order. */
export const journey = {
  eyebrow: "Getting started",
  title: ["From sign-up to", "a working crew"],
  lead: "Five steps, and most teams are done in a week.",
  steps: [
    { label: "Step 1", title: "Sign up", text: "Create your OmniDEL ID with your mobile number and pick a plan for your team." },
    { label: "Step 2", title: "Upload knowledge", text: "Share your policies, SOPs and FAQs so your Acharyas learn how your company works." },
    { label: "Step 3", title: "Sync your system", text: "Add your crew and sites. Acharyas keep their knowledge up to date as things change." },
    { label: "Step 4", title: "Assign tasks", text: "Say a task out loud, in any language. It lands on the board with an owner and a deadline." },
    { label: "Step 5", title: "Crew gets to work", text: "Karyakartas use the Acharya app to do the day’s tasks, send photo proof and learn as they go." },
  ],
};

/** Numbers we can stand behind today. Add more as pilots report results. */
export const numbers = {
  title: ["Built for the way", "India works"],
  items: [
    { pre: "", value: 30, suffix: "", label: "Workers onboarded in our live Kolkata pilot" },
    { pre: "", value: 7, suffix: "", label: "AI Acharyas, each a mentor in its own field", featured: true },
    { pre: "", value: 24, suffix: "/7", label: "An Acharya is awake whenever the work is" },
  ],
  note: "Pilot figures as of October 2026.",
};
