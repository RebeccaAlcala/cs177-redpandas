import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 auto-generates an AGENTS.md on dev/build; this repo uses CLAUDE.md
  // for AI-tool instructions, so disable it.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The app reads mocked JSON from data/seed and data/ai-cache at request time.
  // Make sure those files are traced into the server bundle (e.g. on Vercel).
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
