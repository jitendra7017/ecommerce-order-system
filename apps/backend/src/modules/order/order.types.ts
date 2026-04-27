import type { Prisma } from "@prisma/client";

/** Cart line shape used inside checkout transactions (minimal fields). */
export type CheckoutCartLine = {
  productId: number;
  quantity: number;
};

/**
 * Row returned after locking Product rows with SELECT … FOR UPDATE.
 * Prices use Decimal to match inventory monetary precision.
 */
export type LockedProductRow = {
  id: number;
  stock: number;
  price: Prisma.Decimal;
};

/** Prisma interactive transaction client (repository operations). */
export type OrderTransactionClient = Omit<
  typeof import("../../lib/prisma.js").prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
