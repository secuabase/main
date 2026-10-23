# Secuabase Platform

One Next.js app for three portals: admin, client (app.secuabase.com), supplier (supplier.secuabase.com), plus payment links (pay.secuabase.com).

- Build plan: [docs/00-Build-Plan.md](docs/00-Build-Plan.md)
- Rules for Claude Code: [CLAUDE.md](CLAUDE.md)
- Weekly phase docs: [docs/phases/](docs/phases/) · Friday hand-offs: [docs/handoffs/](docs/handoffs/)

## Branches
- `main` = live · `staging` = test copy. One PR per task.

## Run locally
```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm dev
```
