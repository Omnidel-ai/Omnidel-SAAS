import fs from "node:fs";
import path from "node:path";

/**
 * Background scenes. Drop a real photo into public/scenes/ as hero.jpg (or
 * .jpeg / .webp / .png) or closing.jpg and the site uses it automatically at
 * the next build; with no photo it falls back to the painted SVG.
 */
const EXT = ["jpg", "jpeg", "webp", "png"];

export function scene(name: "hero" | "closing"): { src: string; photo: boolean } {
  for (const ext of EXT) {
    if (fs.existsSync(path.join(process.cwd(), "public", "scenes", `${name}.${ext}`))) return { src: `/scenes/${name}.${ext}`, photo: true };
  }
  return { src: `/scenes/${name}.svg`, photo: false };
}
