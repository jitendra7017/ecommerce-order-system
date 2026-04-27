import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FullConfig } from "@playwright/test";
import { apiLogin, apiRegister } from "./utils/apiAuth";

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL ?? "e2e.customer@example.com";
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? "pw12345";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin123";

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL as string | undefined;
  if (!baseURL) throw new Error("Playwright baseURL missing in config");

  const storageDir = join(process.cwd(), "tests", "e2e", ".auth");
  await ensureDir(storageDir);

  // Customer: create if missing, then login
  try {
    await apiRegister(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
  } catch {
    // ok: user may already exist
  }
  const customerToken = await apiLogin(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

  // Admin: should exist from seed; if this fails it usually means DB isn't seeded.
  const adminToken = await apiLogin(ADMIN_EMAIL, ADMIN_PASSWORD);

  const origin = new URL(baseURL).origin;
  const mkState = (token: string) => ({
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [{ name: "token", value: token }],
      },
    ],
  });

  await writeFile(
    join(storageDir, "customer.json"),
    JSON.stringify(mkState(customerToken), null, 2),
    "utf-8",
  );
  await writeFile(
    join(storageDir, "admin.json"),
    JSON.stringify(mkState(adminToken), null, 2),
    "utf-8",
  );
}
