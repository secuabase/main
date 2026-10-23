-- Tighten who may call the helper functions over the API.
-- Signed-in users keep execute: RLS policies run these as the caller.
-- Anonymous callers get nothing. (Security advisor 0028.)

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.client_role(uuid) from public, anon;
revoke execute on function public.has_client_role(uuid, public.member_role[]) from public, anon;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.client_role(uuid) to authenticated, service_role;
grant execute on function public.has_client_role(uuid, public.member_role[]) to authenticated, service_role;
