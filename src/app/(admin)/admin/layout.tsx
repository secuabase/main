import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/nav";
import { getShellUser } from "@/lib/auth/shell-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, shellUser } = await getShellUser();
  if (!isAdmin) redirect("/app");
  return (
    <AppShell nav={adminNav} root="/admin" user={shellUser} showSettings>
      {children}
    </AppShell>
  );
}
