import { cn } from "cn";

export { cn };

/** First word of a full name, or a fallback. */
export function firstName(fullName: string | null | undefined, fallback = "there"): string {
  const first = (fullName ?? "").trim().split(/\s+/)[0];
  return first || fallback;
}

/** Up to two initials from a name or email. */
export function initials(name: string | null | undefined, email?: string | null): string {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Good morning" / "Good afternoon" / "Good evening" by the local hour. */
export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
