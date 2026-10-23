# Secuabase Build — Phase 5: Emails + alerts

Oct 23, 2026 · Bugra

Phase 5 automates the supplier chase by email, reads supplier replies, and sends Slack alerts and the Friday client report. Week Nov 23–27, Friday demo on staging Nov 27, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 4 hand-off first. Build every page and email from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Emails & Slack alerts | Supplier request, reminder, Friday weekly report (React Email templates), Slack message format, alert rules with on/off toggles |
| Admin · Suppliers (new, no frame) | Every supplier across clients: late list, bounced emails, reply speed, last activity. Design it in the same style as Admin · Clients |

## Backend work

1. **Reminders:** daily job at 09:00 in the supplier's time zone. Day 5, 9, 14, then weekly. Day 14 → status Late + Slack alert. Never a phone call. Text in emails: "Reminders on day 5, 9 and 14, then weekly".
2. **Reminder email** lists what is received and what is still open, with the same secure link.
3. **Inbound replies:** each request has its own reply-to address (Resend inbound). Attachments → `documents` → AI check (Phase 4). Text → a "supplier message" item in Bugra's queue.
4. **Bounces:** Resend bounce webhook → contact flagged → client to-do "Add a contact for <supplier>" → Slack.
5. **Nudge** buttons on Client · Suppliers and "Nudge all late" send a reminder now (max one per supplier per day).
6. **Slack alerts** with rules Bugra can switch on/off: new supplier docs, agreement signed / paid, supplier 14+ days late, Friday report copy.
7. **Friday client report:** Fridays 10:00 in the client's time zone — proof %, suppliers replied, open gaps, to-do. Copy to Bugra.
8. `email_log` for every email: sent, delivered, opened, bounced. Shown on the client timeline.
9. All webhooks verify their signature.

## Database in this phase

`email_log`. Columns on `requests`: reminder step, next reminder date, late flag. Columns on `supplier_contacts`: bounce flag. Alert rule settings in `admin_settings`.

## Done when

- [ ] With the clock moved forward in a test, reminders go out on day 5, 9, 14 and 21
- [ ] A supplier replies to the email with a PDF; it shows in the review queue with AI checks
- [ ] A bounced address creates the client to-do and a Slack alert
- [ ] "Nudge all late" sends once per supplier and logs it
- [ ] The Friday report arrives with real numbers for Alpenhaus
- [ ] Switching an alert rule off stops that Slack message
- [ ] Emails render well in Gmail, Outlook and on phone; Admin · Suppliers page matches the Clients page style

## Out of scope

Calls, WhatsApp, other languages.

## Hand-off

PR note: what is done, what moved, open questions, staging link.
