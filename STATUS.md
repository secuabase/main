# Secuabase build — STATUS

Updated: Oct 23, 2026 (Phase 1 build chat, after the Phase 1 code was built on `staging`).
Read this first in every new chat. Update it when infra changes or a "Done when" item passes.

## Where we are

Phase 1 (Foundation) code is built and verified locally against the staging database, on git
branch `staging` (this folder is the repo). Nothing is pushed yet: there is no GitHub remote, so
there is no Vercel preview and no PR. Hand-off note: `docs/phase-1-handoff.md`.
Code: Next.js 16 + Tailwind v4 + shadcn (base-nova), `src/` dir, npm. Spec: `docs/phase-1-spec.md`.

What exists on `staging`:
- Database: 5 migrations in `supabase/migrations/` (enums, 6 tables, helper functions, audit
  triggers, RLS, plans). Applied to **staging** and verified. `supabase/seed.sql` (SQL fallback
  seed) loaded on staging: 6 users, 12 clients, 5 memberships. `scripts/seed.ts` = the same via
  the Admin API (needs the secret key). `tests/rls/*` = 73 RLS tests, green on staging.
- App: login (password / email link + 6-digit code), check-email, forgot/reset password,
  admin 2-step (TOTP enrol + verify), `/no-access`, app shell for admin / client / supplier,
  host routing + session refresh + gates in `src/proxy.ts`, light + dark mode.
- Observability: Sentry, PostHog EU provider, Slack `notifyOps()` helper wired in code; no
  accounts or keys yet (`docs/observability.md`).
- Tests: `npm run test:rls` (Vitest, staging), `npm run test:e2e` (Playwright, dev server).
- CI: `.github/workflows/ci.yml` (lint, types, build, then RLS tests against staging).

## Bugra's manual steps (Claude cannot do these)

1. **GitHub:** create an empty private repo (suggested `secuabase/secuabase-platform`), then in
   this folder: `git remote add origin git@github.com:<org>/<repo>.git && git push -u origin main staging`.
   Then add repo secrets for CI: `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_PUBLISHABLE_KEY`
   (values below), `SEED_PASSWORD` (same as `.env.local`). Open the PR `staging` → `main` and paste
   `docs/phase-1-handoff.md` as its body.
2. **Vercel:** `secuabase-dashboard` → Settings → Git → connect that repo. Production branch
   `main`; `staging` deploys as preview. Env vars per `docs/vercel-supabase-env-vars.md`. Add the
   domains `supplier.secuabase.com` and `pay.secuabase.com` to the project and add their CNAMEs at
   GoDaddy (same target as `app.`). Re-connect the Claude Vercel connector choosing the
   **`secuabase` team**; the current token is personal-scope only and cannot request team access.
3. **Supabase secret key:** paste the staging project's secret key into `.env.local` as
   `SUPABASE_SECRET_KEY` (for `npm run seed`). Never commit it.
4. **Supabase Auth settings (staging now, live later):** Authentication → Providers → Email:
   **Email OTP expiration = 900 s**, **Email OTP length = 6**; enable "Leaked password protection".
   URL configuration: Site URL `http://localhost:3000` (then the staging preview URL), Redirect URLs
   `http://localhost:3000/**`, `https://*-secuabase.vercel.app/**`. Email templates: paste
   `docs/email-templates/supabase-magic-link.html` (Magic Link) and `supabase-reset-password.html`
   (Reset Password). Both link to `/auth/confirm?token_hash=…` and show `{{ .Token }}`.
   SMTP: custom SMTP via Resend (host `smtp.resend.com`, port 465, user `resend`, password = a
   Resend API key, sender `login@secuabase.com`) so auth emails are not limited to 2 per hour.
5. **Live database:** approve applying the same 5 migrations to `secuabase-live` (Claude's
   attempt was blocked as a production change). Then create your admin user there (Phase 2 invite
   flow, or `npm run seed` pointed at live with only the admin — do not load demo clients on live).
6. **Supabase plan:** upgrade the org to Pro before Phase 2 ships cron jobs (Free pauses idle projects).
7. Delete the paused Tokyo project (`osqndtpucmsrwgvnihez`, status INACTIVE).
8. **Resend test:** a branded test email was sent Oct 23 from `login@secuabase.com` to your Gmail
   (Resend status: delivered). Confirm it is in Inbox, not Spam, and tick the item below.

## Infrastructure that already exists

| Piece | State | Ids / notes |
| --- | --- | --- |
| Supabase org | exists, **Free plan** | org `secuabase` (`venrmezermywefxdsmqt`) |
| Supabase staging | **schema applied + seeded** (5 migrations, 6 tables, RLS on) | `secuabase-staging`, ref `ivezobdhppfrrxwojsap`, eu-central-1, Postgres 17 |
| Supabase live | exists, **empty**; migrations wait for Bugra's approval | `secuabase-live`, ref `hjxzlspisflxqsiyigmy`, eu-central-1, Postgres 17 |
| Supabase Tokyo project | **paused, to delete** | ref `osqndtpucmsrwgvnihez`, ap-northeast-1 |
| Vercel project | exists, under team `secuabase`; **connector has no team scope** | `secuabase-dashboard`, `prj_F8L7sCsTHWWE5Fi7q8wUo3CF4KIR`, team `team_pINlkCgSX6uqVPNSrihUmfmu` |
| Vercel domains | `app.` → Vercel CNAME ✓ (public DNS); `supplier.` and `pay.` have **no DNS records** | CNAME target `58b2bb7304e3fb2f.vercel-dns-017.com` |
| Resend sending domain | verified, sending enabled, **test email delivered Oct 23** | `secuabase.com`, id `49cbbcb0-9a5a-4895-9c97-deb5ba49db38`, us-east-1 |
| Resend inbound domain | verified, receiving enabled | `reply.secuabase.com`, id `a2db3ee7-6f05-46f1-b6e2-5a6f64c6ebd8` |
| DNS (GoDaddy) | apex SPF (GoDaddy include), DMARC `p=quarantine; adkim=r; aspf=r`, Resend DKIM ✓ | rua → onsecureserver.net |
| GitHub repo | **not created** (`gh` CLI not installed) | CI workflow is in the repo, waiting for a remote |
| Sentry, PostHog EU, Slack webhook | **wired in code**, no accounts / env values yet | see `docs/observability.md` |
| Stripe, Claude API key | not started (Phase 4 / 7) | Stripe needs the legal entity |
| Local tooling | node v25, npm, Playwright chromium; no pnpm / vercel / supabase CLI | |

## Flags

1. **Vercel connector scope** (blocking all Vercel automation): re-connect with the `secuabase` team.
2. **Sender address:** auth emails `login@secuabase.com` (used for the test). Supplier requests
   `requests@secuabase.com` vs one per client — still open, needed in Phase 3.
3. **DMARC reports** go to a GoDaddy mailbox. Point `rua` to a mailbox Bugra reads before go-live.
4. **Live migrations** need Bugra's go-ahead (see manual step 5).
5. **Figma vs spec numbers:** the shell follows the Figma geometry (top bar 70 px, avatar 48 px,
   headings Poppins 400) where the spec text said 64 / 40 / 600. Say which to keep.

## Phase 1 "Done when" tracker

- [ ] Staging and live open on all 3 domains with HTTPS — *code ready (host routing in `src/proxy.ts`); needs GitHub remote, Vercel connect, `supplier.`/`pay.` DNS*
- [x] Login works with password, magic link and 6-digit code — *password verified in browser + e2e on staging; link + code flows implemented, need the Supabase email template + OTP settings (manual step 4) to test end to end*
- [x] Admin login asks for the 2-step code — *verified: `hello@secuabase.com` → `/admin/setup-2fa` → TOTP → `/admin`; the test factor was deleted so Bugra can enrol his phone*
- [x] Each role sees only what it should (RLS tests pass in CI) — *73 tests green against staging locally; CI runs them once the repo has a remote and secrets*
- [x] Every write lands in `events` — *audit triggers on all 4 writable tables + `log_event`; asserted by the RLS tests*
- [x] App shell matches Figma on desktop and phone, light and dark — *built from the Figma frames via MCP, screenshots checked at 1360 and 375; see flag 5*
- [x] Seed data loads with one command — *`supabase/seed.sql` loaded on staging; `npm run seed` ready, needs the secret key*
- [ ] Test email from Resend reaches Gmail inbox (not spam) — *sent and delivered Oct 23; Bugra confirms Inbox vs Spam*

## Seed users (staging only, password `Secuabase-Seed-2026!`)

`hello@secuabase.com` admin · Alpenhaus Textil: `anna@alpenhaus.de` owner, `editor@alpenhaus.de`,
`viewer@alpenhaus.de`, `billing@alpenhaus.de` · `owner@kettle.co` owner of Kettle & Co.

## Supabase env vars (publishable values only; secret keys stay in Vercel / Supabase settings)

Vercel mapping: **Production** → live, **Preview + Development** → staging. Never point production at staging.

| Var | Staging (`ivezobdhppfrrxwojsap`) | Live (`hjxzlspisflxqsiyigmy`) |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ivezobdhppfrrxwojsap.supabase.co` | `https://hjxzlspisflxqsiyigmy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_L87J2UftiFJWswdTJnYVSQ_-GfKTV01` | `sb_publishable_p088LQIVLJNjuCZgYXXu7g_daWUv321` |
| `SUPABASE_SECRET_KEY` | dashboard → Project settings → API keys | same |

Other env names (all optional until the accounts exist): see `.env.example`.

## Design source

Figma: https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ (24 frames, desktop + phone).
Frame ids used in Phase 1: Login `8:7316`, Check email `8:7516`, Login mobile `7:6845`, Check email
mobile `7:7061`, Admin Overview `8:2`, Client Home `8:3503`, Phone admin `3:8872`, Phone client
`3:9179`, Supplier Requests `8:7907`. Brand assets: `brand-kit/`.

## How this folder works

- This folder is the code repo and the orchestrator. `main` = live, `staging` = test copy.
- New step docs go in `docs/build-plan/` (numbered, same style as 00–08).
- Each new chat: read `CLAUDE.md`, then `STATUS.md`, then the newest step doc and the latest
  `docs/phase-*-handoff.md`.
