# Secuabase Build — Phase 2: Admin + onboarding

Oct 23, 2026 · Bugra

Phase 2 lets Bugra create a client, send an invite, and lets the client join, add a team and sign the agreement. Week Nov 2–6, Friday demo on staging Nov 6, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 1 hand-off first. Build every page from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Admin · Overview | Layout + real numbers where data exists (clients, stages, today's work list). Charts can show seed data until Phase 7 |
| Admin · Clients | Stage filter pills with counts, KPI cards, client table, search, CSV export |
| Admin · Client profile | Badges, tabs, status timeline (from `events`), team list, billing card (placeholder until Phase 7) |
| Admin · New client invite | 3 steps: company → plan → send. Plan cards, rules to start with, personal note, email preview |
| Onboarding · Agreement & payment | Steps now: company + team → sign agreement → set up products. **Remove the payment step** |
| Phone · Admin overview | Phone version of the overview |

## Backend work

1. Client stages: invited → onboarding → pilot → paid → paused → leaving. Every change logs to `events`.
2. Invite: admin form saves client + plan + rules + note, sends the invite email (Resend, React Email, Secuabase look) with a 7-day magic link. Track sent / opened / started.
3. Free pilot card text: "5 products · 1 rule · 30 days". Invite email footer: "Then: agreement → payment link → setup".
4. Onboarding: company name, VAT ID, country, sells to; team invites with roles (Owner, Editor, Viewer, Billing).
5. Built-in e-sign: agreement PDF from a template with plan, price, rules ([LEGAL TEXT FROM LAWYER] placeholder). Signature canvas (mouse + finger), typed name, tick box. Store time, IP, browser, SHA-256 of the PDF. Make the signed PDF with an audit page (Playwright).
6. Pilot clients: after signing, stage = pilot and pilot end date = +30 days. Paid plans wait for the payment link (Phase 7).
7. Slack alerts: "opened invite", "agreement signed".

## Database in this phase

`client_rules`, `agreements`, `signatures`, `notifications`. Storage bucket `signed-pdfs` (private).

## Done when

- [ ] Bugra creates Bergwald Sport, picks Free pilot + PFAS (EU), and the invite arrives in an inbox
- [ ] Katrin opens the link, adds a teammate, signs, and lands on the client home (empty state)
- [ ] The signed PDF has the signature, name, time, IP and file hash on an audit page
- [ ] Only the Owner role can sign; Editor sees the button disabled
- [ ] Client profile timeline shows invited → signed
- [ ] Slack gets both alerts
- [ ] All 6 frames match Figma on desktop (and phone where a frame exists)

## Out of scope

Payments and payment links (Phase 7). Products and suppliers (Phase 3).

## Hand-off

PR note: what is done, what moved, open questions, staging link.
