# Vercel environment variables for Supabase

Oct 23, 2026. Reference for the `secuabase-dashboard` Vercel project. Public values are
filled in; secret values are never written in this folder.

## The idea in one paragraph

The Next.js app does not know which Supabase project it talks to. It reads that from
environment variables at build and run time. Vercel stores those variables per project and
lets you set a different value for each environment: Production (the `main` branch, live
users), Preview (every other branch, including `staging`) and Development (your laptop via
`vercel env pull`). We use that split to point Production at `secuabase-live` and
Preview + Development at `secuabase-staging`. Same code, two databases, zero chance of a
test run touching real client data.

## The variables

| Variable | Public? | Where it comes from | What it is for |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project settings → API → Project URL | Base URL of the project's API (`https://<ref>.supabase.co`). The browser and the server both use it |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase → Project settings → API keys → Publishable key (`sb_publishable_…`) | Identifies the project for client-side requests. Safe to ship to the browser because row-level security decides what it can see. Replaces the legacy `anon` JWT |
| `SUPABASE_SECRET_KEY` (new) or `SUPABASE_SERVICE_ROLE_KEY` (legacy) | **no** | Supabase → Project settings → API keys → Secret key (`sb_secret_…`) or service_role JWT | Bypasses row-level security. Only for server code: webhooks, cron jobs, seed script, admin actions. Never prefixed `NEXT_PUBLIC_`, never sent to the browser |
| `DATABASE_URL` (optional) | **no** | Supabase → Connect → Transaction pooler URI, port 6543 | Direct Postgres connection for Drizzle migrations and the seed script. Not needed by the web app itself if everything goes through the Supabase client |
| `SUPABASE_JWT_SECRET` (optional) | **no** | Supabase → Project settings → API → JWT settings | Only if we verify Supabase JWTs ourselves in middleware. Usually not needed with `@supabase/ssr` |

Rules:
- `NEXT_PUBLIC_` prefix = baked into the browser bundle at build time. Anyone can read it. Only the URL and the publishable key may carry it.
- Everything else is read on the server only. If a secret ends up with `NEXT_PUBLIC_`, rotate it.
- Use the new publishable / secret keys, not the legacy anon / service_role JWTs. Both work today, but the new ones can be rotated one at a time.

## Values per environment

| Variable | Production → `secuabase-live` | Preview + Development → `secuabase-staging` |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hjxzlspisflxqsiyigmy.supabase.co` | `https://ivezobdhppfrrxwojsap.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_p088LQIVLJNjuCZgYXXu7g_daWUv321` | `sb_publishable_L87J2UftiFJWswdTJnYVSQ_-GfKTV01` |
| `SUPABASE_SECRET_KEY` | from the live project's API keys page | from the staging project's API keys page |
| `DATABASE_URL` | live pooler URI | staging pooler URI |

Anything that contains `osqndtpucmsrwgvnihez` belongs to the paused Tokyo project and must go.

## How to set them in Vercel

1. Vercel → `secuabase-dashboard` → Settings → Environment Variables.
2. Add each variable **twice**: once with only **Production** ticked (live values), once with
   **Preview** and **Development** ticked (staging values). Vercel allows the same name with
   different environment scopes.
3. Tick **Sensitive** on the secret key and database URL. Sensitive values cannot be read back
   in the dashboard or by `vercel env pull`, which is what we want.
4. Do not tick **Preview** for the live values. If `staging` previews hit the live database,
   demo data lands in production.
5. Redeploy after changing a `NEXT_PUBLIC_` variable. They are frozen into the build, so the
   running deployment keeps the old value until it is rebuilt.

## Local development

```bash
vercel env pull .env.local
```

Pulls the Development values (staging) into `.env.local`, which is git-ignored. Sensitive
values come down empty; paste those by hand from the Supabase dashboard. Never commit
`.env.local`. Commit a `.env.example` with the names and no values.

## The Vercel ↔ Supabase integration (optional)

Vercel's marketplace integration can create these variables for you. It adds a longer list
(`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, …) and links **one** Supabase project per Vercel environment.
It is fine to use, but:
- it links only one Supabase project to Production and one to Preview; set live and staging accordingly;
- it uses the legacy anon / service_role names. Our code reads the names in the table above,
  so either map them in code or add our names alongside;
- it may have been linked to the Tokyo project. Check Settings → Integrations → Supabase.

## How the app uses them

- `lib/supabase/client.ts` (browser): `createBrowserClient(URL, PUBLISHABLE_KEY)`.
- `lib/supabase/server.ts` (server components, route handlers): `createServerClient(URL, PUBLISHABLE_KEY, { cookies })`.
  Same public key; the user's session cookie makes it act as that user, and RLS applies.
- `lib/supabase/admin.ts` (webhooks, cron, seed): `createClient(URL, SECRET_KEY)`. RLS bypassed. Import only from server files.
- `drizzle.config.ts` and `scripts/seed.ts`: `DATABASE_URL`.

## What breaks if a value is wrong

| Symptom | Likely cause |
| --- | --- |
| "Invalid API key" on every request | Publishable key from one project with the URL of another |
| Login works on staging preview but not on production | Production has staging values, or Auth redirect URLs not set for `app.secuabase.com` |
| Seed data appears on the live site | Preview and Production share the same Supabase values |
| Changed a value, nothing changed | `NEXT_PUBLIC_` var needs a redeploy |
| `fetch failed` / timeouts | URL points at the paused Tokyo project |

## Also set in Supabase (not Vercel)

Authentication → URL configuration, per project:
- Staging: Site URL = the staging preview URL; Redirect URLs = `https://*-secuabase.vercel.app/**` and `http://localhost:3000/**`.
- Live: Site URL = `https://app.secuabase.com`; Redirect URLs = `https://app.secuabase.com/**`, `https://pay.secuabase.com/**`.
Without these, magic links and 6-digit code logins redirect to the wrong host.
