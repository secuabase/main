import { cn } from "@/lib/utils";

/** Alert-tinted line under a form. Always rendered so screen readers get the live region. */
export function FormError({ message, className }: { message?: string; className?: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-[12px] px-4 text-[13px] leading-5 text-alert transition-all dark:text-[#ff8a73]",
        message ? "bg-alert-tint py-2.5" : "h-0 overflow-hidden py-0",
        className,
      )}
    >
      {message}
    </p>
  );
}
