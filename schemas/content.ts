import { z } from "zod";
import { ColorSchema, MediaSrcSchema } from "./media";

/**
 * The content contract.
 *
 * One schema for every block of copy the site shows. They describe exactly
 * what content/site.ts holds today, and they are the shape the content API
 * (Supabase or a CMS) must return later. Types are inferred from these
 * schemas in types/content.ts, so the schema is the single source of truth.
 *
 * Validate with `npm run content:check`.
 */

/* ── Building blocks ─────────────────────────────────────────────────── */

/** Non-empty copy. */
const Text = z.string().trim().min(1);
/** Copy that may contain `**bold**` spans, rendered by <Rich>. */
const RichText = Text;
/** A heading split over lines: each item is a line or styled run. */
const Lines = z.array(z.string().min(1)).min(1);
/** A site path, in-page anchor or mailto link. */
const Href = z.string().regex(/^(\/|#|mailto:|https:\/\/)/, "Use a /path, #anchor, mailto: or https:// link");

export const LinkSchema = z.object({ label: Text, href: Href });
export const QaSchema = z.object({ q: Text, a: Text });
export const PhoneScreenSchema = z.object({ image: MediaSrcSchema, label: Text });
const SectionIntro = { eyebrow: Text, title: Text, lead: Text };

/* ── IDs shared with checkout (lib/order.ts) ─────────────────────────── */

export const BillingSchema = z.enum(["monthly", "yearly"]);
export const PlanIdSchema = z.enum(["pulse", "velocity"]);
export const AddOnIdSchema = z.enum(["mart", "studio", "ads"]);

/* ── Site-wide ───────────────────────────────────────────────────────── */

export const BrandSchema = z.object({
  name: Text,
  badge: Text,
  tagline: Text,
  motto: z.object({ hi: Text, en: Text }),
  legal: Text,
  trademark: Text,
});

export const NavSchema = z.array(LinkSchema).min(1);

export const FooterSchema = z.array(z.object({ title: Text, links: z.array(Text).min(1) })).min(1);

/* ── Home page ───────────────────────────────────────────────────────── */

export const HeroSchema = z.object({
  eyebrow: Text,
  title: Lines,
  lead: Text,
  primary: LinkSchema,
  video: z.object({ label: Text, note: Text, href: Href }),
  live: Text,
});

export const AgentSchema = z.object({
  site: Text,
  speaker: Text,
  langs: Text,
  prompts: z.array(z.object({ text: Text, lang: Text, reply: RichText })).min(1),
  steps: z
    .array(
      z.object({
        /** A name from components/Icon.tsx. */
        icon: Text,
        label: Text,
        detail: Text,
        time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
      }),
    )
    .min(1),
});

export const TrustSchema = z.object({
  title: Text,
  items: z.array(z.object({ name: Text, note: Text })).min(1),
});

const CalloutPosition = z
  .object({ top: z.string(), bottom: z.string(), left: z.string(), right: z.string() })
  .partial()
  .strict();

export const ShowcaseSlideSchema = z.object({
  key: Text,
  tab: Text,
  url: Text,
  image: MediaSrcSchema,
  caption: Lines,
  phones: z.array(PhoneScreenSchema).optional(),
  callouts: z.array(
    z.object({
      kind: z.enum(["num", "live", "dark"]),
      value: Text.optional(),
      text: RichText,
      style: CalloutPosition,
    }),
  ),
});
export const ShowcaseSchema = z.array(ShowcaseSlideSchema).min(1);

export const AcharyaSchema = z.object({
  initials: Text,
  name: Text,
  field: Text,
  color: ColorSchema,
  photo: MediaSrcSchema.optional(),
});
export const AcharyasSchema = z.array(AcharyaSchema).min(1);

export const MahacharyaSchema = z.object({
  name: Text,
  role: Text,
  greeting: Text,
  placeholder: Text,
  fallback: Text,
  qa: z.array(QaSchema).min(1),
});

export const BeforeAfterSchema = z.object({
  ...SectionIntro,
  before: z.object({ tag: Text, title: Text }),
  after: z.object({ tag: Text, title: Text }),
  rows: z.array(z.object({ before: Text, after: Text })).min(1),
});

export const HeroChatSchema = z.object({
  acharya: Text,
  scenes: z
    .array(
      z.object({
        topic: Text,
        lang: Text,
        msgs: z.array(z.object({ from: z.enum(["u", "a"]), text: Text })).min(1),
      }),
    )
    .min(1),
});

export const JourneySchema = z.object({
  eyebrow: Text,
  title: Lines,
  lead: Text,
  steps: z.array(z.object({ label: Text, title: Text, text: Text })).min(1),
});

export const NumbersSchema = z.object({
  title: Lines,
  items: z
    .array(
      z.object({
        pre: z.string(),
        value: z.number().nonnegative(),
        suffix: z.string(),
        label: Text,
        featured: z.boolean().optional(),
      }),
    )
    .min(1),
  note: Text,
});

export const ClosingSchema = z.object({ title: Lines, lead: Text });

/* ── Pricing and checkout ────────────────────────────────────────────── */

const Rupees = z.number().int().nonnegative();

export const PlanSchema = z.object({
  id: PlanIdSchema,
  tab: Text,
  name: Text,
  for: Text,
  price: z.object({ monthly: Rupees, yearly: Rupees }),
  lead: Text.optional(),
  features: z.array(Text).min(1),
  featured: z.boolean().optional(),
});
export const PlansSchema = z.array(PlanSchema).min(1);

export const AddOnSchema = z.object({
  id: AddOnIdSchema,
  name: Text,
  line: Text,
  price: Rupees,
  icon: AddOnIdSchema,
  tint: ColorSchema,
  ink: ColorSchema,
  features: z.array(Text).min(1),
});
export const AddOnsSchema = z.array(AddOnSchema);

export const PricingCopySchema = z.object({
  eyebrow: Text,
  title: Lines,
  lead: Text,
  yearlySave: Text,
  enterprise: z.object({ eyebrow: Text, text: Text, cta: Text }),
  addOnsTitle: Text,
  addOnsLead: Text,
  loginNote: Text,
});

export const CheckoutStepsSchema = z.array(Text).min(1);
export const FaqSchema = z.array(QaSchema).min(1);

/* ── /acharya page ───────────────────────────────────────────────────── */

const MockRow = z.object({
  tag: Text,
  text: Text,
  status: z.string(),
  tone: z.enum(["", "ok", "amber", "blue"]),
});

export const CapabilitySchema = z
  .object({
    key: Text,
    nav: Text,
    title: Lines,
    lead: Text,
    mock: z.object({ head: Text, meta: Text, rows: z.array(MockRow).min(1) }).optional(),
    langs: z.array(Text).min(1).optional(),
  })
  .refine((c) => c.mock || c.langs, "A capability needs a mock screen or a language list");

export const VoiceClipSchema = z.object({
  title: Text,
  note: Text,
  lang: Text,
  src: MediaSrcSchema,
  /** Seconds, shown before the audio has loaded. */
  duration: z.number().positive(),
  /** Waveform bar heights, 0–1. */
  peaks: z.array(z.number().min(0).max(1)).min(1),
});

export const AcharyaIntroSchema = z
  .object({
    /** Spoken intro; null shows captions only. */
    src: MediaSrcSchema.nullable(),
    /** Lip-synced video of the intro (an .mp4 with a .webm twin); null = audio only. */
    video: MediaSrcSchema.nullable(),
    /** Start time in seconds of each caption line. */
    cues: z.array(z.number().nonnegative()),
    lines: z.array(Text).min(1),
  })
  .refine((i) => i.cues.length === i.lines.length, "Every caption line needs exactly one cue")
  .refine((i) => i.cues.every((t, k) => k === 0 || t > i.cues[k - 1]), "Cues must be in increasing order");

export const AcharyaPageSchema = z.object({
  hello: Text,
  name: Text,
  role: Text,
  lead: Text,
  /** Photo for the monogram badge; null falls back to the initial. */
  portrait: MediaSrcSchema.nullable(),
  /** Full-length transparent cut-out shown in the hero. */
  figure: MediaSrcSchema,
  intro: AcharyaIntroSchema,
  cta: LinkSchema,
  listen: z.object({ title: Lines, lead: Text, clips: z.array(VoiceClipSchema).min(1) }),
  capabilities: z.object({ eyebrow: Text, title: Text, items: z.array(CapabilitySchema).min(1) }),
  screens: z.object({ ...SectionIntro, phones: z.array(PhoneScreenSchema).min(1) }),
  others: z.object(SectionIntro),
});

/* ── Everything together ─────────────────────────────────────────────── */

/**
 * The full content payload. This is what one call to the content API will
 * return; until then the local adapter assembles it from content/site.ts.
 */
export const SiteContentSchema = z.object({
  brand: BrandSchema,
  nav: NavSchema,
  footer: FooterSchema,
  hero: HeroSchema,
  agent: AgentSchema,
  trust: TrustSchema,
  showcase: ShowcaseSchema,
  acharyas: AcharyasSchema,
  mahacharya: MahacharyaSchema,
  beforeAfter: BeforeAfterSchema,
  heroChat: HeroChatSchema,
  journey: JourneySchema,
  numbers: NumbersSchema,
  closing: ClosingSchema,
  plans: PlansSchema,
  addOns: AddOnsSchema,
  pricingCopy: PricingCopySchema,
  checkoutSteps: CheckoutStepsSchema,
  faq: FaqSchema,
  acharyaPage: AcharyaPageSchema,
});
