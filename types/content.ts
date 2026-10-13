import type { z } from "zod";
import type * as S from "@/schemas/content";
import type * as M from "@/schemas/media";

/**
 * Content types, inferred from the schemas in schemas/. Never write these by
 * hand: change the schema and the type follows.
 */

/* Media */
export type MediaSrc = z.infer<typeof M.MediaSrcSchema>;
export type ImageAsset = z.infer<typeof M.ImageAssetSchema>;
export type AudioAsset = z.infer<typeof M.AudioAssetSchema>;
export type VideoAsset = z.infer<typeof M.VideoAssetSchema>;

/* Shared */
export type Link = z.infer<typeof S.LinkSchema>;
export type Qa = z.infer<typeof S.QaSchema>;
export type PhoneScreen = z.infer<typeof S.PhoneScreenSchema>;
export type Billing = z.infer<typeof S.BillingSchema>;
export type PlanId = z.infer<typeof S.PlanIdSchema>;
export type AddOnId = z.infer<typeof S.AddOnIdSchema>;

/* Site-wide */
export type Brand = z.infer<typeof S.BrandSchema>;
export type Nav = z.infer<typeof S.NavSchema>;
export type Footer = z.infer<typeof S.FooterSchema>;

/* Home page */
export type Hero = z.infer<typeof S.HeroSchema>;
export type Agent = z.infer<typeof S.AgentSchema>;
export type Trust = z.infer<typeof S.TrustSchema>;
export type ShowcaseSlide = z.infer<typeof S.ShowcaseSlideSchema>;
export type Acharya = z.infer<typeof S.AcharyaSchema>;
export type Mahacharya = z.infer<typeof S.MahacharyaSchema>;
export type BeforeAfter = z.infer<typeof S.BeforeAfterSchema>;
export type HeroChat = z.infer<typeof S.HeroChatSchema>;
export type Journey = z.infer<typeof S.JourneySchema>;
export type Numbers = z.infer<typeof S.NumbersSchema>;
export type Closing = z.infer<typeof S.ClosingSchema>;

/* Pricing and checkout */
export type Plan = z.infer<typeof S.PlanSchema>;
export type AddOn = z.infer<typeof S.AddOnSchema>;
export type PricingCopy = z.infer<typeof S.PricingCopySchema>;

/* /acharya page */
export type Capability = z.infer<typeof S.CapabilitySchema>;
export type VoiceClip = z.infer<typeof S.VoiceClipSchema>;
export type AcharyaIntro = z.infer<typeof S.AcharyaIntroSchema>;
export type AcharyaPage = z.infer<typeof S.AcharyaPageSchema>;

/* Everything */
export type SiteContent = z.infer<typeof S.SiteContentSchema>;
