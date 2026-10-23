import type { Metadata } from "next";
import { CreditCardIcon } from "lucide-react";
import { Logo } from "@/components/shell/Logo";
import { PageTitle } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Pay" };

/** pay.secuabase.com placeholder. Stripe Checkout links arrive in a later phase. */
export default function PayPage() {
  return (
    <div className="app-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-[17px] pt-[17px] pb-[17px] md:p-[29px]">
        <header className="glass flex h-[60px] items-center rounded-[24px] px-[11px] shadow-glass md:h-[70px]">
          <Logo href="#" />
        </header>
        <main className="flex-1 pt-6 md:pt-5">
          <PageTitle>Payments</PageTitle>
          <section className="card-surface mt-6 flex max-w-[640px] flex-col items-start gap-4 p-7 md:mt-7 md:p-10">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-tint text-primary dark:text-white">
              <CreditCardIcon className="size-6" />
            </span>
            <h2 className="text-lg font-medium text-text">Nothing to pay here yet</h2>
            <p className="text-sm leading-6 text-muted">Payment links from Secuabase open on this page. If you got here by mistake, close this tab.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
