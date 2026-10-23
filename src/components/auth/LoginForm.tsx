"use client";

import * as React from "react";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginWithPassword, requestLoginLink, type ActionState } from "@/lib/auth/actions";
import { FormError } from "./FormError";
import { AuthText, AuthTitle } from "./AuthCard";

type Mode = "password" | "link";

const tabsList = "h-12 group-data-horizontal/tabs:h-12 w-fit gap-0 rounded-full bg-tint p-1 text-text";
const tabsTrigger =
  "h-10 flex-none rounded-full border-0 px-5 text-sm font-normal text-text shadow-none after:hidden hover:text-text data-active:bg-primary data-active:text-white data-active:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-none dark:text-text dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-white";

export function LoginForm({ next, initialEmail, initialError }: { next: string; initialEmail?: string; initialError?: string }) {
  const [mode, setMode] = React.useState<Mode>("password");
  const [pwState, pwAction, pwPending] = React.useActionState<ActionState, FormData>(loginWithPassword, {});
  const [linkState, linkAction, linkPending] = React.useActionState<ActionState, FormData>(requestLoginLink, {});
  const pending = pwPending || linkPending;
  const error = pwState.error ?? linkState.error ?? initialError;

  return (
    <form className="flex flex-col">
      <input type="hidden" name="next" value={next} />
      <AuthTitle>Log in</AuthTitle>
      <AuthText className="mt-2">Welcome back. Use your work email.</AuthText>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-5 gap-0">
        <TabsList aria-label="How do you want to log in?" className={tabsList}>
          <TabsTrigger value="password" className={tabsTrigger}>
            Password
          </TabsTrigger>
          <TabsTrigger value="link" className={tabsTrigger}>
            Email me a link
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6 flex flex-col gap-2">
        <Label htmlFor="email" className="text-[13px]">
          Work email
        </Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={initialEmail} placeholder="you@company.com" />
      </div>

      {mode === "password" && (
        <div className="mt-5 flex flex-col gap-2">
          <Label htmlFor="password" className="text-[13px]">
            Password
          </Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required={mode === "password"} />
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <Checkbox name="remember" defaultChecked className="size-[18px]" />
          Remember this device
        </label>
        {mode === "password" && (
          <Link href="/forgot-password" className="text-[13px] text-primary underline underline-offset-2 hover:text-ink dark:text-white">
            Forgot password?
          </Link>
        )}
      </div>

      <FormError message={error} className="mt-4" />

      {mode === "password" ? (
        <>
          <Button type="submit" formAction={pwAction} disabled={pending} className="mt-4 h-12 w-full text-[15px] font-normal">
            {pwPending ? "Logging in…" : "Log in"}
          </Button>
          <div className="my-4 flex items-center gap-3 text-[13px] text-[#9497bf]" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button type="submit" formAction={linkAction} formNoValidate variant="secondary" disabled={pending} className="h-12 w-full text-[15px] font-normal">
            <MailIcon className="size-5" />
            {linkPending ? "Sending…" : "Email me a login link"}
          </Button>
        </>
      ) : (
        <Button type="submit" formAction={linkAction} disabled={pending} className="mt-4 h-12 w-full text-[15px] font-normal">
          <MailIcon className="size-5" />
          {linkPending ? "Sending…" : "Email me a login link"}
        </Button>
      )}

      <p className="mt-6 text-[13px] leading-5 text-muted">New client? You get an invite from Secuabase. Suppliers never need to log in.</p>
    </form>
  );
}
