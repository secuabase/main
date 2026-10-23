import { expect, test, type Page } from "@playwright/test";
import { errorLine } from "./helpers";

const EMAIL = "a@b.c";

function codeInputs(page: Page) {
  return page.locator('input[inputmode="numeric"], input[autocomplete="one-time-code"], input[type="tel"]');
}

function otpSlots(page: Page) {
  return page.locator('[data-slot="input-otp-slot"], [data-input-otp-slot], [data-otp-slot]');
}

async function parseCountdown(page: Page): Promise<number> {
  const text = (await page.getByText(/send again in\s*\d+:\d\d/i).first().textContent()) ?? "";
  const m = text.match(/(\d+):(\d\d)/);
  if (!m) throw new Error(`No countdown found in "${text}"`);
  return Number(m[1]) * 60 + Number(m[2]);
}

test.describe("Check email page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/check-email?email=${encodeURIComponent(EMAIL)}`);
  });

  test("shows the heading and the address", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible();
    await expect(page.getByText(EMAIL).first()).toBeVisible();
  });

  test("has six code boxes", async ({ page }) => {
    const inputs = codeInputs(page);
    const count = await inputs.count();
    if (count === 6) {
      await expect(inputs.first()).toBeVisible();
    } else {
      // input-otp style: one input with six rendered slots
      expect(count, "one hidden input-otp input or six inputs").toBe(1);
      await expect(otpSlots(page)).toHaveCount(6);
    }
  });

  test("Send again is disabled while the countdown runs", async ({ page }) => {
    await expect(page.getByText(/send again in\s*\d+:\d\d/i).first()).toBeVisible();

    const first = await parseCountdown(page);
    await page.waitForTimeout(2_100);
    const later = await parseCountdown(page);
    expect(later).toBeLessThan(first);

    const sendAgain = page
      .getByRole("button", { name: /send again/i })
      .or(page.getByRole("link", { name: /send again/i }));
    if ((await sendAgain.count()) > 0) {
      const el = sendAgain.first();
      const disabled = (await el.isDisabled()) || (await el.getAttribute("aria-disabled")) === "true";
      expect(disabled, "Send again should not be active during the countdown").toBe(true);
    }
  });

  test("shows the 15 minutes pill", async ({ page }) => {
    await expect(page.getByText(/15 minutes/i).first()).toBeVisible();
  });

  test("a wrong 6-digit code shows an error line", async ({ page }) => {
    const inputs = codeInputs(page);
    const count = await inputs.count();

    if (count === 6) {
      await inputs.first().click();
      await page.keyboard.type("000000");
      // Fallback if the inputs do not auto-advance.
      if (((await inputs.last().inputValue()) ?? "") === "") {
        for (let i = 0; i < 6; i++) await inputs.nth(i).fill("0");
      }
    } else {
      await inputs.first().focus();
      await page.keyboard.type("000000");
    }

    const verify = page.getByRole("button", { name: /verify/i });
    if ((await verify.count()) > 0 && (await verify.first().isEnabled())) {
      await verify.first().click();
    }

    const error = errorLine(page);
    await expect(error).toBeVisible({ timeout: 15_000 });
    expect(((await error.textContent()) ?? "").trim().length).toBeGreaterThan(5);
  });
});
