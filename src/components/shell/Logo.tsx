import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Secuabase mark; the reversed version shows on dark backgrounds. */
export function Mark({ size = 26, className }: { size?: number; className?: string }) {
  const width = Math.round((size * 76) / 68);
  return (
    <span className={cn("inline-flex shrink-0", className)} style={{ width, height: size }}>
      <Image src="/brand/secuabase-mark-color.svg" alt="" width={width} height={size} priority className="dark:hidden" />
      <Image src="/brand/secuabase-mark-reversed.svg" alt="" width={width} height={size} priority className="hidden dark:block" />
    </span>
  );
}

/** Logo pill from the top bar: mark + "secuabase" wordmark in a white pill. */
export function Logo({ href = "/", wordmark = true, className }: { href?: string; wordmark?: boolean; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Secuabase home"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full bg-card px-[14px] shadow-card md:h-12 md:px-[17px]",
        !wordmark && "w-[52px] justify-center px-0",
        className,
      )}
    >
      <Mark size={26} />
      {wordmark && <span className="text-[16px] font-bold tracking-tight text-text md:text-[17px]">secuabase</span>}
    </Link>
  );
}
