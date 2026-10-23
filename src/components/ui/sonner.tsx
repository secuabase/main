"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"
import { useTheme } from "@/components/shell/ThemeToggle"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolved } = useTheme()

  return (
    <Sonner
      theme={resolved}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--sb-card)",
          "--normal-text": "var(--sb-text)",
          "--normal-border": "var(--sb-line)",
          "--border-radius": "16px",
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
