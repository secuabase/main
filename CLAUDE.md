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

## This folder is the orchestrator
- `docs/build-plan/` holds the Build Plan (00) and the 8 phase docs (01–08). Bugra adds
  new step docs here before a phase starts; read the newest one at the start of each chat.
- `STATUS.md` is the single source of truth for what is already set up (infra, accounts,
  connector state) and what is flagged. Read it first in every new chat. Update it at the
  end of every chat that changes infra or finishes a "Done when" item.
- `brand-kit/` holds the v3 brand assets (logos, favicon set, colors, Poppins, email signature).
  Use `brand-kit/04-Colors/tailwind-colors.js` for the Tailwind palette and
  `brand-kit/02-App-Icon-Favicon/Favicon/` for the app's favicon set.
- Infra IDs (Supabase refs, Vercel project id, Resend domain ids) live in `STATUS.md`.
  Reuse them; never create a second project when one exists.
