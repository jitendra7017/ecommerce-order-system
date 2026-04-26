import { test, expect } from "@playwright/test";

const adminState = "tests/e2e/.auth/admin.json";

function uniqueProductName() {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `E2E Product ${stamp}`;
}

test.describe("admin products CRUD (happy path)", () => {
  test.use({ storageState: adminState });

  test("create, edit, delete product", async ({ page }) => {
    const name = uniqueProductName();

    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: "Admin Products" })).toBeVisible();

    // Create
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Description").fill("created by playwright");
    await page.getByLabel("Price").fill("42.5");
    await page.getByLabel("Stock").fill("7");
    await page.getByLabel("Category").selectOption({ label: "Default" });
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByText("Product created")).toBeVisible();

    // Assert row exists
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toBeVisible();

    // Edit
    await page.getByRole("button", { name: `Edit ${name}` }).click();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
    await page.getByLabel("Price").fill("45");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Product updated")).toBeVisible();

    // Delete
    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByText("Product deleted")).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  });
});

