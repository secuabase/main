// Sentry in the browser. Runs once before the app hydrates.
// Silent when NEXT_PUBLIC_SENTRY_DSN is empty. No session replay, no PII.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  // No PII: Sentry v11 never sends user IP, cookies or headers unless opted in per integration.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
