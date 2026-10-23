import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstName, initials } from "@/lib/utils";
import type { ShellUser } from "@/components/shell/AvatarMenu";

/** The logged-in user plus what the shell needs (name, email, initials). */
export async function getShellUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const meta = (user.user_metadata ?? {}) as { full_name?: string };
  const name: string = profile?.full_name ?? meta.full_name ?? "";
  const email: string = profile?.email ?? user.email ?? "";
  const shellUser: ShellUser = { name: name || email, email, initials: initials(name, email) };

  return { supabase, user, isAdmin: Boolean(profile?.is_admin), shellUser, firstName: firstName(name, "there") };
}
