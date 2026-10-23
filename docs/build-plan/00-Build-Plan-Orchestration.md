# Secuabase Platform — Claude Code Build Plan v1

Oct 23, 2026 · Bugra

## Summary

Claude Code builds all 3 portals (admin, client, supplier) on Supabase + Next.js, live for the first real client in 8 weeks. The source design is the Secuabase Platform Figma file (made from the Secuabase Platform v2 canvas: 24 screens, desktop and phone).

- **One codebase, three addresses:** app.secuabase.com (admin + client), supplier.secuabase.com (no login), pay.secuabase.com (payment links).
- **All data in the EU** (Frankfurt). English only at launch.
- **The core loop:** client adds products by CSV → app emails suppliers → supplier uploads or fills a form → Claude checks the document → Bugra approves → app builds the filing → client signs and files it themselves.
- **Money:** Bugra makes a payment link; card payment by Stripe opens the portal. Stripe sends invoices with VAT.
- **Budget:** $100–$250 per month for tools, plus Claude API usage.

## How to use this doc

This doc starts the **orchestration chat**: the one Claude Code session that runs the whole build. Each week, Bugra pastes one phase doc into that same chat.

1. **Day 1:** open a new Claude Code session, paste this Build Plan, and ask it to set up the repo and `CLAUDE.md` (section "Instructions for Claude Code"). This chat is now the orchestrator.
2. **Design:** Bugra gives the **Secuabase Platform Figma file** (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with every page ready, desktop and phone. Claude Code builds each page from its Figma frame with the Figma MCP. No layouts are invented.
3. **Each Monday:** paste that week's phase doc into the orchestration chat. The orchestrator plans the tasks, gives parts to sub-agents, and checks "Done when".
4. **Each Friday:** Bugra tests the demo on staging. The orchestrator writes a hand-off note; the next phase starts from it.

| Phase | Week | Doc |
| --- | --- | --- |
| 1 | Oct 26–30 | 01-Phase-1-Foundation.md |
| 2 | Nov 2–6 | 02-Phase-2-Admin-Onboarding.md |
| 3 | Nov 9–13 | 03-Phase-3-Products-Suppliers.md |
| 4 | Nov 16–20 | 04-Phase-4-AI-Check-Review.md |
| 5 | Nov 23–27 | 05-Phase-5-Emails-Alerts.md |
| 6 | Nov 30–Dec 4 | 06-Phase-6-Filings-Signoff.md |
| 7 | Dec 7–11 | 07-Phase-7-Payments-Dashboards.md |
| 8 | Dec 14–18 | 08-Phase-8-Polish-Go-Live.md |

## Decisions (Oct 23, 2026)

35 decisions from today's questions.

| Topic | Decision |
| --- | --- |
| Stack | Supabase (database, login, files, jobs) + Next.js on Vercel |
| Data region | EU only, Frankfurt |
| Build order | All 3 portals together |
| First real client | In 8 weeks (by Dec 18, 2026) |
| Payment flow | Payment link only. Remove the card step from onboarding |
| Pay methods | Card only (Stripe) at launch |
| E-sign | Built-in signature + audit trail + signed PDF |
| Invoices | Stripe invoices + Stripe Tax |
| Legal entity | Not set up yet. Code works with any Stripe account |
| Free pilot | 5 products, 1 rule, 30 days |
| Languages | English only everywhere |
| Late suppliers | Never call. Email only |
| Email tool | Resend |
| Supplier email replies | App reads replies and attachments |
| Reminders | Day 5, 9, 14, then weekly. Late = day 14 |
| Shared suppliers | One request per client. Data fully separate |
| Document reading | Claude reads PDFs and photos directly |
| AI checks | Signed/dated/company · all SKUs covered · law version + threshold · risk words + numbers |
| Auto-approve | Never. Bugra approves every document |
| Rule library | Seeded by hand, weekly job watches official sources |
| Product import | CSV / Excel upload only |
| AI assistant | Answers with sources only. Never changes data |
| Filing output | Signed PDF + ZIP of supplier docs + Excel/CSV export + letter templates |
| Submitting to authorities | Client submits. App marks "filed" when they upload the receipt |
| Admin alerts | Slack #secuabase-ops |
| Background jobs | Inside the app: Supabase cron + queue |
| Client roles | Owner, Editor, Viewer, Billing |
| Security | 2-step login for admin + full audit log |
| Domains | app. / supplier. / pay.secuabase.com |
| Tool budget | $100–$250 per month |
| Missing admin pages | Claude Code designs Suppliers + Billing in the same style |
| Way of work | GitHub repo, staging + live, weekly milestone, Bugra tests every Friday |
| Pilot end | Portal goes read-only, Slack alert to Bugra |
| Client leaves | Read-only 30 days, export ZIP, then delete |
| Demo data | The v2 sample clients (Alpenhaus, Kettle & Co, Zhejiang Weave…) |

## Tech stack and apps

Nine paid tools cover every function, about $120–$200 per month before Claude API usage. Prices are approximate (not checked today); confirm at sign-up.

| Job | App | Plan | Approx. cost / month |
| --- | --- | --- | --- |
| Database, login, file storage, cron, queue, vector search | Supabase (EU Frankfurt) | Pro | $25 + usage |
| Web app hosting, 3 domains | Vercel | Pro | $20 |
| Code + reviews | GitHub | Free / Team | $0–$4 |
| Emails out + replies in | Resend (EU region) | Pro | $20 |
| Card payments, payment links, invoices, VAT | Stripe + Stripe Tax | Pay per use | ~1.5–2.9% + 0.5% tax fee |
| Document reading, checks, assistant | Claude API (Sonnet for checks, Haiku for small jobs, Opus for hard cases) | Pay per use | ~$20–$150 at 5–20 clients |
| Search embeddings for the assistant | Voyage AI or OpenAI embeddings | Pay per use | <$5 |
| PDF building (filing, signed agreement, supplier form PDF) | Playwright (Chromium) in a worker | Free | $0 |
| Virus scan on uploads | ClamAV in a small container (optional, later) | Free | $0–$5 |
| Alerts | Slack incoming webhook | Free | $0 |
| Errors | Sentry | Developer / Team | $0–$26 |
| Product analytics | PostHog (EU cloud) | Free tier | $0 |

**Code tools Claude Code uses:** TypeScript, Next.js App Router, Tailwind with the Secuabase v3 tokens (Poppins, Persian blue #2634B9, Midnight #1B207C, Orange #F76A2B, Emerald #0B7A5B), shadcn/ui, Zod, Drizzle or Supabase client, Vitest + Playwright tests, React Email for templates.

## The 16 modules

Every button and number in the design maps to one of these modules. Screens are the v2 artboard / Figma frame names.

| # | Module | What the backend does | Screens | Apps |
| --- | --- | --- | --- | --- |
| 1 | Login and accounts | Password, magic link, 6-digit code (15 min, one use), "remember this device", 2-step code for admin, roles | Login, Check email | Supabase Auth |
| 2 | Clients and stages | Stages: invited → onboarding → pilot → paid → paused → leaving. Plan, limits, rules, health (on track / at risk / blocked), MRR per client | Admin Overview, Clients, Client profile | Supabase |
| 3 | Invites | Admin sets company, contact, plan, rules, personal note → email with a 7-day login link. Tracks opened / started | Admin New client invite, Emails | Resend |
| 4 | Payment links and billing | Admin sets amount, setup fee, membership length, start date, auto-renew, link valid for 7/14/30 days → Stripe Checkout link. On payment: portal opens, login email, Slack alert. Invoices, VAT ID, card on file, renewals, failed payments | Admin New payment link, Pay page, Pay phone, Client Billing | Stripe, Stripe Tax |
| 5 | E-sign | Agreement and filing sign-off. Finger or mouse signature, typed name, tick box, time, IP, browser, SHA-256 of the PDF → signed PDF with an audit page. Only Owner signs | Onboarding, Filings, Sign phone | Built-in + Playwright PDF |
| 6 | Products | CSV / Excel upload with a template, AI matches columns, duplicate check. Each SKU links to suppliers and rules. Status per SKU per rule: Verified / In review / Needs evidence / Missing. Plan limits enforced | Client Products | Supabase, Claude (column match) |
| 7 | Rule library | Each rule: name, markets, what it asks for, source links, current version (e.g. ECHA list Jun 2026, 236 substances), thresholds, risk words. Seeded with the 12 rules from the proposal list. Weekly watch job flags source changes to Bugra | Products side panel, Client profile Rules | Supabase, Claude, web fetch |
| 8 | Supplier requests and chase | One request per supplier per client: list of documents + products + due date. Secure link (no account). Upload or photo (PDF/JPG/PNG, 20 MB) or online form → signed PDF. Reminders day 5, 9, 14, then weekly. Bounced email → client to-do "add a contact". Late = day 14 | Supplier Requests, Declaration form, Supplier phone, Client Suppliers, Emails | Resend, Supabase Storage |
| 9 | Email replies in | Each request has its own reply address. Attachments → AI check. Text → Bugra's queue | (new, admin side) | Resend inbound webhook |
| 10 | AI document check | Claude reads the file, pulls facts (signer, date, company, SKUs, list version, threshold, substances, test values), runs the 4 check groups, gives each check pass / flag / fail with the quote and page it came from | Admin Review queue | Claude API |
| 11 | Review queue | Approve / ask supplier again (with note) / reject. "Approve all clean". Keys A, R, ↓. Every approval writes the audit log. Nothing reaches the client before approval | Admin Review queue | Supabase |
| 12 | Filing builder | Groups products into a filing (e.g. "Bedding collection · REACH SVHC · 112 products"). Builds: signed PDF (summary, product table, a source for every fact), ZIP of supplier docs, Excel/CSV export, letter templates. Status: waiting → building → ready to sign → signed → filed | Client Filings, Sign phone | Playwright PDF, Supabase Storage |
| 13 | AI assistant | Answers from the client's own products, approved docs and rule texts only. Every answer lists numbered sources. Suggested questions. Never changes data | Client AI assistant, Client Home card | Claude API, pgvector |
| 14 | Dashboards | Admin: MRR by plan, pilots, pilot → paid %, AI pass rate gauge, supplier replies per day, docs to review, client health table. Client: proof-ready gauge per rule, replies, products by status, to-do, upcoming filings | Admin Overview, Clients, Client Home | Supabase SQL views |
| 15 | Alerts and reports | Supplier emails, client Friday report, Slack alerts with on/off rules (new docs, signed/paid, supplier late, Friday copy) | Emails & Slack alerts | Resend, Slack webhook |
| 16 | Audit log, search, export | Who saw, changed, approved or signed what and when. Search clients, SKUs, suppliers. CSV export. PWA install, light + dark mode, phone bottom nav | All | Supabase, Next.js |

**Two pages with no design yet** (Claude Code designs them in the v3 style): Admin Suppliers = every supplier across clients, late list, bounced emails, reply speed. Admin Billing = all payments, payment links, failed charges, invoices, MRR history.

## Database tables

35 tables in Postgres. Every client-owned row carries `client_id`, and row-level security keeps each client's data apart.

| Area | Tables | Key fields |
| --- | --- | --- |
| People | `profiles`, `client_members`, `admin_settings` | role (owner / editor / viewer / billing), 2FA flag |
| Clients | `clients`, `plans`, `client_rules` | stage, plan, limits (SKUs, rules, members), pilot end date, health, currency, country, VAT ID |
| Money | `payment_links`, `subscriptions`, `invoices` | Stripe ids, amount, setup fee, length, auto-renew, link expiry, status |
| Signing | `agreements`, `signatures` | PDF hash, signer, typed name, time, IP, user agent, signed PDF path |
| Products | `products`, `product_suppliers`, `product_rule_status`, `imports` | SKU, name, status per rule, source doc ids |
| Rules | `rules`, `rule_versions`, `rule_sources` | markets, what it asks for, threshold, risk words, version date, source URL, last checked |
| Suppliers | `suppliers`, `supplier_contacts`, `requests`, `request_items` | email, bounce flag, secure token (hashed), due date, reminder step, documents asked |
| Documents | `documents`, `ai_checks`, `reviews` | file path, file hash, extracted facts (JSON), each check with quote + page, decision, note to supplier |
| Filings | `filings`, `filing_products`, `filing_outputs` | rule, products, proof %, due date, status, PDF / ZIP / CSV paths, filed receipt |
| Assistant | `assistant_threads`, `assistant_messages`, `chunks` | question, answer, source ids, embedding vector |
| System | `events` (audit log), `notifications`, `jobs`, `email_log` | actor, action, object, before/after, time |

File storage buckets: `supplier-docs`, `signed-pdfs`, `filing-outputs`, `imports`. All private; files open only through short signed links.

## Key flows

The core loop has one human gate: Bugra's review. Everything else is automatic.

**Core loop (one supplier document at a time)**

1. Add products — Client · CSV upload
2. Request documents — App · Resend email (no reply → reminders day 5, 9, 14)
3. Send documents — Supplier · upload or form
4. AI check — Claude · 4 checks, flags shown
5. Review — Bugra · approve (or "ask again" → back to step 3)
6. Build filing — App · PDF, ZIP, CSV
7. Sign — Owner · e-sign
8. Submit filing — Client · uploads receipt

If a supplier does not reply, reminders go out on day 5, 9 and 14; if Bugra asks again or rejects, the supplier gets a note and a fresh link.

**Invite to paid**

1. Bugra creates the client in admin: company, contact, plan, rules, note.
2. Invite email with a 7-day login link. Client logs in, adds company and team.
3. Client signs the agreement (built-in e-sign). Pilot clients start here.
4. Bugra creates a payment link (amount, setup fee, length, auto-renew). Client pays by card.
5. Stripe webhook: portal opens, receipt + login email, Slack "paid".
6. Client uploads the product CSV and supplier contacts. The core loop starts.

**Pilot end**

1. Day 23: Slack alert "pilot ends in 7 days".
2. Day 30: portal goes read-only. Client sees results and a "continue" banner.
3. Bugra sends a payment link. Paid → full access again.

**Client leaves**

1. Membership ends or Bugra pauses the client: portal read-only, export ZIP ready.
2. Day 30: files and data deleted. The audit log keeps only the deletion record.

## Background jobs

Ten jobs run inside the app (Supabase cron + a job queue with retries). Times are Europe/Istanbul unless the client's own time zone is better.

| Job | When | What it does |
| --- | --- | --- |
| AI document check | On every new upload or email attachment | Claude check → review queue → Slack "new docs" |
| Supplier reminders | Every day 09:00, supplier's time zone | Day 5, 9, 14, then weekly. Day 14 → status Late + Slack |
| Bounce handler | On Resend bounce webhook | Supplier contact flagged, client to-do "add a contact" |
| Email reply reader | On Resend inbound webhook | Matches the request, files attachments, queues text for Bugra |
| Stripe sync | On Stripe webhook | Paid → portal opens + login email + Slack. Failed → alert + client banner |
| Pilot and membership end | Every day 08:00 | Pilot day 30 → read-only + Slack. Ending soon → alert 7 days before |
| Offboarding | Every day 03:00 | Day 0 read-only, export ZIP ready; day 30 delete files and data |
| Friday client report | Fridays 10:00, client's time zone | Email: proof %, replies, open gaps, to-do. Copy to Bugra |
| Rule watch | Mondays 07:00 | Fetch source pages (ECHA, EUR-Lex, state sites), compare, Slack if changed |
| Dashboard numbers | Every 15 min | Refresh MRR, pass rate, proof % views |

## Security and roles

Only Bugra is admin; clients see only their own company; suppliers see only their own request.

| Action | Admin | Owner | Editor | Viewer | Billing | Supplier |
| --- | --- | --- | --- | --- | --- | --- |
| See products, suppliers, filings | All clients | Yes | Yes | Yes | No | Own request only |
| Add products, nudge suppliers | Yes | Yes | Yes | No | No | No |
| Approve / reject documents | Yes | No | No | No | No | No |
| Sign agreement and filings | No | Yes | No | No | No | Signs own form |
| Invite team members | Yes | Yes | No | No | No | No |
| See invoices, update card | Yes | Yes | No | No | Yes | No |
| Ask the assistant | Yes | Yes | Yes | Yes | No | No |
| Create payment links, set plans | Yes | No | No | No | No | No |

- **Row-level security** on every table, tested with one test per role.
- **Admin 2-step login** (authenticator app). Admin pages also need a recent login.
- **Supplier links:** random token, stored hashed, one supplier + one client, expires 30 days after the due date, can be revoked.
- **Full audit log:** every view of a document, every change, approval, signature and payment.
- **Files:** private buckets, signed links that expire in 10 minutes, type and size checks.
- **Secrets** only in Vercel and Supabase settings, never in code. Stripe and Resend webhooks verified by signature.
- **GDPR:** EU hosting, a data processing agreement with each client, delete on offboarding.

## 8-week plan

Eight one-week milestones, each ending with a Friday demo on staging; the first real client goes live on Dec 18.

| Week | Dates | Milestone |
| --- | --- | --- |
| W1 | Oct 26–30 | Foundation |
| W2 | Nov 2–6 | Admin + onboarding |
| W3 | Nov 9–13 | Products + suppliers |
| W4 | Nov 16–20 | AI check + review |
| W5 | Nov 23–27 | Emails + alerts |
| W6 | Nov 30–Dec 4 | Filings + sign-off |
| W7 | Dec 7–11 | Payments + dashboards |
| W8 | Dec 14–18 | Polish + safety |
| Live | Dec 18 | First real client |

What each week delivers (Bugra tests it on Friday):

1. **Foundation** — GitHub repo, Supabase EU project, Vercel with staging + live, 3 domains, DNS for email (SPF, DKIM, DMARC), design tokens, app shell for 3 portals, login (password, magic link, 6-digit code), admin 2-step, roles, row-level security, audit log, seed data.
2. **Admin + onboarding** — Admin overview, clients list with stages, client profile, invite flow + email, client onboarding (company, team, agreement), built-in e-sign with signed PDF.
3. **Products + suppliers** — CSV/Excel import with AI column match, products & rules page, rule library seeded with 12 rules, supplier list, request builder, supplier portal (upload, photo, online form → signed PDF).
4. **AI check + review** — Claude document check with 4 check groups, quotes + page numbers, review queue (approve / ask again / reject, keys), eval set of 20+ documents with a pass-rate report.
5. **Emails + alerts** — Reminders day 5/9/14/weekly, inbound replies + attachments, bounces → client to-do, Slack alerts with rules, Friday client report, admin Suppliers page.
6. **Filings + sign-off** — Filing builder (PDF with sources, ZIP, Excel/CSV, letter templates), client filings page, Owner sign-off on desktop and phone, receipt upload → "filed".
7. **Payments + dashboards** — Payment links, Stripe Checkout (card), webhooks, invoices + Stripe Tax, client billing, admin Billing page, all dashboard numbers live, AI assistant with sources, pilot end + offboarding jobs.
8. **Polish + safety** — Phone views + PWA, dark mode, empty and error states, security review (RLS tests per role), backups check, full dry run with the v2 sample clients, go-live checklist.

## Design changes and open questions

Seven screens change to match today's decisions; make these changes in Figma or during the build.

| Screen | Change |
| --- | --- |
| Onboarding | Remove the Payment step. Steps become: company + team → sign agreement → set up products |
| Admin New client invite | Free pilot card says "5 products · 1 rule · 30 days" (not 20 SKUs). Email footer: "Then: agreement → payment link → setup" |
| Login | Remove "8 languages" stat |
| Client Filings | Letter template in English only (remove DE) |
| Pay page, Pay phone | Card only. Remove SEPA tab and "pay with SEPA" |
| Client Billing | Remove "SEPA direct debit also possible" |
| Emails, Client Suppliers | Replace "After that, we call" with "Reminders on day 5, 9 and 14, then weekly" |

**Open questions** (they don't block the start):

- [ ] Which company owns Stripe and sends invoices? Needed by week 5 for live payments.
- [ ] Lawyer text for the service agreement, DPA and filing sign-off wording ([LEGAL TEXT FROM LAWYER]).
- [ ] Errors-and-omissions insurance before the first paid client.
- [ ] Plan limits for Starter, Growth, Scale (SKUs, rules, team members): design shows 150 / 500 / custom SKUs — confirm.
- [ ] Sending address for suppliers: requests@secuabase.com or one per client? DNS (SPF, DKIM, DMARC) must be set in week 1.

## Instructions for Claude Code

Paste this block into `CLAUDE.md` at the root of the repo. The main Claude Code session is the orchestrator; it plans each week and hands parts to sub-agents.

```markdown
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
```
