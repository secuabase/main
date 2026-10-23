"use client";

import * as React from "react";
import { LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeMenuItem } from "./ThemeToggle";

export type ShellUser = { name: string; email: string; initials: string };

/** 48px Persian-blue avatar with initials; opens theme toggle + log out. */
export function AvatarMenu({ user, className }: { user: ShellUser; className?: string }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className={cn(
            "inline-flex size-12 items-center justify-center rounded-full bg-primary text-[13px] font-semibold tracking-wide text-white outline-none transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:hover:bg-secondary",
            className,
          )}
        >
          {user.initials}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl border border-line bg-card p-2 shadow-glass ring-0">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block truncate text-sm font-medium text-text">{user.name}</span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-line" />
          <ThemeMenuItem />
          <DropdownMenuSeparator className="bg-line" />
          <DropdownMenuItem
            className="h-11 cursor-pointer rounded-xl px-3 text-sm"
            onClick={() => formRef.current?.requestSubmit()}
          >
            <LogOutIcon className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form ref={formRef} action="/auth/logout" method="post" className="hidden" />
    </>
  );
}
