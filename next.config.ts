import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the project root: a stray package-lock.json higher up (e.g. in the home
  // folder) otherwise makes Next.js guess the wrong workspace root.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
