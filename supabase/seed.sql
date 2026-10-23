-- Secuabase Phase 1 seed (pure SQL fallback for scripts/seed.ts).
-- Run on STAGING only, e.g. with the Supabase SQL editor or execute_sql.
-- Idempotent: safe to run again. Creates the 6 seed users with the password
-- Secuabase-Seed-2026!, the 12 sample clients and the memberships.
-- Fixed UUIDs keep re-runs stable. Never run this on live.

-- 1. Auth users --------------------------------------------------------------

with seed_users (id, email, full_name) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'hello@secuabase.com',  'Bugra Buyukduykular'),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'anna@alpenhaus.de',    'Anna Weber'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'editor@alpenhaus.de',  'Jonas Keller'),
    ('00000000-0000-4000-8000-000000000004'::uuid, 'viewer@alpenhaus.de',  'Mira Hoffmann'),
    ('00000000-0000-4000-8000-000000000005'::uuid, 'billing@alpenhaus.de', 'Lukas Braun'),
    ('00000000-0000-4000-8000-000000000006'::uuid, 'owner@kettle.co',      'Sam Kettle')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  s.id,
  'authenticated',
  'authenticated',
  s.email,
  extensions.crypt('Secuabase-Seed-2026!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', s.full_name),
  now(),
  now(),
  '', '', '', '', '', '', '', '',
  false,
  false
from seed_users s
where not exists (select 1 from auth.users u where u.email = s.email);

-- Email identities. For the email provider GoTrue uses the user id as provider_id.
insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  now(), now(), now()
from auth.users u
where u.email in (
  'hello@secuabase.com', 'anna@alpenhaus.de', 'editor@alpenhaus.de',
  'viewer@alpenhaus.de', 'billing@alpenhaus.de', 'owner@kettle.co'
)
and not exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
);

-- 2. Profiles (rows exist via the auth.users trigger; fill gaps and set admin)

insert into public.profiles (id, email, full_name)
select u.id, u.email, u.raw_user_meta_data ->> 'full_name'
from auth.users u
where u.email in (
  'hello@secuabase.com', 'anna@alpenhaus.de', 'editor@alpenhaus.de',
  'viewer@alpenhaus.de', 'billing@alpenhaus.de', 'owner@kettle.co'
)
on conflict (id) do nothing;

update public.profiles p
set full_name = u.raw_user_meta_data ->> 'full_name'
from auth.users u
where u.id = p.id and p.full_name is null and u.raw_user_meta_data ->> 'full_name' is not null;

update public.profiles set is_admin = true
where email = 'hello@secuabase.com' and is_admin = false;

-- 3. Plans (same rows as migration 0004, kept here so the seed stands alone)

insert into public.plans (id, name, setup_fee_cents, monthly_cents, currency, product_limit, rule_limit, member_limit, pilot_days, sort)
values
  ('free_pilot', 'Free pilot',  0,         0,       'EUR', 5,    1,    null, 30,   1),
  ('founding',   'Founding',    50000,     150000,  'EUR', null, null, null, null, 2),
  ('starter',    'Starter',     750000,    350000,  'EUR', 150,  null, null, null, 3),
  ('growth',     'Growth',      1000000,   600000,  'EUR', 500,  null, null, null, 4),
  ('scale',      'Scale',       1500000,   900000,  'EUR', null, null, null, null, 5)
on conflict (id) do update set
  name = excluded.name, setup_fee_cents = excluded.setup_fee_cents, monthly_cents = excluded.monthly_cents,
  currency = excluded.currency, product_limit = excluded.product_limit, rule_limit = excluded.rule_limit,
  member_limit = excluded.member_limit, pilot_days = excluded.pilot_days, sort = excluded.sort;

-- 4. Clients (12, upsert by slug) ---------------------------------------------

insert into public.clients (name, slug, stage, plan_id, country, currency, health, mrr_cents, pilot_ends_at, contact_name, contact_email, invited_at)
values
  ('Alpenhaus Textil', 'alpenhaus-textil', 'paid',       'growth',     'DE', 'EUR', 'on_track', 600000, null,                     'Anna Weber',     'anna@alpenhaus.de',       null),
  ('Brightleaf Home',  'brightleaf-home',  'paid',       'starter',    'US', 'USD', 'on_track', 350000, null,                     'Dana Whitfield', 'dana@brightleafhome.com', null),
  ('Kettle & Co',      'kettle-and-co',    'paid',       'starter',    'US', 'USD', 'at_risk',  350000, null,                     'Sam Kettle',     'owner@kettle.co',         null),
  ('Nordvik Outdoor',  'nordvik-outdoor',  'paid',       'starter',    'NO', 'EUR', 'on_track', 350000, null,                     'Ingrid Nordvik', 'ingrid@nordvik.no',       null),
  ('Voltwise',         'voltwise',         'paid',       'founding',   'ES', 'EUR', 'on_track', 150000, null,                     'Carlos Vega',    'carlos@voltwise.es',      null),
  ('Casa Lino',        'casa-lino',        'paid',       'founding',   'IT', 'EUR', 'on_track', 150000, null,                     'Giulia Ferri',   'giulia@casalino.it',      null),
  ('Fjell Gear',       'fjell-gear',       'pilot',      'free_pilot', 'SE', 'EUR', 'blocked',  0,      now() + interval '12 days', 'Erik Lund',     'erik@fjellgear.se',       null),
  ('Pinebrook Kids',   'pinebrook-kids',   'pilot',      'free_pilot', 'UK', 'EUR', 'on_track', 0,      now() + interval '21 days', 'Holly Pine',    'holly@pinebrookkids.co.uk', null),
  ('Rikka Kitchen',    'rikka-kitchen',    'pilot',      'free_pilot', 'FI', 'EUR', 'on_track', 0,      now() + interval '26 days', 'Riikka Salo',   'riikka@rikkakitchen.fi',  null),
  ('Lumo Kids',        'lumo-kids',        'onboarding', 'founding',   'NL', 'EUR', 'at_risk',  0,      null,                     'Noor de Vries',  'noor@lumokids.nl',        null),
  ('Bergwald Sport',   'bergwald-sport',   'invited',    'free_pilot', 'AT', 'EUR', 'on_track', 0,      null,                     'Felix Berger',   'felix@bergwaldsport.at',  now() - interval '2 days'),
  ('Maison Flore',     'maison-flore',     'invited',    'starter',    'FR', 'EUR', 'on_track', 0,      null,                     'Claire Flore',   'claire@maisonflore.fr',   now() - interval '1 day')
on conflict (slug) do update set
  name          = excluded.name,
  stage         = excluded.stage,
  plan_id       = excluded.plan_id,
  country       = excluded.country,
  currency      = excluded.currency,
  health        = excluded.health,
  mrr_cents     = excluded.mrr_cents,
  contact_name  = excluded.contact_name,
  contact_email = excluded.contact_email,
  -- keep existing dates on re-run so they do not drift
  pilot_ends_at = coalesce(public.clients.pilot_ends_at, excluded.pilot_ends_at),
  invited_at    = coalesce(public.clients.invited_at, excluded.invited_at),
  deleted_at    = null;

-- 5. Memberships ------------------------------------------------------------

with wanted (client_slug, email, role) as (
  values
    ('alpenhaus-textil', 'anna@alpenhaus.de',    'owner'),
    ('alpenhaus-textil', 'editor@alpenhaus.de',  'editor'),
    ('alpenhaus-textil', 'viewer@alpenhaus.de',  'viewer'),
    ('alpenhaus-textil', 'billing@alpenhaus.de', 'billing'),
    ('kettle-and-co',    'owner@kettle.co',      'owner')
)
insert into public.client_members (client_id, user_id, role, status, invited_email)
select c.id, p.id, w.role::public.member_role, 'active', w.email
from wanted w
join public.clients c on c.slug = w.client_slug
join public.profiles p on p.email = w.email
on conflict (client_id, user_id) do update set
  role   = excluded.role,
  status = 'active';

-- 6. Summary ----------------------------------------------------------------

select
  (select count(*) from auth.users where email in ('hello@secuabase.com','anna@alpenhaus.de','editor@alpenhaus.de','viewer@alpenhaus.de','billing@alpenhaus.de','owner@kettle.co')) as users,
  (select count(*) from public.profiles where is_admin) as admins,
  (select count(*) from public.plans) as plans,
  (select count(*) from public.clients) as clients,
  (select count(*) from public.client_members where status = 'active') as members;
