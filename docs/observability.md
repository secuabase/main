# Observability (Phase 1)

What is wired: Sentry (errors + 10% traces, no PII, no session replay), PostHog EU
(page views + identified users, browser and server), Slack incoming webhook for #secuabase-ops.
Every piece is a no-op when its env var is empty, so local dev and preview builds work without accounts.

## Files

| File | Purpose |
| --- | --- |
| `sentry.server.config.ts`, `sentry.edge.config.ts` | Sentry init per server runtime, loaded by `src/instrumentation.ts` |
| `src/instrumentation.ts` | `register()` + `onRequestError` (reports server render / route errors) |
| `src/instrumentation-client.ts` | Browser Sentry init + `onRouterTransitionStart` |
| `src/app/global-error.tsx` | Last-resort error page; captures to Sentry, "Try again" button |
| `next.config.ts` | `withSentryConfig` from `@sentry/nextjs/config`; uploads source maps only when org/project/token are set |
| `src/lib/observability/posthog-provider.tsx` | `<PostHogProvider>` (client), `identifyUser(id, { email, is_admin })`, `resetUser()` |
| `src/lib/observability/posthog-server.ts` | `getPostHogServer()`, `captureServerEvent(distinctId, event, props)` |
| `src/lib/observability/slack.ts` | `notifyOps(text, blocks?)` -> boolean, 5 s timeout, never throws |

Mount PostHog once in `src/app/layout.tsx`: wrap `{children}` in `<PostHogProvider>`.

## Env vars

| Var | Where to get it | Vercel environment |
| --- | --- | --- |
| `SENTRY_DSN` | Sentry -> Project -> Settings -> Client Keys (DSN) | Production, Preview |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN value (browser needs the public prefix) | Production, Preview |
| `SENTRY_ORG` | Sentry org slug (URL: sentry.io/organizations/`<slug>`) | Production, Preview |
| `SENTRY_PROJECT` | Sentry project slug | Production, Preview |
| `SENTRY_AUTH_TOKEN` | Sentry -> Settings -> Auth Tokens, scope `project:releases` (+ `org:read`) | Production, Preview (sensitive) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog EU -> Project settings -> Project API key (`phc_...`) | Production, Preview |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` (EU data residency; already the default) | all |
| `SLACK_WEBHOOK_URL` | Slack -> Apps -> Incoming Webhooks -> add to #secuabase-ops | Production, Preview (sensitive) |

Use two Sentry projects / PostHog projects (staging, live) or at least rely on the `environment`
tag, which is set from `VERCEL_ENV` (`production` / `preview` / `development`).
Never put `SENTRY_AUTH_TOKEN` or `SLACK_WEBHOOK_URL` in a `NEXT_PUBLIC_` var or in git.

## How to test

- Sentry: set both DSN vars, run the app, visit a page that throws (or call
  `Sentry.captureMessage("test from staging")` in a route handler). The event appears in
  Sentry -> Issues within a minute. Break the root layout to see `global-error.tsx`.
- PostHog: set the key, open the app, click through 2-3 pages. In PostHog EU -> Activity
  (live events) you see one `$pageview` per route change with `$current_url`.
  After login, `identifyUser` makes the person show up under People with `email` and `is_admin`.
- Slack: `curl -X POST -H 'content-type: application/json' --data '{"text":"Secuabase webhook test"}' "$SLACK_WEBHOOK_URL"`
  must print `ok` and post in #secuabase-ops. In the app, `await notifyOps("hello from staging")` returns `true`.
- Empty vars: unset everything, `npm run build` and `npm run dev` must still pass with no warnings from these modules.

## Not in Phase 1

Session replay, Sentry performance alerts, PostHog feature flags / autocapture / heatmaps,
server-side error -> Slack forwarding, Sentry -> Slack integration, log drains, uptime checks.
