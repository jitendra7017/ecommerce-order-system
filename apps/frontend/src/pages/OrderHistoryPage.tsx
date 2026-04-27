import { useOrderHistory } from "@/features/orders/useOrderHistory";
import { formatDateTime } from "@repo/utils";
import { PaginationControls } from "@/shared/ui/PaginationControls";

export const OrderHistoryPage = () => {
  const { query, page, isExpanded, toggleExpanded, updatePage } = useOrderHistory();

  if (query.isLoading) return <p>Loading orders...</p>;
  if (query.isError) {
    return <p>{query.error instanceof Error ? query.error.message : "Failed to load orders"}</p>;
  }

  const orderPage = query.data;
  const orders = orderPage?.items ?? [];
  const total = orderPage?.total ?? 0;
  const limit = orderPage?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="panel">
      <h2 className="panel-title">Order history</h2>
      {orders.length === 0 ? <p>No orders found</p> : null}
      <div className="order-history-stack">
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <div className="order-header">
              <h3 className="order-title">Order #{order.id}</h3>
              <p className="order-total">${Number(order.totalAmount)}</p>
            </div>
            <div className="order-meta">
              <p>Status: {order.status}</p>
              <p>Placed at: {formatDateTime(order.createdAt)}</p>
              <p>Total: ${Number(order.totalAmount)}</p>
            </div>

            <button
              className="btn btn-secondary"
              aria-expanded={isExpanded(order.id)}
              aria-label={`${isExpanded(order.id) ? "Hide" : "View"} items for order ${order.id}`}
              onClick={() => toggleExpanded(order.id)}
            >
              {isExpanded(order.id) ? "Hide items" : "View items"}
            </button>

            {isExpanded(order.id) ? (
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <p className="order-item-name">Product {item.productId}</p>
                    <p className="order-item-meta">
                      Qty {item.quantity} <span aria-hidden="true">•</span> Unit $
                      {Number(item.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={updatePage} />
    </section>
  );
};
