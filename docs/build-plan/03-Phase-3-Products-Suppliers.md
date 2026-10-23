# Secuabase Build — Phase 3: Products + suppliers

Oct 23, 2026 · Bugra

Phase 3 lets a client upload products, links them to rules and suppliers, and opens the supplier portal for uploads and online forms. Week Nov 9–13, Friday demo on staging Nov 13, 2026.

## Start here

Paste this doc into the orchestration chat (the Claude Code session that holds the Build Plan, `00-Build-Plan-Orchestration.md`). Read `CLAUDE.md` and the Phase 2 hand-off first. Build every page from its Figma frame (https://www.figma.com/design/HfmabsPFN5IDF7x9OmylpJ) with the Figma MCP. Work on `staging`, one PR per task.

## Figma frames in this phase

| Frame | What to build |
| --- | --- |
| Client · Products & rules | Rule tabs with counts, CSV import, search, product table, side panel with status per rule and sources. Remove the "Shopify sync" pill |
| Client · Suppliers | Status pills, KPI cards, supplier table with Nudge / View / Fix. Footer text: "Reminders on day 5, 9 and 14, then weekly" |
| Supplier · Requests | Secure-link page: progress, what we need, upload or form, drop zone |
| Supplier · Declaration form | Step-by-step questions, products covered, saved after every step |
| Phone · Supplier requests | Phone version with "take a photo" |

## Backend work

1. CSV / Excel import: template download, upload to `imports` bucket, Claude Haiku matches columns (SKU, name, supplier, material), preview, duplicate check, plan limit check (pilot = 5 products).
2. Products ↔ suppliers ↔ rules links. Status per SKU per rule: Verified / In review / Needs evidence / Missing.
3. Rule library seeded with the 12 rules from the proposal list (REACH SVHC, REACH Annex XVII, PFAS national/EU, EU PPWR/EPR, GPSR, RoHS/WEEE/Battery, EU Toy Safety, Minnesota PFAS, California PFAS, California SB 54, CPSIA/CPSC, Prop 65): markets, what it asks for, current version, threshold, risk words, source links.
4. Supplier contacts: add, edit, import with the product CSV.
5. Request builder: per supplier per client — documents asked (from the rules), products covered, due date. Creates a secure token (random, stored hashed, expires 30 days after due date, can be revoked).
6. Request email (Resend) with the secure link. No reminders yet (Phase 5).
7. Supplier portal: upload (PDF/JPG/PNG, 20 MB, type + size checks) or photo; online form with saved steps; at the end, typed name → signed form PDF. Files to `supplier-docs` bucket.
8. Client to-do list items: "confirm new products", "add a contact".

## Database in this phase

`products`, `product_suppliers`, `product_rule_status`, `imports`, `rules`, `rule_versions`, `rule_sources`, `suppliers`, `supplier_contacts`, `requests`, `request_items`, `documents` (upload record only; AI check comes in Phase 4).

## Done when

- [ ] Alpenhaus uploads a 410-row CSV; columns match; products appear with statuses
- [ ] A pilot client can't add a 6th product (clear message)
- [ ] The side panel shows each rule's source links
- [ ] Requests go out to Zhejiang Weave with the right products and documents
- [ ] The supplier opens the link with no login, uploads a PDF, and fills the PFAS form on desktop and phone
- [ ] A used or revoked link shows a friendly error
- [ ] Supplier sees only their own request (RLS test)
- [ ] All 5 frames match Figma

## Out of scope

AI check, review queue (Phase 4). Reminders, inbound email replies (Phase 5).

## Hand-off

PR note: what is done, what moved, open questions, staging link.
