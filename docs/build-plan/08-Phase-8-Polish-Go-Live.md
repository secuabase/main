# Secuabase Build — Phase 8: Polish + go live

Oct 23, 2026 · Bugra

Phase 8 finishes phone views, dark mode and empty states, runs the security review and a full dry run, and takes the first real client live. Week Dec 14–18, go-live Dec 18, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 7 hand-off first. Check every page against its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`; merge to `main` only after the go-live checklist passes.

## Figma frames in this phase

| Frame | What to finish |
| --- | --- |
| Phone · Admin overview, Client home, Sign with finger, Supplier requests, Payment page | Pixel check on 390 px width, bottom nav, touch targets ≥ 44 px |
| All 24 frames + 2 new admin pages | Dark mode, empty states, loading states, error states, keyboard use |
| Login | Remove the "8 languages" stat |

## Backend work

1. PWA: install on phone home screen, app icon, offline page.
2. Security review: RLS test per role on every table, supplier link tests, file link expiry, webhook signatures, admin 2-step, rate limits on login and supplier links.
3. Backups: confirm Supabase daily backups and a restore test on staging.
4. Performance: pages load under 2 s on 4G; big tables paginate.
5. Sentry alerts to Slack for errors; uptime check on the 3 domains.
6. Full dry run with the v2 sample clients: invite → sign → pay link (test mode) → CSV → supplier requests → uploads → AI check → review → filing → sign → filed → Friday report.
7. Real-client setup: switch Stripe to live (if the company is ready), real sender address warmed up, clear seed data from live.
8. Write `RUNBOOK.md`: how to invite, make a payment link, review, build a filing, restore a backup, rotate keys.

## Done when

- [ ] The full dry run passes end to end on staging with no manual database edits
- [ ] Every frame matches Figma on desktop and phone, light and dark
- [ ] All RLS and supplier-link tests pass in CI
- [ ] Restore test done; backups confirmed
- [ ] Lawyer text in the agreement (or Bugra accepts the placeholder for the first pilot)
- [ ] Live site clean (no seed data); first real client invited by Bugra
- [ ] `RUNBOOK.md` in the repo

## Out of scope

New features. Anything new goes to a "v1.1" list in the PR.

## Hand-off

Final PR note: what is live, known issues, v1.1 list, monthly tool cost so far, Claude API cost per client.
