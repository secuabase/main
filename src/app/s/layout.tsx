/** Supplier portal: no login, secure link. Phase 1 shows only the invalid-link state. */
export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-[17px] pt-[17px] pb-[17px] md:p-[29px]">{children}</div>
    </div>
  );
}
