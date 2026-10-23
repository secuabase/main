"use client";

// PostHog EU in the browser. No-op when NEXT_PUBLIC_POSTHOG_KEY is empty.
// Mount once in src/app/layout.tsx around {children}.
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

let initialised = false;

function initPostHog() {
  if (initialised || !POSTHOG_KEY || typeof window === "undefined") return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // we send $pageview ourselves on route change
    capture_pageleave: true,
    autocapture: false,
  });
  initialised = true;
}

/** Tie the current browser session to a signed-in user. Safe to call when PostHog is off. */
export function identifyUser(
  id: string,
  props: { email?: string; is_admin?: boolean } = {},
) {
  if (!POSTHOG_KEY) return;
  initPostHog();
  posthog.identify(id, props);
}

/** Forget the user on sign-out so the next session starts anonymous. */
export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    const query = searchParams.toString();
    const url = window.origin + pathname + (query ? `?${query}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <>
      {/* useSearchParams needs a Suspense boundary or static pages fail to prerender. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
