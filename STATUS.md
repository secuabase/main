# Secuabase build — STATUS

Updated: Oct 23, 2026 (orchestration chat, before Phase 1 starts Oct 26).
Read this first in every new chat. Update it when infra changes or a "Done when" item passes.

## Where we are

Phase 1 (Foundation) started Oct 23 in this folder. The folder is now the git repo
(branch `main`, first commit = scaffold). Code: Next.js 16 + Tailwind v4 + shadcn, `src/` dir, npm.
Build spec for workers: `docs/phase-1-spec.md`. Figma references: `docs/reference/*.png`.

## Bugra's manual steps for Phase 1 (Claude cannot do these)

1. **GitHub:** create an empty private repo (suggested `secuabase/secuabase-platform`), then run in this folder:
   `git remote add origin git@github.com:<org>/<repo>.git && git push -u origin main`
   (`gh` CLI is not installed; the Homebrew install was stopped.)
2. **Vercel:** in the `secuabase-dashboard` project, Settings → Git → connect that GitHub repo.
   Production branch = `main`. Every push to `staging` then deploys a preview.
   Also re-connect the Claude Vercel connector with the `secuabase` team scope, otherwise Claude
   cannot read deployments, env vars or domains.
3. **Supabase secret key:** paste the staging project's secret key into `.env.local` as
   `SUPABASE_SECRET_KEY` (needed for `npm run seed` and `npm run test:rls`). Never commit it.
4. **Supabase Auth settings (staging, repeat on live later):** Authentication → Providers → Email:
   enable "Confirm email" off for invite flow? (keep default on), set **Email OTP expiration = 900 s**
   (15 min) and **Email OTP length = 6**. Authentication → URL configuration: Site URL
   `http://localhost:3000` for now (staging preview URL later), Redirect URLs
   `http://localhost:3000/**`, `https://*-secuabase.vercel.app/**`. Authentication → Email
   templates → Magic Link: body must include both `{{ .ConfirmationURL }}` and `{{ .Token }}`
   (Claude will supply the branded template text). Authentication → SMTP: enable custom SMTP with
   Resend (host `smtp.resend.com`, port 465, user `resend`, password = a Resend API key, sender
   `login@secuabase.com`) so auth emails are not rate-limited to 2 per hour.
5. **Supabase plan:** upgrade the org to Pro before Phase 1 ships cron jobs (Free pauses idle projects).
6. Delete the paused Tokyo project (still listed, status INACTIVE).

## Infrastructure that already exists

| Piece | State | Ids / notes |
| --- | --- | --- |
| Supabase org | exists | org `secuabase` (`venrmezermywefxdsmqt`) |
| Supabase staging | exists, **empty** (0 tables, 0 migrations, 0 edge functions) | `secuabase-staging`, ref `ivezobdhppfrrxwojsap`, region **eu-central-1 (Frankfurt) ✓**, Postgres 17 |
| Supabase live | exists, **empty** (created Oct 23) | `secuabase-live`, ref `hjxzlspisflxqsiyigmy`, region **eu-central-1 (Frankfurt) ✓**, Postgres 17 |
| Supabase Tokyo project | **paused Oct 23, still to delete** | `secuabase's Project`, ref `osqndtpucmsrwgvnihez`, ap-northeast-1. Verified empty (0 tables, buckets, files, users). Bugra deletes it in the dashboard |
| Supabase plan | **Free** (2 active projects max) | Build Plan assumes Pro ($25/mo) for cron, queue, daily backups and no auto-pause. Upgrade before Phase 1 ships jobs |
| Vercel project | exists, under team `secuabase` | `secuabase-dashboard`, `prj_F8L7sCsTHWWE5Fi7q8wUo3CF4KIR`, team `team_pINlkCgSX6uqVPNSrihUmfmu`. Connector has **no team access** yet, so deployments, env vars and domains could not be read |
| Vercel domains | `app.` attached (CNAME → `58b2bb7304e3fb2f.vercel-dns-017.com`); `supplier.` and `pay.` not yet | Could not confirm inside Vercel (no team scope), but public DNS shows the app. CNAME |
| Resend sending domain | **verified**, sending enabled | `secuabase.com`, id `49cbbcb0-9a5a-4895-9c97-deb5ba49db38`, region us-east-1 (decided Oct 23: keep US, Resend has no EU region). DKIM TXT verified, 2 SPF CNAMEs verified |
| Resend inbound domain | **verified**, receiving enabled | `reply.secuabase.com`, id `a2db3ee7-6f05-46f1-b6e2-5a6f64c6ebd8`, MX → receive.forge.rmta.net |
| DNS (GoDaddy, ns55/56.domaincontrol.com) | apex SPF present (`include:…_spfm.secuabase.com ~all`), DMARC `p=quarantine` present (rua → onsecureserver.net) | app. → Vercel CNAME ✓; supplier. and pay. have no records yet |
| GitHub repo | **unknown** — `gh` CLI not installed on this Mac | check manually or install `gh` |
| Local tooling | node v25.2.1, npm present; **pnpm, vercel, supabase CLIs not installed** | |
| Stripe, Slack webhook, Sentry, PostHog, Claude API key | not checked / not set up | Stripe needs the legal entity (open question) |

## Flags to decide before Phase 1

1. ~~Tokyo Supabase project~~ **Done Oct 23:** `secuabase-live` created in eu-central-1. The Tokyo
   project is paused (connector cannot delete). **Bugra: delete it in the Supabase dashboard**
   (Project settings → General → Delete project) so it stops counting toward the Free limit.
2. ~~Resend region~~ **Decided Oct 23:** Resend has no EU region, so both domains stay in
   us-east-1. Not a flag. The Build Plan line "Resend (EU region)" is out of date.
3. **Vercel connector scope.** The Claude Vercel connector is authorized for your personal
   scope only, not the `secuabase` team, and the token cannot request team authorization
   itself. Fix in Vercel: Settings → Integrations (or re-connect the connector choosing the
   `secuabase` team). Until then Claude cannot read or set env vars, domains or deployments.
4. **Sender address.** `requests@secuabase.com` vs one address per client (open question
   in the Build Plan). DMARC is already `quarantine`, good; confirm the apex SPF include
   covers Resend or that Resend's own `send.` subdomain is used as the envelope sender.
5. **DMARC reports** go to a GoDaddy/onsecureserver mailbox. Fine for now; point `rua` to
   a mailbox Bugra reads before go-live.

## Phase 1 hand-off (Oct 23, orchestration chat → new Phase 1 chat)

Work was started here and then moved to its own chat. State on disk (all committed on `main`):
- Scaffold: Next.js 16, Tailwind v4, Poppins, brand tokens in `src/app/globals.css`, favicon set
  and logo SVGs in `public/`, `.env.local` with staging URL + publishable key (secret key blank).
- shadcn/ui initialised (`components.json`, `src/components/ui/*`, `src/lib/utils.ts`,
  semantic tokens mapped onto the brand in globals.css). Nothing else in `src/` yet.
- `docs/phase-1-spec.md` = the full contract (schema, RLS, seed, auth flows, shell, file
  ownership). `docs/reference/*.png` = Figma screenshots of every Phase 1 frame.
- `docs/email-templates/` = branded Supabase magic-link and reset-password templates.
- Figma: all Phase 1 frame ids are in the spec's reference names; file key `HfmabsPFN5IDF7x9OmylpJ`,
  frames Access · Login `8:7316`, Check email `8:7516`, Login mobile `7:6845`, Check email mobile
  `7:7061`, Admin · Overview `8:2`, Client · Home `8:3503`, Phone admin `3:8872`, Phone client `3:9179`,
  Supplier · Requests `8:7907`.
- Not started: migrations, seed, RLS tests, Supabase clients, proxy, auth pages, shell, deploys.
- The new chat should run the two workers described in the spec (database + app/UI) in parallel,
  then apply migrations to staging with the Supabase connector, seed, run RLS tests, and deploy.

## Phase 1 "Done when" tracker

- [ ] Staging and live open on all 3 domains with HTTPS
- [ ] Login works with password, magic link and 6-digit code
- [ ] Admin login asks for the 2-step code
- [ ] Each role sees only what it should (RLS tests pass in CI)
- [ ] Every write lands in `events`
- [ ] App shell matches Figma on desktop and phone, light and dark
- [ ] Seed data loads with one command
- [ ] Test email from Resend reaches Gmail inbox (not spam) — *domain verified; not yet sent*

## Supabase env vars (publishable values only; service-role keys stay in Vercel / Supabase settings)

Vercel mapping: **Production** → live, **Preview + Development** → staging. Never point production at staging.

| Var | Staging (`ivezobdhppfrrxwojsap`) | Live (`hjxzlspisflxqsiyigmy`) |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ivezobdhppfrrxwojsap.supabase.co` | `https://hjxzlspisflxqsiyigmy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_L87J2UftiFJWswdTJnYVSQ_-GfKTV01` | `sb_publishable_p088LQIVLJNjuCZgYXXu7g_daWUv321` |
| `SUPABASE_SERVICE_ROLE_KEY` (or secret key) | from dashboard → Project settings → API | from dashboard → Project settings → API |

Use the `sb_publishable_…` key, not the legacy JWT anon key. Anything that still says `osqndtpucmsrwgvnihez` (the paused Tokyo project) is wrong and must be replaced.

## Design source

Figma: https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ (24 frames, desktop + phone).
Brand assets: `brand-kit/` in this folder (v3, Poppins, palette in `04-Colors/`).

## How this folder works

- New step docs go in `docs/build-plan/` (numbered, same style as 00–08).
- Each new chat: read `CLAUDE.md`, then `STATUS.md`, then the newest step doc.
- The code repo will live in a sub-folder of this folder (or be cloned next to it) once
  Phase 1 creates it; record its path here.
