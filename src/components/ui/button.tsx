import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border border-transparent font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-ink dark:hover:bg-secondary",
        secondary:
          "bg-card text-text shadow-card hover:bg-tint dark:bg-tint dark:hover:bg-surface",
        tint: "bg-tint text-text hover:bg-line dark:hover:bg-surface",
        outline: "border-line bg-transparent text-text hover:bg-tint",
        ghost: "bg-transparent text-text hover:bg-tint",
        destructive: "bg-alert text-white hover:bg-alert/90",
        link: "h-auto rounded-none px-0 text-primary underline underline-offset-4 hover:text-ink dark:text-white",
      },
      size: {
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-7 text-base",
        sm: "h-9 px-4 text-sm",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
