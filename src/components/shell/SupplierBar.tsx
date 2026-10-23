import { Logo } from "./Logo";

/** Supplier top bar: logo left, "Secure link for {supplier}" right, no nav, no login. */
export function SupplierBar({ supplier }: { supplier?: string }) {
  return (
    <header className="glass flex h-[60px] items-center justify-between rounded-[24px] px-[11px] shadow-glass md:h-[70px]">
      <Logo href="#" />
      <p className="truncate pr-3 text-[13px] text-muted">{supplier ? `Secure link for ${supplier}` : "Secure link"}</p>
    </header>
  );
}
