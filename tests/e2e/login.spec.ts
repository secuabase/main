import { expect, test, type Page } from "@playwright/test";
import {
  SEED_PASSWORD,
  emailField,
  errorLine,
  login,
  passwordField,
  segment,
  submitPasswordLogin,
  users,
} from "./helpers";

/** The setup-2fa page shows a QR image or the base32 secret key. */
function setupTwoFactorEvidence(page: Page) {
  const qr = page
    .getByRole("img", { name: /qr/i })
    .or(page.locator('img[src^="data:image/"]'))
    .or(page.locator('canvas, svg[aria-label*="QR" i]'));
  const secret = page.getByText(/\b[A-Z2-7]{16,}\b/);
  return qr.or(secret).first();
}

test.describe("Login page", () => {
  test("shows the log in card with both ways to sign in", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
    await expect(segment(page, /^password$/i)).toBeVisible();
    await expect(segment(page, /email me a link/i)).toBeVisible();
    await expect(emailField(page)).toBeVisible();
    await expect(passwordField(page)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /remember this device/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("hero shows two KPI tiles and no languages tile", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText(/74\s*%/).first()).toBeVisible();
    await expect(page.getByText(/48\s*\/\s*62/).first()).toBeVisible();
    await expect(page.getByText(/8 languages/i)).toHaveCount(0);
  });

  test("wrong password shows a plain English error and stays on the login page", async ({ page }) => {
    await submitPasswordLogin(page, users.anna.email, "definitely-not-the-password");

    const error = errorLine(page);
    await expect(error).toBeVisible();
    const text = (await error.textContent())?.trim() ?? "";
    expect(text.length).toBeGreaterThan(5);
    // Not a raw API error dumped on screen.
    expect(text).not.toMatch(/AuthApiError|invalid_credentials|\{|\}|status code/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("Anna (client owner) lands on /app and sees her greeting", async ({ page }) => {
    await login(page, users.anna.email);

    await expect(page).toHaveURL(/\/app(\/|\?|$)/);
    await expect(page.getByText(/Good (morning|afternoon|evening)[^.]*Anna/i).first()).toBeVisible();
  });

  // The admin tests run on desktop only: both projects enrolling TOTP at the same time
  // makes Supabase reject the second enroll, which is a test artefact, not an app bug.
  test("admin without 2FA lands on /admin/setup-2fa with a QR code or secret", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only (avoids concurrent TOTP enroll)");
    await login(page, users.admin.email);

    await expect(page).toHaveURL(/\/admin\/setup-2fa/);
    await expect(setupTwoFactorEvidence(page)).toBeVisible();
  });

  test("admin without 2FA who opens /admin directly is sent to /admin/setup-2fa", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only (avoids concurrent TOTP enroll)");
    await login(page, users.admin.email);
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/admin\/setup-2fa/);
    await expect(setupTwoFactorEvidence(page)).toBeVisible();
  });

  test("viewer lands on /app", async ({ page }) => {
    await login(page, users.viewer.email);
    await expect(page).toHaveURL(/\/app(\/|\?|$)/);
  });

  test("Kettle & Co owner lands on /app", async ({ page }) => {
    await login(page, users.kettleOwner.email);
    await expect(page).toHaveURL(/\/app(\/|\?|$)/);
  });

  test("Email me a link goes to the check-email page with the address", async ({ page }, testInfo) => {
    // Supabase allows one login link per address per 60 s, so each project uses its own seeded user.
    const email = testInfo.project.name === "phone" ? users.editor.email : users.anna.email;

    await page.goto("/login");
    await segment(page, /email me a link/i).click();
    await emailField(page).fill(email);

    const submit = page
      .getByRole("button", { name: /email me a (login )?link|send( me)?( a| the)? (login )?link/i })
      .or(page.getByRole("button", { name: /^log in$/i }))
      .first();
    await submit.click();

    const rateLimited = page.getByText(/too many tries|wait a minute|after \d+ seconds/i).first();
    await expect(page.getByText(/check your email/i).first().or(rateLimited)).toBeVisible({ timeout: 20_000 });
    if (await rateLimited.isVisible()) {
      testInfo.skip(true, `Supabase rate limit, re-run in a minute: "${(await rateLimited.textContent())?.trim()}"`);
    }

    await expect(page).toHaveURL(/\/check-email\?/);
    expect(new URL(page.url()).searchParams.get("email")).toBe(email);
  });

  test("seed password is loaded from the environment", async () => {
    expect(SEED_PASSWORD.length).toBeGreaterThan(8);
  });
});
