# Integrations status

Updated Oct 23, 2026. No secrets here. Keys live only in Vercel / Supabase settings.

| Service | Status | Details |
| --- | --- | --- |
| GitHub | Not set up | No repo yet. Bugra creates an empty repo, then Claude pushes `main` + `staging`. |
| Supabase | Staging ready | Project `secuabase-staging`, ref `ivezobdhppfrrxwojsap`, eu-central-1 (Frankfurt), URL https://ivezobdhppfrrxwojsap.supabase.co. Live project: create before go-live. The old project in Tokyo (`osqndtpucmsrwgvnihez`) is not used. |
| Vercel | Not set up | No team and no GitHub link on the account. Needs Pro (commercial use) and the GitHub repo. |
| Resend | Domain added, DNS pending | `secuabase.com`, region **ap-northeast-1 (Tokyo)**. The plan says EU. Sending on, receiving off, tracking off. |
| Slack | Channel ready | `#secuabase-ops` (C0CBKP385UJ). Incoming webhook not made yet. |
| n8n | Not used | Background jobs run inside the app (Supabase cron + queue), as the plan says. |

## Resend DNS records (secuabase.com)

| Type | Name | Value | Status |
| --- | --- | --- | --- |
| TXT (DKIM) | `resend._domainkey` | see the Resend dashboard (long `p=MIGf…` key) | pending |
| CNAME (SPF) | `rsend` | `rsend-apne1.forge.rmta.net` | pending |
| CNAME (SPF) | `send` | `send.forge.rmta.net` | verified |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@secuabase.com` | add yourself |

Inbound replies (module 9): turn on receiving only on a subdomain such as `reply.secuabase.com`.
An MX record on the root domain would take over the normal secuabase.com mailboxes.
