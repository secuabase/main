import { UnlinkIcon } from "lucide-react";
import { PageTitle } from "./PageHeader";
import { SupplierBar } from "./SupplierBar";

/** Friendly "This link is not valid" state (tokens arrive in Phase 3). */
export function SupplierInvalidLink() {
  return (
    <>
      <SupplierBar />
      <main className="flex-1 pt-6 md:pt-5">
        <PageTitle>This link is not valid</PageTitle>
        <p className="mt-2 text-[15px] leading-6 text-muted">Links work once and for a limited time. No account is needed.</p>
        <section className="card-surface mt-6 flex max-w-[640px] flex-col items-start gap-4 p-7 md:mt-7 md:p-10">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-tint text-primary dark:text-white">
            <UnlinkIcon className="size-6" />
          </span>
          <h2 className="text-lg font-medium text-text">Ask for a new link</h2>
          <p className="text-sm leading-6 text-muted">
            Reply to the email that brought you here. The company that asked for your documents can send a fresh link. A person reads every
            reply.
          </p>
        </section>
      </main>
    </>
  );
}
