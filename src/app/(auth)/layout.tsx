import { Logo } from "@/components/shell/Logo";

/** Access pages: background glows, glass bar with the logo only, content below. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-[17px] pt-[17px] pb-[17px] md:p-[29px]">
        <header className="glass flex h-[60px] items-center rounded-[24px] px-[11px] shadow-glass md:h-[70px]">
          <Logo href="/login" />
        </header>
        <main className="flex flex-1 flex-col pt-5 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
