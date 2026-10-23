"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { verifyTotp, type ActionState } from "@/lib/auth/actions";
import { CodeInput } from "./CodeInput";
import { FormError } from "./FormError";

/** Admin 2-step code form, used by /admin/setup-2fa and /admin/verify-2fa. */
export function TotpForm({ factorId, submitLabel }: { factorId: string; submitLabel: string }) {
  const [state, action, pending] = React.useActionState<ActionState, FormData>(verifyTotp, {});
  const [code, setCode] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  // Clear the boxes when a new error comes back (state object changes per result).
  const [seen, setSeen] = React.useState<ActionState>(state);
  if (state !== seen) {
    setSeen(state);
    if (state.error) setCode("");
  }

  return (
    <form ref={formRef} action={action} className="mt-6 flex flex-col items-center">
      <input type="hidden" name="factorId" value={factorId} />
      <CodeInput name="code" label="6-digit code from your authenticator app" value={code} onChange={setCode} onComplete={() => formRef.current?.requestSubmit()} autoFocus disabled={pending} />
      <FormError message={state.error} className="mt-4 w-full" />
      <Button type="submit" disabled={pending || code.length < 6} className="mt-4 h-12 w-full text-[15px] font-normal">
        {pending ? "Checking…" : submitLabel}
      </Button>
    </form>
  );
}
