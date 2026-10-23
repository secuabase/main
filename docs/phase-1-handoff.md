# Phase 1 — Foundation: hand-off note

Oct 23, 2026 · branch `staging` · paste this as the body of the PR `staging` → `main`.

## What is done

**Database (staging `ivezobdhppfrrxwojsap`, applied and verified)**
- 5 migrations in `supabase/migrations/`: enums, `profiles`, `plans`, `clients`, `client_members`,
  `admin_settings`, `events`; helper functions `is_admin`, `client_role`, `has_client_role`,
  `log_event` (security definer, fixed search_path); `auth.users` → `profiles` trigger;
  `updated_at` triggers; audit triggers on every writable table (insert / update / delete →
  `events` with before/after JSON and actor role); guards: non-admin cannot set `is_admin`,
  a client always keeps one active owner, owners/editors cannot change plan / stage / MRR fields.
- RLS on every table, exactly the spec's policies. `events` is append-only through `log_event`.
- Plans seeded (free_pilot, founding, starter, growth, scale).
- Seed: `supabase/seed.sql` (pure SQL, loaded on staging today) and `npm run seed`
  (`scripts/seed.ts`, Admin API, needs `SUPABASE_SECRET_KEY`). Both idempotent.
- `npm run test:rls`: 73 Vitest tests, one file per role (admin, owner, editor, viewer, billing,
  anonymous), all green against staging. Every allowed write is asserted to produce an `events` row.
- Security advisors: only the expected warnings remain (security-definer helpers callable by
  `authenticated`, which RLS needs; "leaked password protection" is a dashboard toggle).

**App (Next.js 16, built from the Figma frames with the Figma MCP)**
- `/login` (Password / Email-me-a-link, remember this device, forgot password), `/check-email`
  (6 code boxes, resend countdown, 15-minute pill), `/auth/confirm`, `/forgot-password`,
  `/reset-password`, `POST /auth/logout`, `/no-access`, `/admin/setup-2fa`, `/admin/verify-2fa`.
- Shell for the three portals: glass top bar with pill nav, avatar menu (dark mode, log out),
  phone top row + floating bottom nav, supplier bar. `/admin/*` and `/app/*` show the greeting or
  page title plus the Phase 1 empty state. `/s/[token]` shows "This link is not valid"; `/pay`
  is a placeholder.
- `src/proxy.ts`: host routing (`supplier.` → `/s`, `pay.` → `/pay`), Supabase session refresh,
  login gate, admin gate (`is_admin` + TOTP AAL2).
- "Remember this device": an `sb-remember` cookie decides whether the Supabase auth cookies get
  a 30-day `maxAge` or stay session cookies (`src/lib/supabase/cookie-policy.ts`).
- Observability wired: Sentry (server, edge, client, `global-error.tsx`), PostHog EU provider,
  Slack `notifyOps()` helper. All no-ops until the env values exist (`docs/observability.md`).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean. `npm run test:e2e` (Playwright,
  desktop + phone) covers login, check-email, gates, shell and host routing.
- CI: `.github/workflows/ci.yml` runs lint, types, build, then the RLS tests against staging.

**Verified by hand on staging (browser):** `anna@alpenhaus.de` → `/app` with greeting, nav, dark
mode, log out; `hello@secuabase.com` → `/admin/setup-2fa` → QR → code → `/admin`. The test TOTP
factor was deleted afterwards so Bugra enrols his own phone.

## What moved to Phase 2 or is waiting on Bugra

- **No staging link yet.** There is no GitHub remote, so nothing is deployed. Steps 1–2 in
  `STATUS.md` (GitHub repo, Vercel connect, `supplier.`/`pay.` DNS) produce the staging URL.
- **Live database** still empty: applying the 5 migrations to `hjxzlspisflxqsiyigmy` needs Bugra's
  explicit go-ahead (the automated attempt was blocked as a production change).
- **Magic link + 6-digit code end to end** needs the Supabase dashboard settings (OTP 6 digits,
  900 s, the two email templates in `docs/email-templates/`, custom SMTP via Resend). Code paths
  are complete and the password flow is verified.
- **Resend → Gmail inbox**: a branded test was sent and delivered on Oct 23; Bugra confirms Inbox.
- Admin bell / gear and all page content: Phase 2.
- Figma vs spec: the shell uses the Figma geometry (top bar 70 px, avatar 48 px, headings
  Poppins 400) where the spec text said 64 / 40 / 600. Tell the next chat which to keep.

## Env vars Bugra must set

| Where | Var | Value |
| --- | --- | --- |
| `.env.local` | `SUPABASE_SECRET_KEY` | staging secret key (for `npm run seed`) |
| GitHub → Actions secrets | `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_PUBLISHABLE_KEY`, `SEED_PASSWORD` | values in `STATUS.md` / `.env.local` |
| Vercel Production | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | live project |
| Vercel Preview + Development | same three | staging project |
| Vercel (when the accounts exist) | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `SLACK_WEBHOOK_URL`, `RESEND_API_KEY` | see `docs/observability.md` |

## Seed logins (staging only)

Password `Secuabase-Seed-2026!` · admin `hello@secuabase.com` · Alpenhaus owner `anna@alpenhaus.de`,
`editor@`, `viewer@`, `billing@alpenhaus.de` · Kettle & Co owner `owner@kettle.co`.

## Staging link

Not available yet — see "What moved". Local: `npm run dev` → http://localhost:3000/login.
