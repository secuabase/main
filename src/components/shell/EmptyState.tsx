import { SparklesIcon } from "lucide-react";

/** Phase 1 placeholder card. */
export function EmptyState({ title = "Nothing here yet.", body = "Phase 2 adds the dashboard." }: { title?: string; body?: string }) {
  return (
    <section className="card-surface flex flex-col items-center gap-3 px-6 py-12 text-center md:py-16">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-tint text-primary dark:text-white">
        <SparklesIcon className="size-6" />
      </span>
      <h2 className="text-lg font-medium text-text">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{body}</p>
    </section>
  );
}
