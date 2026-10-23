"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendLoginLink, verifyLoginCode, type ActionState } from "@/lib/auth/actions";
import { CodeInput } from "./CodeInput";
import { FormError } from "./FormError";

const RESEND_SECONDS = 42;

export function CheckEmailForm({ email, next }: { email: string; next: string }) {
  const [state, action, pending] = React.useActionState<ActionState, FormData>(verifyLoginCode, {});
  const [resendState, resendAction, resendPending] = React.useActionState<ActionState, FormData>(resendLoginLink, {});
  const [code, setCode] = React.useState("");
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // React to new action results during render (each result is a new object).
  const [seen, setSeen] = React.useState<ActionState>(state);
  if (state !== seen) {
    setSeen(state);
    if (state.error) setCode("");
  }
  const [seenResend, setSeenResend] = React.useState<ActionState>(resendState);
  if (resendState !== seenResend) {
    setSeenResend(resendState);
    if (resendState.ok) {
      setSeconds(RESEND_SECONDS);
      setCode("");
    }
  }

  React.useEffect(() => {
    if (resendState.ok) toast.success("We sent a new link and code.");
    else if (resendState.error) toast.error(resendState.error);
  }, [resendState]);

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <form ref={formRef} action={action} className="mt-6 flex flex-col items-center">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <CodeInput value={code} onChange={setCode} onComplete={() => formRef.current?.requestSubmit()} autoFocus disabled={pending} />
        <FormError message={state.error} className="mt-4 w-full max-w-[502px]" />
        <Button type="submit" disabled={pending || code.length < 6} className="mt-4 h-12 w-full max-w-[502px] text-[15px] font-normal">
          {pending ? "Checking…" : "Verify and log in"}
        </Button>
      </form>

      <p className="mt-4 text-[13px] text-muted">
        No email?{" "}
        {seconds > 0 ? (
          <span className="text-primary underline underline-offset-2 dark:text-white" aria-live="off">
            Send again in {mm}:{ss}
          </span>
        ) : (
          <form action={resendAction} className="inline">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              disabled={resendPending}
              className="min-h-11 text-primary underline underline-offset-2 hover:text-ink disabled:opacity-60 dark:text-white"
            >
              {resendPending ? "Sending…" : "Send again"}
            </button>
          </form>
        )}
      </p>
    </>
  );
}
