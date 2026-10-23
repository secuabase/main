"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const slot = "h-[72px] w-[60px] rounded-[16px] text-[30px]";

/** Six code boxes, 60x72, auto-advance + paste, numeric keyboard; wraps to 3+3 on phone. */
export function CodeInput({
  name = "token",
  value,
  onChange,
  onComplete,
  autoFocus,
  disabled,
  label = "6-digit code",
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <InputOTP
      name={name}
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      disabled={disabled}
      aria-label={label}
      containerClassName="flex flex-wrap justify-center gap-[10px]"
    >
      <InputOTPGroup className="gap-[10px]">
        <InputOTPSlot index={0} className={slot} />
        <InputOTPSlot index={1} className={slot} />
        <InputOTPSlot index={2} className={slot} />
      </InputOTPGroup>
      <InputOTPGroup className="gap-[10px]">
        <InputOTPSlot index={3} className={slot} />
        <InputOTPSlot index={4} className={slot} />
        <InputOTPSlot index={5} className={slot} />
      </InputOTPGroup>
    </InputOTP>
  );
}
