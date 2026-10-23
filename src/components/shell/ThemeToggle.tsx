"use client";

import * as React from "react";
import { useTheme as useNextTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const noSubscribe = () => () => {};

/** Theme state that is safe to render before hydration ("light" until mounted). */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const mounted = React.useSyncExternalStore(noSubscribe, () => true, () => false);
  const resolved: "light" | "dark" = mounted && resolvedTheme === "dark" ? "dark" : "light";
  return { theme, setTheme, resolved, mounted };
}

/** Sun / moon row for the avatar menu. Stays open when toggled. */
export function ThemeMenuItem() {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dark";
  return (
    <DropdownMenuItem
      closeOnClick={false}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="h-11 cursor-pointer rounded-xl px-3 text-sm"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
      <span>Dark mode</span>
      <Switch checked={dark} size="sm" className="pointer-events-none ml-auto" tabIndex={-1} aria-hidden />
    </DropdownMenuItem>
  );
}
