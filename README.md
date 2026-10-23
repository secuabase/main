# Secuabase platform

One Next.js app, three portals:

- **Admin** (`/admin`, only Bugra, needs 2-step login) — review, clients, invites, billing.
- **Client** (`/app`) — the client's products, suppliers, filings, assistant, billing.
- **Supplier** (`/s/<token>`, `supplier.secuabase.com`) — no login, a secure link per request.
- `pay.secuabase.com` → `/pay` (Stripe Checkout links later).

Stack: Next.js 16 (App Router, `src/`, Turbopack), React 19, TypeScript, Tailwind v4, shadcn/ui
(base-nova), Supabase (Postgres, Auth, Storage) in Frankfurt, Vercel. Design source: the Figma file
in `CLAUDE.md`; brand tokens live in `src/app/globals.css`.

## Run it

```bash
cp .env.example .env.local   # fill in the values below
npm install
npm run dev                  # http://localhost:3000 → /login
```

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (staging for local dev) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` key (never the secret key) |
| `SUPABASE_SECRET_KEY` | Server only. Needed by `npm run seed` and `npm run test:rls` |
| `SEED_PASSWORD` | Password the seed users get (default `Secuabase-Seed-2026!`) |

Other scripts:

```bash
npm run seed       # load the v2 sample clients and users into the project in .env.local
npm run test:rls   # row-level-security tests, one file per role
npm run lint       # eslint
npm run build      # production build (no live Supabase needed)
```

## Auth in short

- Password login, or email link + 6-digit code (`/login` → `/check-email`).
- "Remember this device" off = browser session cookie; on = 30 days
  (see `src/lib/supabase/cookie-policy.ts`).
- Admins must pass TOTP 2-step login (`/admin/setup-2fa`, `/admin/verify-2fa`) before any `/admin` page.
- Gates and host routing live in `src/proxy.ts`. Server actions live in `src/lib/auth/actions.ts`.

## Branches

- `main` = live. `staging` = test copy; every push deploys a preview on Vercel.
- One PR per task, tests must pass. Demo on staging every Friday.

## Where things are

```
src/app/(auth)      login, check-email, forgot/reset password, no-access, admin 2FA pages
src/app/(admin)     /admin shell + pages      src/app/(client)   /app shell + pages
src/app/s           supplier portal           src/app/pay        payment placeholder
src/app/auth        /auth/confirm (email links), /auth/logout
src/components/shell  top bar, phone nav, theme, page header, empty state
src/components/auth   forms                   src/components/ui  shadcn components
src/lib/supabase    browser / server / proxy clients, cookie policy
src/lib/auth        actions, redirect rules, error messages
supabase/           migrations                scripts/seed.ts    seed data
tests/rls           RLS tests                 docs/              build plan + spec
```
