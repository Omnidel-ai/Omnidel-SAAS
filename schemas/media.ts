import { z } from "zod";

/**
 * Media schemas.
 *
 * Today every image, audio clip and video is a file in public/ and the content
 * refers to it by path ("/audio/intro.mp3"). Later the same fields will hold
 * CDN or streaming URLs ("https://cdn.omnidel.ai/…", a Mux HLS URL). Both are
 * valid `MediaSrc` values, so moving a file to a CDN only changes the data.
 */

/** A path into public/ ("/screens/home.webp") or an absolute https URL. */
export const MediaSrcSchema = z
  .string()
  .regex(/^(\/(?!\/)|https:\/\/)\S+$/, "Media must be a /public path or an https:// URL");

/** A CSS colour as written in the content: a hex code or a CSS variable. */
export const ColorSchema = z.string().regex(/^(#[0-9a-fA-F]{3,8}|var\(--[\w-]+\))$/, "Use a hex colour or var(--token)");

/* ── Asset objects ───────────────────────────────────────────────────────
 * The shapes the API will return for media. Content still uses plain
 * `MediaSrc` strings today; the media-wrappers PR moves components over to
 * these objects so a player receives everything it needs in one prop.
 */

export const ImageAssetSchema = z.object({
  src: MediaSrcSchema,
  alt: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const AudioAssetSchema = z.object({
  src: MediaSrcSchema,
  /** Length in seconds, shown before the file has loaded. */
  durationSec: z.number().positive().optional(),
  /** Waveform bar heights, 0–1, drawn before playback. */
  peaks: z.array(z.number().min(0).max(1)).optional(),
  /** Caption track (WebVTT). */
  captions: MediaSrcSchema.optional(),
});

export const VideoSourceSchema = z.object({
  src: MediaSrcSchema,
  /** e.g. "video/webm", "video/mp4", "application/x-mpegURL" (HLS). */
  type: z.string().min(1),
});

export const VideoAssetSchema = z.object({
  /** In order of preference; the browser plays the first one it supports. */
  sources: z.array(VideoSourceSchema).min(1),
  poster: MediaSrcSchema.optional(),
  captions: MediaSrcSchema.optional(),
  durationSec: z.number().positive().optional(),
  alt: z.string().optional(),
});
