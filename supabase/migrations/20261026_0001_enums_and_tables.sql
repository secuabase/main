-- Phase 1 schema: enums and the 6 tables.
-- Contract: docs/phase-1-spec.md, "Database contract".

-- Enums ------------------------------------------------------------------

create type public.client_stage as enum ('invited', 'onboarding', 'pilot', 'paid', 'paused', 'leaving');
create type public.client_health as enum ('on_track', 'at_risk', 'blocked');
create type public.member_role as enum ('owner', 'editor', 'viewer', 'billing');
create type public.member_status as enum ('invited', 'active', 'removed');

-- profiles ---------------------------------------------------------------
-- One row per auth user. Created by a trigger on auth.users.

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth user. is_admin marks Secuabase staff (only Bugra).';

-- plans ------------------------------------------------------------------

create table public.plans (
  id              text primary key,
  name            text,
  setup_fee_cents integer,
  monthly_cents   integer,
  currency        text default 'EUR',
  product_limit   integer,
  rule_limit      integer,
  member_limit    integer,
  pilot_days      integer,
  sort            integer
);

comment on table public.plans is 'Price plans. Limits null = custom.';

-- clients ----------------------------------------------------------------

create table public.clients (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  stage          public.client_stage not null default 'invited',
  plan_id        text references public.plans (id),
  country        text,
  currency       text default 'EUR',
  vat_id         text,
  health         public.client_health not null default 'on_track',
  mrr_cents      integer not null default 0,
  pilot_ends_at  timestamptz,
  contact_name   text,
  contact_email  text,
  invited_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

comment on table public.clients is 'One row per client company. Soft delete via deleted_at.';

create index clients_stage_idx on public.clients (stage);
create index clients_plan_id_idx on public.clients (plan_id);

-- client_members ---------------------------------------------------------

create table public.client_members (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  user_id        uuid references public.profiles (id) on delete cascade,
  role           public.member_role not null,
  status         public.member_status not null default 'active',
  invited_email  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (client_id, user_id)
);

comment on table public.client_members is 'Who belongs to which client and with which role. user_id is null until an invite is accepted.';

create index client_members_user_id_idx on public.client_members (user_id);
create index client_members_client_id_idx on public.client_members (client_id);

-- admin_settings ---------------------------------------------------------

create table public.admin_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table public.admin_settings is 'Key/value settings only the admin can read or change.';

-- events -----------------------------------------------------------------
-- Append-only audit log. Rows only arrive through log_event().

create table public.events (
  id           bigint generated always as identity primary key,
  client_id    uuid,
  actor_id     uuid,
  actor_role   text,
  action       text not null,
  object_type  text not null,
  object_id    text,
  before       jsonb,
  after        jsonb,
  ip           inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

comment on table public.events is 'Audit log. Every view, change, approval, signature and payment lands here. Insert only via log_event().';

create index events_client_id_created_at_idx on public.events (client_id, created_at desc);
create index events_actor_id_idx on public.events (actor_id);
create index events_created_at_idx on public.events (created_at desc);
