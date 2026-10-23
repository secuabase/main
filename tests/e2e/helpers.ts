import { expect, type Locator, type Page } from "@playwright/test";

/** Password every seeded user gets (see scripts/seed.ts and .env.example). */
export const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Secuabase-Seed-2026!";

/** Seeded users from docs/phase-1-spec.md. */
export const users = {
  admin: { email: "hello@secuabase.com", firstName: "Bugra", role: "admin" },
  anna: { email: "anna@alpenhaus.de", firstName: "Anna", role: "owner" },
  editor: { email: "editor@alpenhaus.de", firstName: "", role: "editor" },
  viewer: { email: "viewer@alpenhaus.de", firstName: "", role: "viewer" },
  billing: { email: "billing@alpenhaus.de", firstName: "", role: "billing" },
  kettleOwner: { email: "owner@kettle.co", firstName: "", role: "owner" },
} as const;

/** Client nav items from the UI contract. */
export const clientNav = ["Home", "Products", "Suppliers", "Filings", "Assistant", "Billing"];

/** The Password / Email-me-a-link segmented control may be tabs, radios or buttons. */
export function segment(page: Page, name: RegExp): Locator {
  return page
    .getByRole("tab", { name })
    .or(page.getByRole("radio", { name }))
    .or(page.getByRole("button", { name }))
    .first();
}

export function emailField(page: Page): Locator {
  return page.getByLabel(/^(work )?e-?mail( address)?$/i).or(page.getByRole("textbox", { name: /e-?mail/i })).first();
}

export function passwordField(page: Page): Locator {
  return page.getByLabel(/^password$/i).or(page.locator('input[type="password"]')).first();
}

/** The error line under a form: role=alert or an aria-live region with text. */
export function errorLine(page: Page): Locator {
  return page.getByRole("alert").or(page.locator("[aria-live='polite'], [aria-live='assertive']")).filter({ hasText: /\S/ }).first();
}

/** Submit the password form on /login; resolves once the page leaves /login or shows an error. */
export async function submitPasswordLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
  const passwordTab = segment(page, /^password$/i);
  if ((await passwordTab.count()) > 0) {
    await passwordTab.click();
  }
  await emailField(page).fill(email);
  await passwordField(page).fill(password);
  await page.getByRole("button", { name: /^log in$/i }).click();
}

/** Log in with the seeded password and wait until the app leaves /login. */
export async function login(page: Page, email: string, password: string = SEED_PASSWORD) {
  await submitPasswordLogin(page, email, password);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}
