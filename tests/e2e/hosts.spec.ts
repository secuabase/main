import { expect, test } from "@playwright/test";

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

test.describe("Host routing", () => {
  test("supplier.secuabase.com root renders the supplier shell", async ({ request }) => {
    const res = await request.get("/", { headers: { host: "supplier.secuabase.com" } });
    expect(res.status()).toBe(200);
    const text = stripTags(await res.text());
    expect(text).toMatch(/this link is not valid|secure link/i);
  });

  test("/s/abc renders the supplier not-valid state", async ({ page }) => {
    await page.goto("/s/abc");
    await expect(page.getByText(/this link is not valid/i).first()).toBeVisible();
  });

  test("/pay renders the placeholder page", async ({ request }) => {
    const res = await request.get("/pay");
    expect(res.status()).toBe(200);
    const text = stripTags(await res.text());
    expect(text).toMatch(/pay|secuabase/i);
  });
});
