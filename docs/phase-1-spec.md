# Phase 1 build spec (contract for all workers)

Oct 23, 2026. Read `CLAUDE.md` first. This file is the shared contract between the database
work and the app/UI work so they can run in parallel. Do not change a contract item without
telling the orchestrator.

## Stack as installed

- Next.js 16 (App Router, `src/` dir, Turbopack), React 19, TypeScript, Tailwind v4 (CSS-first
  config in `src/app/globals.css`, no `tailwind.config.js`), ESLint 9. npm, not pnpm.
- `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`,
  `class-variance-authority`. Dev: `vitest`, `tsx`, `dotenv`.
- Next 16 note: request middleware lives in `src/proxy.ts` (export `proxy`), not `middleware.ts`.
  Check `node_modules/next/dist/docs` or the installed types if unsure.
- Supabase projects: staging `ivezobdhppfrrxwojsap`, live `hjxzlspisflxqsiyigmy`, both eu-central-1.
  Env var names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY` (server only), `DATABASE_URL` (optional, pooler).
  `.env.local` is git-ignored. `.env.example` lists names only.

## File ownership (no overlap)

| Worker | Owns |
| --- | --- |
| Database | `supabase/**` (migrations, `config.toml` if needed), `scripts/seed.ts`, `tests/rls/**`, `vitest.config.ts`, `src/lib/db/**` (`types.ts`, `events.ts`), `package.json` scripts `seed`, `test:rls` (add via `npm pkg set`, do not rewrite the file) |
| App / UI | `src/app/**`, `src/components/**`, `src/lib/supabase/**`, `src/lib/utils.ts`, `src/lib/auth/**`, `src/proxy.ts`, `public/**`, `components.json`, `package.json` dependencies (via `npm install`) |
| Orchestrator | `CLAUDE.md`, `STATUS.md`, `docs/**`, `.env.example`, deploys, applying migrations to Supabase |

## Database contract (Phase 1 tables)

All timestamps `timestamptz default now()`. All ids `uuid default gen_random_uuid()` unless noted.
Enums are Postgres enums.

```
client_stage: invited | onboarding | pilot | paid | paused | leaving
client_health: on_track | at_risk | blocked
member_role: owner | editor | viewer | billing
member_status: invited | active | removed

profiles          id uuid pk references auth.users on delete cascade,
                  email text not null, full_name text, is_admin boolean not null default false,
                  created_at, updated_at
plans             id text pk ('free_pilot','founding','starter','growth','scale'),
                  name text, setup_fee_cents int, monthly_cents int, currency text default 'EUR',
                  product_limit int null, rule_limit int null, member_limit int null,
                  pilot_days int null, sort int
clients           id uuid pk, name text not null, slug text unique not null,
                  stage client_stage not null default 'invited',
                  plan_id text references plans, country text, currency text default 'EUR',
                  vat_id text, health client_health not null default 'on_track',
                  mrr_cents int not null default 0, pilot_ends_at timestamptz,
                  contact_name text, contact_email text, invited_at timestamptz,
                  created_at, updated_at, deleted_at timestamptz
client_members    id uuid pk, client_id uuid references clients on delete cascade,
                  user_id uuid references profiles on delete cascade,
                  role member_role not null, status member_status not null default 'active',
                  invited_email text, created_at, updated_at,
                  unique (client_id, user_id)
admin_settings    key text pk, value jsonb not null default '{}', updated_at
events            id bigint generated always as identity pk,
                  client_id uuid null, actor_id uuid null, actor_role text,
                  action text not null, object_type text not null, object_id text,
                  before jsonb, after jsonb, ip inet, user_agent text, created_at
```

Plans seed (EUR, USD same numbers): free_pilot (0 / 0, product_limit 5, rule_limit 1,
pilot_days 30), founding (€500 setup / €1,500 mo), starter (€7,500 / €3,500, product_limit 150),
growth (€10,000 / €6,000, product_limit 500), scale (€15,000 / €9,000, limits null = custom).

Helper functions (schema `public`, `security definer`, `set search_path = public`):
- `is_admin() returns boolean` — true when `profiles.is_admin` for `auth.uid()`.
- `client_role(p_client_id uuid) returns member_role` — the caller's active role in that client, or null.
- `has_client_role(p_client_id uuid, p_roles member_role[]) returns boolean`.
- `log_event(p_client_id uuid, p_action text, p_object_type text, p_object_id text, p_before jsonb, p_after jsonb) returns bigint`
  — inserts into `events` with `actor_id = auth.uid()`, `actor_role` = 'admin' | member role | 'system'.
  Granted to `authenticated` and `service_role`.

Triggers:
- `auth.users` insert → create `profiles` row (email, full_name from raw_user_meta_data).
- `updated_at` maintained on profiles, clients, client_members, admin_settings.
- Audit triggers on `clients`, `client_members`, `profiles`, `admin_settings`: after insert /
  update / delete → `log_event(...)` with before/after row JSON. This is what makes
  "every write lands in events" true even for writes that forget the helper.

Row-level security (enabled on every table; `events` has no update/delete policy for anyone):
- profiles: select own row, or any row if `is_admin()`. Update own row but a non-admin cannot
  change `is_admin` (enforce with a trigger or column check). Admin can update any.
- plans: select for `authenticated`; insert/update/delete only `is_admin()`.
- clients: `is_admin()` all. Members: select where `has_client_role(id, '{owner,editor,viewer,billing}')`.
  Update where `has_client_role(id, '{owner,editor}')`. No insert/delete for members.
- client_members: `is_admin()` all. Select where caller is a member of the same client.
  Insert/update/delete where `has_client_role(client_id, '{owner}')`; an owner cannot remove the last owner.
- admin_settings: `is_admin()` only.
- events: select where `is_admin()` or `has_client_role(client_id, '{owner,editor,viewer}')`.
  Insert only through `log_event` (function is security definer; table has no insert policy).

Storage buckets (private): none needed in Phase 1. Leave for Phase 2.

Seed (`npm run seed`, `scripts/seed.ts`, service-role key from `.env.local`, idempotent, safe to
re-run): creates auth users with password `SEED_PASSWORD` from env (default `Secuabase-Seed-2026!`):
- `hello@secuabase.com` → admin (`is_admin = true`), full_name "Bugra Buyukduykular".
- Alpenhaus Textil team: `anna@alpenhaus.de` owner "Anna Weber", `editor@alpenhaus.de` editor,
  `viewer@alpenhaus.de` viewer, `billing@alpenhaus.de` billing.
- `owner@kettle.co` owner of Kettle & Co (for cross-client tests).
Clients (12): Alpenhaus Textil (DE, growth, paid, on_track, mrr 6000), Brightleaf Home (US, starter,
paid, on_track, 3500), Kettle & Co (US, starter, paid, at_risk, 3500), Nordvik Outdoor (NO, starter,
paid, on_track, 3500), Voltwise (ES, founding, paid, on_track, 1500), Casa Lino (IT, founding, paid,
on_track, 1500), Fjell Gear (SE, free_pilot, pilot, blocked, 0, pilot_ends_at +12 days),
Pinebrook Kids (UK, free_pilot, pilot, on_track, 0), Rikka Kitchen (FI, free_pilot, pilot, on_track, 0),
Lumo Kids (NL, founding, onboarding, at_risk, 0), Bergwald Sport (AT, free_pilot, invited, on_track, 0),
Maison Flore (FR, starter, invited, on_track, 0).

RLS tests (`npm run test:rls`, Vitest, `tests/rls/*.test.ts`): run against the project in
`.env.local` using the publishable key and password sign-in for each seeded user. One file per role:
admin, owner, editor, viewer, billing, anonymous. Each asserts what that role can and cannot see or
change on every Phase 1 table, and that every write produced an `events` row. CI will run this
against staging with secrets.

## Auth contract

Supabase Auth, email provider. Flows the UI must implement:
- Password: `signInWithPassword`. "Remember this device" unchecked → session cookie only
  (no `maxAge`); checked → 30 days.
- Email link + 6-digit code: `signInWithOtp({ email, options: { shouldCreateUser: false } })`.
  Supabase sends one email that contains both the link and the code (`{{ .Token }}` in the
  template; template + 15-minute expiry are dashboard settings, orchestrator handles them).
  Check-email page verifies the code with `verifyOtp({ email, token, type: 'email' })`. The link
  lands on `/auth/confirm?token_hash=…&type=email` which calls `verifyOtp({ token_hash, type })`.
- Forgot password: `resetPasswordForEmail` → `/auth/confirm?type=recovery` → `/reset-password`.
- Admin 2-step: Supabase MFA TOTP. `profiles.is_admin` users must reach AAL2 before any `/admin`
  route: not enrolled → `/admin/setup-2fa` (QR + code), enrolled → `/admin/verify-2fa`.
  Non-admin users never see these pages.
- After login: admin → `/admin`; otherwise first active `client_members` row → `/app`;
  none → `/no-access` page ("Ask your admin for an invite").
- Logout: `POST /auth/logout`.
- Supplier portal: no auth. Route `/s/[token]` renders the supplier shell; Phase 1 shows only a
  friendly "This link is not valid" state (tokens arrive in Phase 3).

Host routing in `src/proxy.ts`: `supplier.secuabase.com/*` → rewrite to `/s/*`;
`pay.secuabase.com/*` → `/pay/*` (placeholder page); `app.secuabase.com` and localhost serve
everything. Also refresh the Supabase session cookie on every request (standard `@supabase/ssr`
pattern) and gate `/admin/*` and `/app/*`.

## UI contract

Brand tokens are already in `src/app/globals.css` as CSS variables and Tailwind `@theme` colors
(`bg-primary`, `text-ink`, `bg-ground`, `bg-card`, `border-line`, `text-muted`, `bg-tint`,
`text-success`, `text-alert`, `bg-signal`, …). Dark mode uses the `.dark` class on `<html>`.
Font: Poppins via `next/font/google`, weights 400/500/600/700, CSS variable `--font-poppins`.
Reference screenshots: `docs/reference/*.png` (desktop 1360 wide, phone 390 wide).

Shell (build once as `src/components/shell/*`, used by three layouts):
- Desktop top bar: full-width glass card (white 70%, blur, 1px white border, radius 24, height 64,
  margin 24) containing: logo (mark + "secuabase" wordmark in a white pill) left; centered pill nav
  (active = Persian blue pill with white text, inactive = light tint pill with ink text); right side
  icon buttons (bell; admin also has a gear) and a 40px avatar circle in Persian blue with initials.
- Admin nav: Overview `/admin`, Clients `/admin/clients`, Review `/admin/review`, Invites
  `/admin/invites`, Suppliers `/admin/suppliers`, Billing `/admin/billing`.
- Client nav: Home `/app`, Products `/app/products`, Suppliers `/app/suppliers`, Filings
  `/app/filings`, Assistant `/app/assistant`, Billing `/app/billing`.
- Supplier top bar: logo left, "Secure link for {supplier}" text right, no nav.
- Phone (< 768px): top row = mark in a white pill (left), bell in a white circle and avatar (right),
  no wordmark; bottom nav = floating pill (Midnight, radius 32, margin 16, height 64) with 5 icons,
  active icon in a white circle. Admin icons: home, users, check-square, plus, credit-card.
  Client icons: home, hexagon (products), file (filings), sparkles (assistant), credit-card (billing).
- Page background: `bg-ground` with the three soft radial Persian-blue glows from the Figma
  (`.app-bg` utility in globals.css).
- Page header: greeting "Good morning, {first name}!" in Poppins 600 at 48px desktop / 32px phone.
- Light + dark toggle in the avatar menu (sun/moon), persisted in `localStorage`, default system.
- Phase 1 page content: `/admin` and `/app` show the greeting plus one empty-state card
  ("Nothing here yet. Phase 2 adds the dashboard."). Other nav routes render the same empty state
  with the page title. No charts, no tables.

Login (`/login`, reference `login-desktop.png`, `login-phone.png`): two cards side by side on desktop
(stacked on phone). Left: Persian-blue gradient card with eyebrow "SECUABASE", headline "Proof for
every product. Done for you.", sub-line, a decorative line chart SVG, and three KPI tiles
(74% proof ready, 48/62 suppliers replied). The design shows a third tile "8 languages"; the Build
Plan says remove it, so show only two tiles. Right: white card "Log in", "Welcome back. Use your
work email.", segmented pills Password / Email me a link, fields, "Remember this device" checkbox,
"Forgot password?" link, primary button, "or" divider, secondary button "Email me a login link",
footer note "New client? You get an invite from Secuabase. Suppliers never need to log in."
Check email (`/check-email?email=…`, references `check-email-*.png`): centered card, blue circle
with mail icon, "Check your email", explanation with the address, six code boxes (auto-advance,
paste support, numeric keyboard on phone; 3+3 on phone), "Verify and log in", "No email? Send
again in 0:42" countdown then active link, pill "Link and code work for 15 minutes, one time only".
Errors render as an alert-tinted line under the form in plain English.

Accessibility and quality: every control keyboard reachable, 44px touch targets on phone, labels
on inputs, `aria-live` for errors, no layout shift on font load (`display: swap`), lint clean,
`npm run build` passes.
