import { expect, test } from "@playwright/test";
import { login, users } from "./helpers";

test.describe("Route gates", () => {
  test("anonymous visit to /app goes to /login", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });

  test("anonymous redirect to /login keeps the next path", async ({ page }) => {
    await page.goto("/app/products");
    await expect(page).toHaveURL(/\/login/);
    const next = new URL(page.url()).searchParams.get("next");
    expect(next, "login URL should carry ?next=").toContain("/app");
  });

  test("anonymous visit to /admin goes to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a client owner cannot see the admin area", async ({ page }) => {
    await login(page, users.anna.email);
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/(app|no-access)(\/|\?|$)/);
    await expect(page.getByRole("link", { name: /^invites$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^review$/i })).toHaveCount(0);
  });

  test("POST /auth/logout ends the session", async ({ page }) => {
    await login(page, users.anna.email);

    const res = await page.request.post("/auth/logout");
    expect(res.status(), "logout should not error").toBeLessThan(500);

    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });
});
