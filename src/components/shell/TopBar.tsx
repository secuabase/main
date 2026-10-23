import { BellIcon, SettingsIcon } from "lucide-react";
import { AvatarMenu, type ShellUser } from "./AvatarMenu";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { NavPills } from "./NavPills";
import type { NavItem } from "./nav";

/** Desktop glass top bar: logo pill, centered pill nav, bell (+ gear for admin), avatar. */
export function TopBar({ nav, root, user, showSettings }: { nav: NavItem[]; root: string; user: ShellUser; showSettings?: boolean }) {
  return (
    <header className="glass sticky top-[29px] z-40 hidden h-[70px] grid-cols-[1fr_auto_1fr] items-center rounded-[24px] px-[11px] shadow-glass md:grid">
      <Logo href={root} />
      <NavPills items={nav} root={root} />
      <div className="flex items-center justify-end gap-3">
        {showSettings && (
          <IconButton label="Settings" note="Settings arrive in Phase 2.">
            <SettingsIcon className="size-5" />
          </IconButton>
        )}
        <IconButton label="Notifications" note="Notifications arrive in Phase 2.">
          <BellIcon className="size-5" />
        </IconButton>
        <AvatarMenu user={user} />
      </div>
    </header>
  );
}
