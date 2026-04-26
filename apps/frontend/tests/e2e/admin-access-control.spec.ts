import { test, expect } from "@playwright/test";

const adminState = "tests/e2e/.auth/admin.json";
const customerState = "tests/e2e/.auth/customer.json";

test("unauthenticated: /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test.describe("customer role", () => {
  test.use({ storageState: customerState });

  test("customer: /admin is blocked (redirect to /products)", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  });
});

test.describe("admin role", () => {
  test.use({ storageState: adminState });

  test("admin: can open /admin/products", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin Products" })).toBeVisible();
  });
});

