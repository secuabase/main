import { BellIcon } from "lucide-react";
import { AvatarMenu, type ShellUser } from "./AvatarMenu";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";

/** Phone top row: mark pill left, bell circle + avatar right, no wordmark. */
export function PhoneTopRow({ root, user }: { root: string; user: ShellUser }) {
  return (
    <div className="flex items-center justify-between pt-[22px] md:hidden">
      <Logo href={root} wordmark={false} className="h-10" />
      <div className="flex items-center gap-3">
        <IconButton label="Notifications" note="Notifications arrive in Phase 2.">
          <BellIcon className="size-5" />
        </IconButton>
        <AvatarMenu user={user} />
      </div>
    </div>
  );
}
