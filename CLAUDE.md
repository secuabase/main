# Secuabase Platform — CLAUDE.md

## What this is
One Next.js app for 3 portals: admin (only Bugra), client, supplier (no login, secure link).
Design source: the Secuabase Platform Figma file (every page ready, desktop + phone):
https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ
Build each page from its Figma frame with the Figma MCP (/figma-design-to-code skill,
get_design_context per frame). Match it pixel-close; reuse components, don't redraw.
Brand: Secuabase v3 — Poppins 400/500/600/700, Persian blue #2634B9, Midnight #1B207C,
Byzantine #4759D5, Orange #F76A2B (signal only), Emerald #0B7A5B (success), Persian red #C23C25 (alert).

## Stack
Next.js App Router + TypeScript + Tailwind + shadcn/ui on Vercel.
Supabase EU (Frankfurt): Postgres, Auth, Storage, cron, queue, pgvector.
Stripe (card, Checkout payment links, invoices, Stripe Tax). Resend (send + inbound).
Claude API: Sonnet for document checks, Haiku for small jobs, Opus for hard cases.
Sentry, PostHog EU. Slack incoming webhook for #secuabase-ops.

## Hard rules
1. Every client row has client_id and row-level security. Write a test per role.
2. Nothing reaches a client before Bugra approves it. No auto-approve.
3. Every fact in a filing links to its source document and page.
4. Only the client's Owner signs. We never sign or submit for the client.
5. Suppliers: email only, never phone. Reminders day 5, 9, 14, then weekly.
6. English only. Card payments only at launch.
7. Secrets only in env settings. Verify every webhook signature.
8. Log every view, change, approval, signature and payment in `events`.

## Way of work
- main = live, staging branch = test copy. One PR per task, tests must pass.
- Weekly milestone; demo on staging every Friday for Bugra.
- Seed data = the v2 sample clients (Alpenhaus Textil, Kettle & Co, Brightleaf Home,
  Zhejiang Weave, Bursa Iplik, Hanoi Trims…).
- Use sub-agents for: database + RLS, UI screens, AI check prompts + eval set, emails, Stripe.
- Keep an AI-check eval set (20+ real-looking documents with expected results).
  Run it on every prompt change; report pass rate in the PR.
- Write short, simple English in all UI text (readers are B1–B2).

## Repo map
- `docs/00-Build-Plan.md` — the full build plan (modules, tables, jobs, roles, decisions). Read it first.
- `docs/phases/` — the weekly phase docs Bugra pastes in (01-Phase-1-Foundation.md …).
- `docs/handoffs/` — the Friday hand-off note for each phase (`phase-N.md`). The next phase starts from it.
- `src/app/` — Next.js routes. Brand tokens live in `src/app/globals.css`.
- `docs/integrations.md` — which services are connected, project ids, DNS records.
- `.env.example` — every env var name, no values. Real values only in Vercel / Supabase settings.

## Commands
- `pnpm dev` · `pnpm build` · `pnpm lint`
