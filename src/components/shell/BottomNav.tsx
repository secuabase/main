"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, File, Hexagon, House, Plus, Sparkles, SquareCheck, Truck, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActive, type NavIcon, type NavItem } from "./nav";

const icons: Record<NavIcon, LucideIcon> = {
  house: House,
  users: Users,
  "square-check": SquareCheck,
  plus: Plus,
  "credit-card": CreditCard,
  hexagon: Hexagon,
  file: File,
  sparkles: Sparkles,
  truck: Truck,
};

/** Floating Midnight pill with 5 icons; the active icon sits in a white circle. */
export function BottomNav({ items, root }: { items: NavItem[]; root: string }) {
  const pathname = usePathname();
  const phoneItems = items.filter((i) => i.phone).slice(0, 5);
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 bottom-4 z-40 flex h-16 items-center justify-between rounded-[32px] bg-ink px-[18px] shadow-glass md:hidden dark:border dark:border-white/10"
    >
      {phoneItems.map((item) => {
        const active = isActive(pathname, item.href, root);
        const Icon = icons[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex size-[52px] items-center justify-center rounded-full transition-colors",
              active ? "bg-white text-ink" : "text-white/85 hover:text-white",
            )}
          >
            <Icon className="size-5" strokeWidth={1.8} />
          </Link>
        );
      })}
    </nav>
  );
}
