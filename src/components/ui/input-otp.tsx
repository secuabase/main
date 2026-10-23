"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { OTPInput, OTPInputContext } from "input-otp"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-15 w-13 items-center justify-center rounded-[16px] border border-transparent bg-tint text-2xl font-normal text-text transition-colors sm:h-16 sm:w-14 data-[active=true]:border-primary data-[active=true]:bg-card dark:data-[active=true]:bg-ink",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-caret-blink bg-text duration-1000" />
        </div>
      )}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
