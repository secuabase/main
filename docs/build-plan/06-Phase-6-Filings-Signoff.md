# Secuabase Build — Phase 6: Filings + sign-off

Oct 23, 2026 · Bugra

Phase 6 turns approved evidence into a filing package the client's Owner signs and then submits themselves. Week Nov 30–Dec 4, Friday demo on staging Dec 4, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 5 hand-off first. Build every page from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Client · Filings & sign-off | Status pills, filing cards, detail panel ("what is in this file"), signature box, Sign and file, Preview PDF, Download all. Letter template in English only |
| Phone · Sign with finger | Phone sign-off |
| Client · Home | Upcoming filings table + "Sign the bedding file" to-do now use real data |

## Backend work

1. Filing = one rule + a group of products + due date. Bugra creates it in admin (client profile → Filings tab); later the app can suggest groups.
2. Status flow: waiting on suppliers → building → ready to sign → signed → filed. Proof % = products with approved evidence ÷ products in the filing.
3. "Ready to sign" only after Bugra marks the filing reviewed (logs reviewer + date).
4. Build outputs (Playwright PDF in a worker):
    1. **Signed PDF** — summary, product table, a source for every fact (document, page, quote), rule version, left-out products with reason, signature page with audit data.
    2. **ZIP** of every supplier document, named `<supplier>_<SKU>_<doc type>.pdf`.
    3. **Excel/CSV export** in the columns each rule needs (e.g. Minnesota PFAS reporting, packaging data).
    4. **Customer letter templates** (English), e.g. reply to a REACH Art. 33 request.
5. Sign-off reuses the Phase 2 e-sign: Owner only, signature + typed name + tick box "I confirm this file is correct to the best of my knowledge". File hash stored.
6. After signing, the client submits to the authority themselves. They upload the receipt → status Filed. We never submit.
7. Slack: "Brightleaf Home signed the SB 54 file."

## Database in this phase

`filings`, `filing_products`, `filing_outputs`. Storage bucket `filing-outputs` (private, 10-minute signed links).

## Done when

- [ ] Bugra builds the "Bedding collection · REACH SVHC · 112 products" filing from seed data
- [ ] Every fact in the PDF links to its source document and page
- [ ] ZIP, Excel/CSV and letter template download and open correctly
- [ ] Anna signs on desktop and on phone; Editor can't sign
- [ ] Receipt upload sets status Filed and shows on the timeline
- [ ] Changing an approved document after signing marks the filing "needs re-sign"
- [ ] All frames match Figma

## Out of scope

Submitting to authorities for the client (never). Auto-grouping products into filings (later).

## Hand-off

PR note: what is done, what moved, sample outputs attached, staging link.
