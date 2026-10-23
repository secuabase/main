import type { Metadata } from "next";
import { SupplierInvalidLink } from "@/components/shell/SupplierInvalidLink";

export const metadata: Metadata = { title: "Secure link" };

export default function SupplierRootPage() {
  return <SupplierInvalidLink />;
}
