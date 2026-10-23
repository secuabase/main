# Secuabase Build — Phase 7: Payments + dashboards

Oct 23, 2026 · Bugra

Phase 7 adds payment links and billing with Stripe, makes every dashboard number live, and ships the AI assistant. Week Dec 7–11, Friday demo on staging Dec 11, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 6 hand-off first. Build every page from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

**Blocker check:** live payments need the company that owns Stripe. Until Bugra sets it up, build and test in Stripe test mode.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Admin · New payment link | Client, send to, length, amount, setup fee, start date, quick amounts, plan name, link valid 7/14/30 days, auto-renew, summary, recent links. **Remove the SEPA option** |
| Client · Payment page (from link) | Card only (remove SEPA tab), agreement tick box, success state |
| Phone · Payment page | Card only (remove "pay with SEPA") |
| Client · Billing | Plan, usage vs limits, card on file, invoices. Remove "SEPA direct debit also possible" |
| Admin · Billing (new, no frame) | All payments, payment links, failed charges, invoices, MRR history. Same style as Admin · Clients |
| Admin · Overview, Clients, Client profile, Client · Home, Phone · Client home | All numbers and charts from real data |
| Client · AI assistant | Thread list, chat, numbered sources, product chips, suggested questions |

## Backend work

1. **Payment links:** admin form → Stripe Checkout session (setup fee + subscription for the length, auto-renew on/off) on pay.secuabase.com. Link expiry 7/14/30 days.
2. **Stripe webhooks:** paid → stage paid, portal opens, receipt + login email, Slack "paid". Failed / past due → Slack + client banner.
3. **Stripe Tax + invoices:** VAT ID on the client, reverse charge for EU B2B, invoice numbers SB-YYYY-NNNN, invoices listed in Client · Billing.
4. **Pilot end + membership end** jobs: day 23 Slack "ends in 7 days"; day 30 read-only + "continue" banner; paid again → full access.
5. **Offboarding** job: read-only, export ZIP; day 30 delete files and data, keep only the deletion record in `events`.
6. **Dashboards:** SQL views for MRR by plan, pilots, pilot → paid %, AI pass rate, supplier replies per day, docs to review, proof % per rule, products by status. Refresh every 15 min.
7. **AI assistant:** chunk + embed the client's products, approved documents and rule texts (pgvector). Answer with Claude, only from that client's data, with numbered sources. Read only, never changes data. Log tokens per client.

## Database in this phase

`payment_links`, `subscriptions`, `invoices`, `assistant_threads`, `assistant_messages`, `chunks`.

## Done when

- [ ] Bugra makes a 3-month Growth link for Bergwald; test card payment opens the portal and Slack says "paid"
- [ ] Invoice shows VAT / reverse charge correctly for an Austrian VAT ID
- [ ] A failed card shows the banner and alerts Slack
- [ ] A pilot past day 30 is read-only; paying the link reopens it
- [ ] Every dashboard number matches a manual SQL count
- [ ] The assistant answers "Does the June 2026 SVHC update affect our towels?" with sources, and never shows another client's data (test)
- [ ] All frames match Figma; SEPA removed everywhere

## Out of scope

SEPA, ACH, bank transfer. Assistant actions or drafts.

## Hand-off

PR note: Stripe test results, what moved, env vars for live Stripe, staging link.
