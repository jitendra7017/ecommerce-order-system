import { Prisma } from "@prisma/client";
import { AppError, ERROR_CODE } from "@repo/errors";
import type { CheckoutCartLine, LockedProductRow, OrderTransactionClient } from "./order.types.js";

/**
 * Locks the user's cart row first so concurrent checkout requests for the same user are
 * serialized at the database. The first transaction to clear the cart causes any waiters to
 * read an empty cart afterward, providing idempotency against double-submit / retries without
 * creating duplicate orders.
 */
export async function lockUserCartRowOrThrow(
  tx: OrderTransactionClient,
  userId: number,
): Promise<number> {
  const rows = await tx.$queryRaw<{ id: number }[]>`
    SELECT id FROM Cart WHERE userId = ${userId} LIMIT 1 FOR UPDATE
  `;
  const cartId = rows[0]?.id;
  if (cartId == null) {
    throw new AppError(ERROR_CODE.CART_EMPTY);
  }
  return cartId;
}

/**
 * Loads and locks matching Product rows under the same DB transaction.
 *
 * Pessimistic row locks (FOR UPDATE) are required for inventory: without them, two transactions
 * could both read stock=1, both pass validation, and both decrement—overselling. With locks,
 * the second transaction blocks until the first commits, then re-reads authoritative stock.
 */
export async function selectLockedProductRows(
  tx: OrderTransactionClient,
  productIds: number[],
): Promise<LockedProductRow[]> {
  if (productIds.length === 0) {
    return [];
  }

  const rows = await tx.$queryRaw<{ id: unknown; stock: unknown; price: unknown }[]>`
    SELECT id, stock, price
    FROM Product
    WHERE id IN (${Prisma.join(productIds)})
      AND deletedAt IS NULL
    FOR UPDATE
  `;

  return rows.map((row) => ({
    id: Number(row.id),
    stock: Number(row.stock),
    price: new Prisma.Decimal(row.price as string | number),
  }));
}

export function indexProductsById(rows: LockedProductRow[]): Map<number, LockedProductRow> {
  return new Map(rows.map((row) => [row.id, row]));
}

export function validateStockForCheckout(
  lines: CheckoutCartLine[],
  productById: Map<number, LockedProductRow>,
): void {
  for (const line of lines) {
    const product = productById.get(line.productId);
    if (!product || product.stock < line.quantity) {
      throw new AppError(ERROR_CODE.INSUFFICIENT_STOCK, {
        productId: line.productId,
        requestedQuantity: line.quantity,
        availableStock: product?.stock ?? 0,
      });
    }
  }
}

export function computeOrderTotal(
  lines: CheckoutCartLine[],
  productById: Map<number, LockedProductRow>,
): Prisma.Decimal {
  return lines.reduce((sum, line) => {
    const product = productById.get(line.productId)!;
    return sum.add(product.price.mul(line.quantity));
  }, new Prisma.Decimal(0));
}

export async function decrementStockForLines(
  tx: OrderTransactionClient,
  lines: CheckoutCartLine[],
): Promise<void> {
  await Promise.all(
    lines.map((line) =>
      tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      }),
    ),
  );
}

export async function incrementStockForOrderItems(
  tx: OrderTransactionClient,
  items: { productId: number; quantity: number }[],
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }),
    ),
  );
}
