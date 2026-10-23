import type { Metadata } from "next";
import { SupplierInvalidLink } from "@/components/shell/SupplierInvalidLink";

export const metadata: Metadata = { title: "Secure link" };

export default async function SupplierLinkPage({ params }: { params: Promise<{ token: string }> }) {
  // Phase 3 looks the token up. Phase 1 always shows the friendly invalid state.
  await params;
  return <SupplierInvalidLink />;
}
