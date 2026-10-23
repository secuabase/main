import type { ShellUser } from "./AvatarMenu";
import { BottomNav } from "./BottomNav";
import type { NavItem } from "./nav";
import { PhoneTopRow } from "./PhoneTopRow";
import { TopBar } from "./TopBar";

/** Shared admin / client shell: desktop top bar, phone top row + bottom nav, page background. */
export function AppShell({
  nav,
  root,
  user,
  showSettings,
  children,
}: {
  nav: NavItem[];
  root: string;
  user: ShellUser;
  showSettings?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="app-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-4 md:px-[29px] md:pt-[29px]">
        <TopBar nav={nav} root={root} user={user} showSettings={showSettings} />
        <PhoneTopRow root={root} user={user} />
        <main className="flex-1 pt-6 pb-28 md:pt-5 md:pb-10">{children}</main>
      </div>
      <BottomNav items={nav} root={root} />
    </div>
  );
}
