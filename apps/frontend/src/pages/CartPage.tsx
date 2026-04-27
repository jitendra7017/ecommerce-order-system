import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCartManagement } from "@/features/cart/useCartManagement";
import { useToast } from "@/shared/ui/toast/useToast";

export const CartPage = () => {
  const { isGuest, cartQuery, updateMutation, removeMutation, placeOrderMutation } =
    useCartManagement();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage =
    (updateMutation.error instanceof Error && updateMutation.error.message) ||
    (removeMutation.error instanceof Error && removeMutation.error.message) ||
    "";

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage, toast]);

  if (cartQuery.isLoading) return <p>Loading cart...</p>;
  if (cartQuery.isError) {
    return (
      <p>{cartQuery.error instanceof Error ? cartQuery.error.message : "Failed to load cart"}</p>
    );
  }

  const cart = cartQuery.data;
  const busy = updateMutation.isPending || removeMutation.isPending || placeOrderMutation.isPending;
  const handlePlaceOrder = () => {
    if (isGuest) {
      toast.info("Please sign in or register to place your order");
      navigate("/auth/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    placeOrderMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Order placed");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Place order failed");
      },
    });
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Cart</h2>
      {cart && cart.items.length === 0 ? <p>Your cart is empty.</p> : null}

      <div className="list-stack">
        {cart?.items.map((item) => (
          <article key={item.productId} className="list-item">
            <div>
              <h3>{item.name}</h3>
              <p>Qty: {item.quantity}</p>
              <p>Unit price: ${item.unitPrice}</p>
              <p>Subtotal: ${item.subtotal}</p>
            </div>
            <div className="inline-actions">
              <button
                className="btn btn-secondary"
                aria-label={`Decrease ${item.name} quantity`}
                disabled={busy || item.quantity <= 1}
                onClick={() =>
                  updateMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })
                }
              >
                -
              </button>
              <button
                className="btn btn-secondary"
                aria-label={`Increase ${item.name} quantity`}
                disabled={busy}
                onClick={() =>
                  updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })
                }
              >
                +
              </button>
              <button
                className="btn btn-danger"
                aria-label={`Remove ${item.name}`}
                disabled={busy}
                onClick={() => removeMutation.mutate(item.productId)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <h3 className="panel-title">Grand total: ${cart?.total ?? 0}</h3>

      <button
        className="btn btn-primary"
        disabled={busy || !cart || cart.items.length === 0}
        onClick={handlePlaceOrder}
      >
        Place order
      </button>
    </section>
  );
};
