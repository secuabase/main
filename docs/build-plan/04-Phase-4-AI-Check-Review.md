# Secuabase Build — Phase 4: AI check + review

Oct 23, 2026 · Bugra

Phase 4 makes Claude check every supplier document and gives Bugra a review queue to approve, ask again or reject. Week Nov 16–20, Friday demo on staging Nov 20, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 3 hand-off first. Build every page from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Admin · Review queue | KPI cards, document list with flag counts, document preview, AI checks list, note to supplier, Approve / Ask supplier again / Reject, keys A, R, ↓, "Approve all clean" |

## Backend work

1. Job queue: every new document starts an AI check job (retries, timeout, error to Sentry).
2. Claude (Sonnet) reads the PDF or photo directly. Opus for documents Sonnet marks "unsure". Structured output (JSON schema).
3. Pull facts: signer, role, date, company, SKUs listed, law + list version, threshold, substances named, test values + units, lab name.
4. Run 4 check groups, each pass / flag / fail with the quote and page it came from:
    1. Signed, dated, right company
    2. Covers all requested SKUs
    3. Right law version + threshold (from the rule library's current version)
    4. Risk words + numbers vs. limits (e.g. "fluorinated finish", values over the limit)
5. Review queue: Approve → product statuses update; Ask again → email to supplier with Bugra's note + same link; Reject → email with reason. Every decision logs to `events`.
6. Never auto-approve. "Approve all clean" only approves documents with zero flags, after one confirm click.
7. Eval set: 20+ realistic documents (clean, old ECHA list, missing SKUs, unsigned, PFAS words, value over limit, blurry photo) with expected results. Script prints pass rate; CI runs it on every prompt change.
8. Cost log: tokens and $ per check, saved per client (for cost-per-client numbers).
9. Slack alert: "9 new docs from Zhejiang Weave for Alpenhaus. 2 flagged."

## Database in this phase

`ai_checks`, `reviews`, `jobs`. Columns on `documents`: file hash, page count, extracted facts (JSON), check status.

## Done when

- [ ] A supplier upload is checked in under 2 minutes and shows in the queue
- [ ] Every check shows its quote and page; clicking it jumps to that page in the preview
- [ ] Eval set pass rate ≥ 90% on the expected flags; the report is in the PR
- [ ] Approve updates the product statuses on the client side
- [ ] Ask again sends the email with the note; the supplier sees the request reopened
- [ ] Keys A, R and ↓ work
- [ ] Cost per check is logged
- [ ] The frame matches Figma

## Out of scope

Filing builder (Phase 6). Inbound email attachments (Phase 5 feeds them into this same check).

## Hand-off

PR note: eval pass rate, average cost per check, what moved, staging link.
