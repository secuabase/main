import "server-only";

// PostHog EU from the server (route handlers, server actions, cron jobs).
// No-op when NEXT_PUBLIC_POSTHOG_KEY is empty.
import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

let client: PostHog | null | undefined;

/** Singleton client, or null when PostHog is not configured. */
export function getPostHogServer(): PostHog | null {
  if (client !== undefined) return client;
  if (!POSTHOG_KEY) {
    client = null;
    return client;
  }
  client = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    // Serverless: send right away, nothing is left in memory between requests.
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

/** Record one server-side event for a user and wait until it is sent. Never throws. */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const ph = getPostHogServer();
  if (!ph) return;
  try {
    ph.capture({ distinctId, event, properties });
    await ph.flush();
  } catch (err) {
    console.error("[posthog] capture failed", err);
  }
}
