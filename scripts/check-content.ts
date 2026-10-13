/**
 * Checks that the site's content matches the content contract in schemas/.
 *
 *   npm run content:check
 *
 * It also checks that every media file the content points to exists in
 * public/. Exits with code 1 on any problem, so it can run in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as site from "../content/site";
import { SiteContentSchema } from "../schemas/content";

const content = {
  brand: site.brand,
  nav: site.nav,
  footer: site.footer,
  hero: site.hero,
  agent: site.agent,
  trust: site.trust,
  showcase: site.showcase,
  acharyas: site.acharyas,
  mahacharya: site.mahacharya,
  beforeAfter: site.beforeAfter,
  heroChat: site.heroChat,
  journey: site.journey,
  numbers: site.numbers,
  closing: site.closing,
  plans: site.plans,
  addOns: site.addOns,
  pricingCopy: site.pricingCopy,
  checkoutSteps: site.checkoutSteps,
  faq: site.faq,
  acharyaPage: site.acharyaPage,
};

let failed = false;

/* 1. Shape: every block matches its schema. Unknown keys are reported too. */
const result = SiteContentSchema.safeParse(content);
if (!result.success) {
  failed = true;
  console.error("✗ Content does not match the schema:\n");
  console.error(z.prettifyError(result.error));
} else {
  console.log(`✓ Content matches the schema (${Object.keys(content).length} blocks)`);
}

/* 2. Media: every /public path the content mentions exists on disk. */
const paths = new Set<string>();
JSON.stringify(content, (_k, v) => {
  if (typeof v === "string" && /^\/(acharyas|audio|screens|scenes)\//.test(v)) paths.add(v);
  return v;
});
const missing = [...paths].filter((p) => !fs.existsSync(path.join(process.cwd(), "public", p)));
if (missing.length) {
  failed = true;
  console.error(`✗ ${missing.length} media file(s) missing from public/:`);
  for (const p of missing) console.error("   " + p);
} else {
  console.log(`✓ All ${paths.size} media files exist in public/`);
}

process.exit(failed ? 1 : 0);
