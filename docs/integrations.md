# Integrations status

Updated Oct 23, 2026. No secrets here. Keys live only in Vercel / Supabase settings.

| Service | Status | Details |
| --- | --- | --- |
| GitHub | Ready | https://github.com/secuabase/main — branches `main` (live) and `staging` (test). |
| Supabase | Staging ready | Project `secuabase-staging`, ref `ivezobdhppfrrxwojsap`, eu-central-1 (Frankfurt), URL https://ivezobdhppfrrxwojsap.supabase.co. Live project: create before go-live. The old project in Tokyo (`osqndtpucmsrwgvnihez`) is not used. |
| Vercel | Hobby (free), project not made yet | Account hello@secuabase.com, team `team_pINlkCgSX6uqVPNSrihUmfmu`. Bugra imports `secuabase/main` at vercel.com/new. Move to Pro before the first paid client (Hobby = non-commercial use). |
| Resend | Sending verified, inbound MX verified (DKIM finishing) | `secuabase.com` (sending, verified) and `reply.secuabase.com` (receive only), both us-east-1 (N. Virginia), tracking off. |
| Slack | Channel ready | `#secuabase-ops` (C0CBKP385UJ). Incoming webhook not made yet. |
| n8n | Not used | Background jobs run inside the app (Supabase cron + queue), as the plan says. |

## Resend inbound (reply.secuabase.com)

Receive only, region us-east-1. Each request gets its own address, e.g. `req-<id>@reply.secuabase.com`.

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| MX | `reply` | `receive.forge.rmta.net` | 10 |
| TXT (DKIM) | `resend._domainkey.reply` | see the Resend dashboard (long `p=MIGf…` key) | — |

Only the `reply` subdomain gets an MX record; the root domain keeps its normal mailboxes.
The app's webhook for `email.received` is added in Phase 5, when the endpoint exists.
