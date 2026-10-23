import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-13 w-full min-w-0 rounded-[16px] border border-line bg-tint px-4 text-base text-text transition-colors outline-none placeholder:text-muted focus-visible:border-primary focus-visible:bg-card focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-alert aria-invalid:outline-alert dark:focus-visible:bg-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
