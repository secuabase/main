# Secuabase build — STATUS

Updated: Oct 23, 2026 (orchestration chat, before Phase 1 starts Oct 26).
Read this first in every new chat. Update it when infra changes or a "Done when" item passes.

## Where we are

Phase 0 (set-up by Bugra through the connectors) is partly done. Phase 1 (Foundation,
Oct 26–30) has not started. No repo, no code, no database tables exist yet.

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
