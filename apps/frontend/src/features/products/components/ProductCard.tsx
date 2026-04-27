import { memo } from "react";
import type { Product } from "@repo/types";

type ProductCardProps = {
  product: Product;
  busy: boolean;
  quantity: number;
  onAddToCart: (productId: number) => void;
  onIncrement: (productId: number, currentQty: number, stock: number) => void;
  onDecrement: (productId: number, currentQty: number) => void;
};

export const ProductCard = memo(function ProductCard({
  product,
  busy,
  quantity,
  onAddToCart,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const description = product.description?.trim() || "No description available";

  return (
    <article aria-label={`product-${product.id}`} className="card">
      <h3>{product.name}</h3>
      <p className="muted">{description}</p>
      <p className="muted">${product.price}</p>
      <p>{product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}</p>
      {quantity > 0 ? (
        <div
          className="qty-stepper"
          role="group"
          aria-label={`Quantity selector for ${product.name}`}
        >
          <button
            type="button"
            className="qty-stepper-btn"
            aria-label={`Decrease ${product.name} quantity`}
            disabled={busy}
            onClick={() => onDecrement(product.id, quantity)}
          >
            -
          </button>
          <span className="qty-stepper-value" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="qty-stepper-btn"
            aria-label={`Increase ${product.name} quantity`}
            disabled={busy || quantity >= product.stock}
            onClick={() => onIncrement(product.id, quantity, product.stock)}
          >
            +
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          disabled={product.stock <= 0 || busy}
          aria-label={`Add ${product.name} to cart`}
          onClick={() => onAddToCart(product.id)}
        >
          Add to cart
        </button>
      )}
    </article>
  );
});
