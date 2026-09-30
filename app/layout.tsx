import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/hind/400.css";
import "@fontsource/hind/500.css";
import "./globals.css";
import { ScrollProgress } from "@/components/Motion";

export const metadata: Metadata = {
  title: { default: "OmniDEL.ai — Your crew does the work. The agent does the rest.", template: "%s · OmniDEL.ai" },
  description:
    "OmniPulse is an AI agent for work crews: speak a task in any language, and it plans the day, checks the photo proof, scores the work and settles the pay.",
  metadataBase: new URL("https://omnidel.ai"),
  openGraph: { title: "OmniDEL.ai", description: "Your crew does the work. The agent does the rest.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#faf7f0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="od-skip" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <div className="od">{children}</div>
      </body>
    </html>
  );
}
