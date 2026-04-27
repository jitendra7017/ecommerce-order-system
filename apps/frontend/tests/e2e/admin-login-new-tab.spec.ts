import { test, expect } from "@playwright/test";

test("admin: login opens /admin in a new tab", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "admin123";

  await page.goto("/auth/login");

  const popupPromise = page.waitForEvent("popup");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  const adminPage = await popupPromise;
  await adminPage.waitForLoadState();
  await expect(adminPage).toHaveURL(/\/admin(\/)?$/);
  await expect(adminPage.getByRole("heading", { name: "Admin Panel" })).toBeVisible();
  await expect(adminPage.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

  // Original tab continues to products per current login flow
  await expect(page).toHaveURL(/\/products$/);
});
