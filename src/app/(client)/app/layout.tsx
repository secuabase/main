import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { clientNav } from "@/components/shell/nav";
import { getShellUser } from "@/lib/auth/shell-user";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, isAdmin, shellUser } = await getShellUser();
  if (!isAdmin) {
    const { data: member } = await supabase
      .from("client_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (!member) redirect("/no-access");
  }
  return (
    <AppShell nav={clientNav} root="/app" user={shellUser}>
      {children}
    </AppShell>
  );
}
