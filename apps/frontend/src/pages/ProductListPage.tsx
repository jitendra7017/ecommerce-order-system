import { useCallback, useMemo } from "react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useProductListing } from "@/features/products/useProductListing";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { useToast } from "@/shared/ui/toast/ToastProvider";

export const ProductListPage = () => {
  const {
    search,
    page,
    categoryIdText,
    updateSearch,
    updateCategory,
    updatePage,
    productsQuery,
    categoriesQuery,
    cartQuantitiesQuery,
    addToCartMutation,
    changeQuantityMutation,
    refreshCartQuantities,
  } = useProductListing();
  const toast = useToast();
  const productPage = productsQuery.data;
  const products = useMemo(() => productPage?.items ?? [], [productPage?.items]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const total = productPage?.total ?? 0;
  const limit = productPage?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isFiltering = productsQuery.isFetching;
  const cartQuantities = cartQuantitiesQuery.data ?? {};
  const busy = addToCartMutation.isPending || changeQuantityMutation.isPending;
  const onAddToCart = useCallback(
    (productId: number) => {
      addToCartMutation.mutate(productId, {
        onSuccess: async () => {
          await refreshCartQuantities();
          toast.success("Added to cart");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Add to cart failed");
        },
      });
    },
    [addToCartMutation, refreshCartQuantities, toast],
  );

  const onIncrement = useCallback(
    (productId: number, currentQty: number, stock: number) => {
      if (currentQty >= stock) return;
      changeQuantityMutation.mutate(
        { productId, nextQuantity: currentQty + 1 },
        {
          onSuccess: async () => {
            await refreshCartQuantities();
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to update cart");
          },
        },
      );
    },
    [changeQuantityMutation, refreshCartQuantities, toast],
  );

  const onDecrement = useCallback(
    (productId: number, currentQty: number) => {
      changeQuantityMutation.mutate(
        { productId, nextQuantity: Math.max(0, currentQty - 1) },
        {
          onSuccess: async () => {
            await refreshCartQuantities();
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to update cart");
          },
        },
      );
    },
    [changeQuantityMutation, refreshCartQuantities, toast],
  );

  if (productsQuery.isLoading && !productsQuery.data) {
    return <p>Loading products...</p>;
  }

  if (productsQuery.isError) {
    return <p>{productsQuery.error instanceof Error ? productsQuery.error.message : "Failed to load products"}</p>;
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Products</h2>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="product-search">Search</label>
          <input
            id="product-search"
            className="input"
            placeholder="Search by name"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="product-category">Category</label>
          <select
            id="product-category"
            className="input"
            aria-label="Category"
            value={categoryIdText}
            onChange={(e) => updateCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? <p>No products found</p> : null}

      <div className={`cards-grid ${isFiltering ? "cards-grid-fetching" : ""}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={cartQuantities[product.id] ?? 0}
            busy={busy}
            onAddToCart={onAddToCart}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ))}
        {isFiltering
          ? Array.from({ length: 2 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="card card-skeleton" aria-hidden="true" />
            ))
          : null}
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={updatePage} />

    </section>
  );
};
