// Sentry for the Edge runtime (proxy / middleware, edge route handlers).
// Loaded by src/instrumentation.ts. Silent when SENTRY_DSN is empty.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  // No PII: Sentry v11 never sends user IP, cookies or headers unless opted in per integration.
  debug: false,
});
