import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/PlaceholderPage";

export const metadata: Metadata = { title: "Filings" };

export default function Page() {
  return <PlaceholderPage title="Filings" />;
}
