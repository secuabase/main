import "server-only";

// Post a short message to #secuabase-ops through a Slack incoming webhook.
// Never throws: returns false when SLACK_WEBHOOK_URL is empty or the call fails.
const TIMEOUT_MS = 5_000;

export async function notifyOps(
  text: string,
  blocks?: unknown[],
): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn("[slack] SLACK_WEBHOOK_URL is empty, message not sent:", text);
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(blocks ? { text, blocks } : { text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[slack] webhook returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[slack] webhook failed", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
