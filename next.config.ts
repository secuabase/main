import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Source maps are uploaded only when SENTRY_ORG, SENTRY_PROJECT and
// SENTRY_AUTH_TOKEN are all set (Vercel build env). Without them the build
// still passes; the upload step is skipped.
export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // v11 name for the old `disableLogger`: strips Sentry debug statements.
  bundleSizeOptimizations: { excludeDebugStatements: true },
});
