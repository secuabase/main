import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

type Search = Record<string, string | string[] | undefined>;

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start">
        {sent ? (
          <div className="text-center">
            <span className="mx-auto flex size-[84px] items-center justify-center rounded-full bg-primary text-white">
              <MailIcon className="size-8" strokeWidth={1.8} />
            </span>
            <div className="mt-6">
              <AuthTitle>Check your email</AuthTitle>
            </div>
            <AuthText className="mx-auto mt-3 max-w-[420px]">
              If we know <span className="text-text">{email}</span>, we sent a link to set a new password. It works for 15 minutes.
            </AuthText>
          </div>
        ) : (
          <>
            <AuthTitle>Forgot your password?</AuthTitle>
            <AuthText className="mt-2">Type your work email. We send you a link to set a new one.</AuthText>
            <ForgotPasswordForm />
          </>
        )}
        <p className="mt-6 text-center text-[13px] text-muted">
          <Link href="/login" className="text-primary underline underline-offset-2 hover:text-ink dark:text-white">
            Back to log in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
