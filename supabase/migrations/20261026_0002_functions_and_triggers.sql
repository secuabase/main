-- Phase 1 helper functions, guards and triggers.
-- All helpers are security definer with a fixed search_path so RLS policies
-- can call them without recursion.

-- is_admin(): true when the caller's profile has is_admin = true.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- client_role(client): the caller's active role in that client, or null.
create or replace function public.client_role(p_client_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.client_members m
  where m.client_id = p_client_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

-- has_client_role(client, roles): true when the caller's active role is one of roles.
create or replace function public.has_client_role(p_client_id uuid, p_roles public.member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.client_role(p_client_id) = any (p_roles), false);
$$;

-- log_event(...): the only way rows get into events.
-- actor_role = 'admin' | member role | 'system' (no auth user) | 'user' (signed in, no role).
-- ip and user_agent come from the request headers when PostgREST is the caller.
create or replace function public.log_event(
  p_client_id uuid,
  p_action text,
  p_object_type text,
  p_object_id text,
  p_before jsonb,
  p_after jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id   uuid := auth.uid();
  v_actor_role text;
  v_headers    jsonb;
  v_ip         inet;
  v_user_agent text;
  v_id         bigint;
begin
  if v_actor_id is null then
    v_actor_role := 'system';
  elsif public.is_admin() then
    v_actor_role := 'admin';
  else
    v_actor_role := coalesce(public.client_role(p_client_id)::text, 'user');
  end if;

  -- Request headers are only present for PostgREST calls. Never fail on them.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
    if v_headers is not null then
      v_user_agent := left(v_headers ->> 'user-agent', 512);
      v_ip := nullif(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1), '')::inet;
    end if;
  exception when others then
    v_headers := null;
  end;

  insert into public.events (client_id, actor_id, actor_role, action, object_type, object_id, before, after, ip, user_agent)
  values (p_client_id, v_actor_id, v_actor_role, p_action, p_object_type, p_object_id, p_before, p_after, v_ip, v_user_agent)
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.log_event(uuid, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.log_event(uuid, text, text, text, jsonb, jsonb) to authenticated, service_role;

-- auth.users -> profiles ---------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at ---------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger client_members_set_updated_at
  before update on public.client_members
  for each row execute function public.set_updated_at();

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();

-- Guard: a non-admin cannot change is_admin ---------------------------------
-- Service role and SQL (auth.uid() is null) may set it, e.g. the seed.

create or replace function public.guard_profile_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change is_admin.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_profile_is_admin();

-- Guard: a client always keeps at least one active owner -------------------
-- Skipped when the client row itself is gone (cascade delete of a client).

create or replace function public.guard_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
begin
  -- Only matters when an active owner row stops being an active owner.
  if old.role <> 'owner' or old.status <> 'active' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' and new.status = 'active' and new.client_id = old.client_id then
    return new;
  end if;
  -- Client is being deleted: let the cascade run.
  if not exists (select 1 from public.clients c where c.id = old.client_id) then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select count(*) into v_remaining
  from public.client_members m
  where m.client_id = old.client_id
    and m.id <> old.id
    and m.role = 'owner'
    and m.status = 'active';

  if v_remaining = 0 then
    raise exception 'A client must keep at least one owner. Add another owner first.' using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger client_members_guard_last_owner
  before update or delete on public.client_members
  for each row execute function public.guard_last_owner();

-- Guard: members may only edit contact and company fields on clients -------
-- Billing, stage, health and plan stay admin-only even though the update
-- policy lets owners and editors update the row.

create or replace function public.guard_client_member_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if new.id            is distinct from old.id
     or new.slug          is distinct from old.slug
     or new.stage         is distinct from old.stage
     or new.plan_id       is distinct from old.plan_id
     or new.health        is distinct from old.health
     or new.mrr_cents     is distinct from old.mrr_cents
     or new.pilot_ends_at is distinct from old.pilot_ends_at
     or new.invited_at    is distinct from old.invited_at
     or new.created_at    is distinct from old.created_at
     or new.deleted_at    is distinct from old.deleted_at then
    raise exception 'Only an admin can change plan, stage, health, billing or lifecycle fields.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger clients_guard_member_update
  before update on public.clients
  for each row execute function public.guard_client_member_update();

-- Audit triggers -----------------------------------------------------------
-- After insert/update/delete on the 4 business tables -> log_event with the
-- row before and after. Trigger arg 1 = name of the primary key column.

create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before    jsonb;
  v_after     jsonb;
  v_row       jsonb;
  v_pk        text := coalesce(tg_argv[0], 'id');
  v_client_id uuid;
begin
  if tg_op <> 'INSERT' then v_before := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then v_after := to_jsonb(new); end if;
  v_row := coalesce(v_after, v_before);

  if tg_table_name = 'clients' then
    v_client_id := (v_row ->> 'id')::uuid;
  elsif tg_table_name = 'client_members' then
    v_client_id := (v_row ->> 'client_id')::uuid;
  end if;

  perform public.log_event(
    v_client_id,
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    v_row ->> v_pk,
    v_before,
    v_after
  );

  return null;
end;
$$;

create trigger clients_audit
  after insert or update or delete on public.clients
  for each row execute function public.audit_row('id');

create trigger client_members_audit
  after insert or update or delete on public.client_members
  for each row execute function public.audit_row('id');

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_row('id');

create trigger admin_settings_audit
  after insert or update or delete on public.admin_settings
  for each row execute function public.audit_row('key');

-- Trigger functions are not meant to be called by API users.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.guard_profile_is_admin() from public, anon, authenticated;
revoke execute on function public.guard_last_owner() from public, anon, authenticated;
revoke execute on function public.guard_client_member_update() from public, anon, authenticated;
revoke execute on function public.audit_row() from public, anon, authenticated;
