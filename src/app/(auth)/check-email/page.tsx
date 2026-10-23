import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClockIcon, MailIcon } from "lucide-react";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { CheckEmailForm } from "@/components/auth/CheckEmailForm";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Check your email" };

type Search = Record<string, string | string[] | undefined>;

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  if (!email) redirect("/login");
  const next = safeNext(params.next);

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start text-center">
        <span className="mx-auto flex size-[84px] items-center justify-center rounded-full bg-primary text-white">
          <MailIcon className="size-8" strokeWidth={1.8} />
        </span>
        <div className="mt-6">
          <AuthTitle>Check your email</AuthTitle>
        </div>
        <AuthText className="mx-auto mt-3 max-w-[420px]">
          We sent a link and a 6-digit code to <span className="text-text">{email}</span>. Click the link, or type the code here.
        </AuthText>
        <CheckEmailForm email={email} next={next} />
        <p className="mx-auto mt-5 inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-full bg-tint px-5 py-2 text-[13px] text-muted">
          <ClockIcon className="size-4 shrink-0" />
          <span>Link and code work for 15 minutes, one time only</span>
        </p>
      </AuthCard>
    </div>
  );
}
