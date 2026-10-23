"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, type ActionState } from "@/lib/auth/actions";
import { FormError } from "./FormError";

export function ForgotPasswordForm() {
  const [state, action, pending] = React.useActionState<ActionState, FormData>(forgotPassword, {});
  return (
    <form action={action} className="mt-6 flex flex-col">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-[13px]">
          Work email
        </Label>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@company.com" />
      </div>
      <FormError message={state.error} className="mt-4" />
      <Button type="submit" disabled={pending} className="mt-4 h-12 w-full text-[15px] font-normal">
        {pending ? "Sending…" : "Email me a reset link"}
      </Button>
    </form>
  );
}
