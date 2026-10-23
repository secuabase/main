"use client";

// Last-resort error page. Replaces the root layout when it throws, so it must
// render <html> and <body> itself and import the global styles.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex items-center justify-center bg-background text-foreground font-sans">
        <main className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We have been told and will fix it.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
