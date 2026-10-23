import { EmptyState } from "./EmptyState";
import { PageTitle } from "./PageHeader";

/** Phase 1 route body: page title + one empty-state card. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <div className="mt-6 md:mt-7">
        <EmptyState />
      </div>
    </>
  );
}
