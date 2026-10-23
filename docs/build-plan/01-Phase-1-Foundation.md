# Secuabase Build — Phase 1: Foundation

Oct 23, 2026 · Bugra

Phase 1 sets up the repo, hosting, login, roles and the app shell for all 3 portals. Week Oct 26–30, Friday demo on staging Oct 30, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). The orchestrator plans the tasks, splits them to sub-agents, and checks every item in "Done when" before the demo.

- Read `CLAUDE.md` and the Build Plan first. Hard rules there always win.
- Design: build every page from its frame in the Secuabase Platform Figma file (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Do not invent layouts.
- Work on the `staging` branch. One PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Access · Login | Password + "email me a link" tabs, remember device, forgot password |
| Access · Check email | 6-digit code boxes, resend timer, link + code valid 15 min |
| App shell (from any page) | Top bar, nav per portal, avatar, alerts bell, light + dark mode, phone bottom nav |

## Backend work

1. GitHub repo, Next.js App Router + TypeScript + Tailwind + shadcn/ui. Secuabase v3 tokens from Figma variables.
2. Supabase project in EU (Frankfurt). Staging and live projects.
3. Vercel project: staging + live. Domains app., supplier., pay.secuabase.com.
4. Resend domain with SPF, DKIM, DMARC. Sender: requests@secuabase.com (confirm with Bugra).
5. Supabase Auth: password, magic link, 6-digit code. Admin 2-step (authenticator app).
6. Roles: admin, owner, editor, viewer, billing. Supplier access = token only (no account).
7. Row-level security on every table with `client_id`. One test per role.
8. `events` audit log table + a helper used by every write.
9. Sentry, PostHog EU, Slack webhook env var.
10. Seed script with the v2 sample clients (Alpenhaus Textil, Kettle & Co, Brightleaf Home, Nordvik Outdoor, Voltwise, Casa Lino, Fjell Gear, Pinebrook Kids, Rikka Kitchen, Lumo Kids, Bergwald Sport, Maison Flore).

## Database in this phase

`profiles`, `clients`, `client_members`, `plans`, `admin_settings`, `events`. Plans seeded: Free pilot (5 products, 1 rule, 30 days), Founding €500 + €1,500/mo, Starter €7,500 + €3,500/mo, Growth €10,000 + €6,000/mo, Scale €15,000 + €9,000+/mo (USD same numbers).

## Done when

- [ ] Staging and live open on all 3 domains with HTTPS
- [ ] Login works with password, magic link and 6-digit code
- [ ] Admin login asks for the 2-step code
- [ ] Each role sees only what it should (RLS tests pass in CI)
- [ ] Every write lands in `events`
- [ ] App shell matches Figma on desktop and phone, light and dark
- [ ] Seed data loads with one command
- [ ] Test email from Resend reaches Gmail inbox (not spam)

## Out of scope

Any client, supplier or admin page content. Payments. AI.

## Hand-off

At the end, the orchestrator writes a short note in the PR: what is done, what moved to Phase 2, env vars Bugra must set, and the staging link.
