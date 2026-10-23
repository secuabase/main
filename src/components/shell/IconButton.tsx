"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Round white icon button from the top bar. Phase 1: the targets do not exist yet, so it explains instead of 404-ing. */
export function IconButton({ label, note, className, children }: { label: string; note: string; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => toast(note)}
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-full bg-card text-text shadow-card transition-colors outline-none hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-tint dark:hover:bg-surface",
        className,
      )}
    >
      {children}
    </button>
  );
}
