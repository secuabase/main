"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, type NavItem } from "./nav";

/** Centered pill nav: active = Persian blue pill, inactive = light tint pill. */
export function NavPills({ items, root }: { items: NavItem[]; root: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex items-center gap-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href, root);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-[23px] text-[15px] transition-colors",
              active ? "bg-primary text-white" : "bg-tint text-text hover:bg-line dark:hover:bg-surface",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
