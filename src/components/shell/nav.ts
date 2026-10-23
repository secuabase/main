/** Nav config. Icons are names (not components) so the config can cross the server/client boundary. */
export type NavIcon = "house" | "users" | "square-check" | "plus" | "credit-card" | "hexagon" | "file" | "sparkles" | "truck";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Shown in the phone bottom nav (5 slots). */
  phone?: boolean;
};

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "house", phone: true },
  { label: "Clients", href: "/admin/clients", icon: "users", phone: true },
  { label: "Review", href: "/admin/review", icon: "square-check", phone: true },
  { label: "Invites", href: "/admin/invites", icon: "plus", phone: true },
  { label: "Suppliers", href: "/admin/suppliers", icon: "truck" },
  { label: "Billing", href: "/admin/billing", icon: "credit-card", phone: true },
];

export const clientNav: NavItem[] = [
  { label: "Home", href: "/app", icon: "house", phone: true },
  { label: "Products", href: "/app/products", icon: "hexagon", phone: true },
  { label: "Suppliers", href: "/app/suppliers", icon: "truck" },
  { label: "Filings", href: "/app/filings", icon: "file", phone: true },
  { label: "Assistant", href: "/app/assistant", icon: "sparkles", phone: true },
  { label: "Billing", href: "/app/billing", icon: "credit-card", phone: true },
];

export function isActive(pathname: string, href: string, root: string) {
  if (href === root) return pathname === root;
  return pathname === href || pathname.startsWith(`${href}/`);
}
