"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, type ActionState } from "@/lib/auth/actions";
import { FormError } from "./FormError";

export function ResetPasswordForm() {
  const [state, action, pending] = React.useActionState<ActionState, FormData>(resetPassword, {});
  return (
    <form action={action} className="mt-6 flex flex-col">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-[13px]">
          New password
        </Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <p className="text-[13px] text-muted">At least 8 characters.</p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Label htmlFor="confirm" className="text-[13px]">
          Type it again
        </Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <FormError message={state.error} className="mt-4" />
      <Button type="submit" disabled={pending} className="mt-4 h-12 w-full text-[15px] font-normal">
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
