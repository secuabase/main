import { cn } from "@/lib/utils";

/** White auth card: radius 24, 48px padding on desktop. */
export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("card-surface w-full p-7 sm:p-12", className)}>{children}</section>;
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[40px] leading-[1.2] font-normal tracking-[-0.01em] text-text">{children}</h1>;
}

export function AuthText({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-[15px] leading-6 text-muted", className)}>{children}</p>;
}
