import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/PlaceholderPage";

export const metadata: Metadata = { title: "Assistant" };

export default function Page() {
  return <PlaceholderPage title="Assistant" />;
}
