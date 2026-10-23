import { expect, test } from "@playwright/test";
import { clientNav, login, users } from "./helpers";

test.describe("Client shell", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.anna.email);
    await expect(page).toHaveURL(/\/app(\/|\?|$)/);
  });

  test("desktop top bar shows the six client nav items", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");

    for (const item of clientNav) {
      await expect(page.getByRole("link", { name: new RegExp(`^${item}$`, "i") }).first()).toBeVisible();
    }
  });

  test("phone shows a five-link bottom nav and hides the wordmark", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "phone only");

    const navs = page.getByRole("navigation");
    const navCount = await navs.count();
    let found = false;
    for (let i = 0; i < navCount; i++) {
      const nav = navs.nth(i);
      if (!(await nav.isVisible())) continue;
      const links = nav.getByRole("link");
      if ((await links.count()) === 5) {
        const box = await nav.boundingBox();
        expect(box, "bottom nav should be laid out").not.toBeNull();
        expect(box!.y, "bottom nav sits in the lower half of the screen").toBeGreaterThan(400);
        found = true;
        break;
      }
    }
    expect(found, "a visible navigation with exactly 5 links").toBe(true);

    const wordmark = page.getByText(/^secuabase$/i).or(page.getByRole("img", { name: /^secuabase$/i }));
    for (let i = 0; i < (await wordmark.count()); i++) {
      await expect(wordmark.nth(i)).toBeHidden();
    }
  });

  test("avatar menu has a light/dark toggle that switches the dark class", async ({ page }) => {
    const avatar = page
      .getByRole("button", { name: /account|menu|avatar|profile|AW|Anna/i })
      .filter({ hasNotText: /log in/i })
      .first();
    await avatar.click();

    const toggle = page
      .getByRole("menuitem", { name: /dark|light|theme/i })
      .or(page.getByRole("menuitemcheckbox", { name: /dark|light|theme/i }))
      .or(page.getByRole("switch", { name: /dark|light|theme/i }))
      .or(page.getByRole("button", { name: /dark|light|theme/i }))
      .first();
    await expect(toggle).toBeVisible();

    const html = page.locator("html");
    const wasDark = ((await html.getAttribute("class")) ?? "").split(/\s+/).includes("dark");
    await toggle.click();
    if (wasDark) {
      await expect(html).not.toHaveClass(/\bdark\b/);
    } else {
      await expect(html).toHaveClass(/\bdark\b/);
    }
  });

  test("/app/products shows the title and the empty state", async ({ page }) => {
    await page.goto("/app/products");
    await expect(page.getByRole("heading", { name: /products/i }).first()).toBeVisible();
    await expect(page.getByText(/nothing here yet/i).first()).toBeVisible();
  });
});
