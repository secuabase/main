import type { Metadata } from "next";
import { EmptyState } from "@/components/shell/EmptyState";
import { Greeting } from "@/components/shell/PageHeader";
import { getShellUser } from "@/lib/auth/shell-user";

export const metadata: Metadata = { title: "Home" };

export default async function ClientHomePage() {
  const { firstName } = await getShellUser();
  return (
    <>
      <Greeting firstName={firstName} />
      <div className="mt-6 md:mt-7">
        <EmptyState />
      </div>
    </>
  );
}
