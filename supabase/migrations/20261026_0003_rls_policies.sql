-- Phase 1 row-level security. RLS on every table; exactly the policies in
-- docs/phase-1-spec.md. events has no insert/update/delete policy at all.

alter table public.profiles       enable row level security;
alter table public.plans          enable row level security;
alter table public.clients        enable row level security;
alter table public.client_members enable row level security;
alter table public.admin_settings enable row level security;
alter table public.events         enable row level security;

-- profiles -----------------------------------------------------------------
-- Own row, or any row for the admin. No insert/delete via the API
-- (rows come from the auth.users trigger and cascade).

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- plans --------------------------------------------------------------------

create policy plans_select on public.plans
  for select to authenticated
  using (true);

create policy plans_insert_admin on public.plans
  for insert to authenticated
  with check (public.is_admin());

create policy plans_update_admin on public.plans
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy plans_delete_admin on public.plans
  for delete to authenticated
  using (public.is_admin());

-- clients ------------------------------------------------------------------

create policy clients_admin_all on public.clients
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy clients_member_select on public.clients
  for select to authenticated
  using (public.has_client_role(id, '{owner,editor,viewer,billing}'::public.member_role[]));

create policy clients_member_update on public.clients
  for update to authenticated
  using (public.has_client_role(id, '{owner,editor}'::public.member_role[]))
  with check (public.has_client_role(id, '{owner,editor}'::public.member_role[]));

-- client_members -----------------------------------------------------------

create policy client_members_admin_all on public.client_members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy client_members_member_select on public.client_members
  for select to authenticated
  using (public.has_client_role(client_id, '{owner,editor,viewer,billing}'::public.member_role[]));

create policy client_members_owner_insert on public.client_members
  for insert to authenticated
  with check (public.has_client_role(client_id, '{owner}'::public.member_role[]));

create policy client_members_owner_update on public.client_members
  for update to authenticated
  using (public.has_client_role(client_id, '{owner}'::public.member_role[]))
  with check (public.has_client_role(client_id, '{owner}'::public.member_role[]));

create policy client_members_owner_delete on public.client_members
  for delete to authenticated
  using (public.has_client_role(client_id, '{owner}'::public.member_role[]));

-- admin_settings -----------------------------------------------------------

create policy admin_settings_admin_all on public.admin_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- events -------------------------------------------------------------------
-- Select only. Rows are written by log_event() (security definer).

create policy events_select on public.events
  for select to authenticated
  using (
    public.is_admin()
    or (client_id is not null and public.has_client_role(client_id, '{owner,editor,viewer}'::public.member_role[]))
  );

-- Belt and braces: API roles can never write events directly.
revoke insert, update, delete, truncate on public.events from anon, authenticated;
