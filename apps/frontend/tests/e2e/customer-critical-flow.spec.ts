import { test, expect } from "@playwright/test";

function uniqueEmail(prefix = "e2e.customer") {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}.${stamp}@example.com`;
}

test("customer: register/login, browse, cart updates, place order, view history", async ({ page }) => {
  const email = uniqueEmail();
  const password = "pw12345";

  // Registration (UI)
  await page.goto("/auth/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Registration successful")).toBeVisible();

  // Login (UI)
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

  // Browse products + add to cart
  await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible();
  await page.getByRole("button", { name: "Add Laptop to cart" }).click();
  await expect(page.getByText("Added to cart")).toBeVisible();

  // Cart + update qty
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible();
  await expect(page.getByText("Qty: 1")).toBeVisible();

  await page.getByRole("button", { name: "Increase Laptop quantity" }).click();
  await expect(page.getByText("Qty: 2")).toBeVisible();

  // Remove item
  await page.getByRole("button", { name: "Remove Laptop" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();

  // Place order
  // (re-add so we can place)
  await page.goto("/products");
  await page.getByRole("button", { name: "Add Laptop to cart" }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Order placed")).toBeVisible();

  // Order history
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
  const firstOrder = page.getByRole("heading", { name: /Order #/ }).first();
  await expect(firstOrder).toBeVisible();

  // Expand items (assert at least one item line appears)
  const toggle = page.getByRole("button", { name: /View items for order/ }).first();
  await toggle.click();
  await expect(page.getByText(/Qty\s+\d+/).first()).toBeVisible();

  // Logout
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
});

