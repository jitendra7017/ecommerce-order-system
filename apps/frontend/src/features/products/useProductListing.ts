import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categoryService } from "@/features/categories/categoryService";
import { cartService } from "@/features/cart/cartService";
import { guestCartService } from "@/features/cart/guestCartService";
import { getSession } from "@/shared/auth/session";
import { productService } from "./productService";

export function useProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get("search") ?? "";
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const categoryIdText = searchParams.get("categoryId") ?? "";
  const pageText = searchParams.get("page") ?? "1";
  const parsedPage = Number(pageText);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const parsedCategory = Number(categoryIdText);
  const categoryId =
    Number.isInteger(parsedCategory) && parsedCategory > 0 ? parsedCategory : undefined;
  const limit = 12;
  const session = getSession();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const productsQuery = useQuery({
    queryKey: ["products.list", { search: debouncedSearch, categoryId, page, limit }],
    queryFn: () =>
      productService.list({
        search: debouncedSearch || undefined,
        categoryId,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories.list"],
    queryFn: () => categoryService.list(),
  });

  const cartQuantitiesQuery = useQuery({
    queryKey: ["cart.quantities", session ? "user" : "guest"],
    queryFn: async () => {
      if (!session) {
        const items = guestCartService.listItems();
        return items.reduce<Record<number, number>>((acc, item) => {
          acc[item.productId] = item.quantity;
          return acc;
        }, {});
      }

      const cart = await cartService.get();
      return cart.items.reduce<Record<number, number>>((acc, item) => {
        acc[item.productId] = item.quantity;
        return acc;
      }, {});
    },
    initialData: {},
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      const product = productsQuery.data?.items.find((item) => item.id === productId);
      if (!product) throw new Error("Product not found");

      if (!session) {
        guestCartService.add({
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.price),
          stock: product.stock,
        });
        return;
      }

      await cartService.add({ productId, quantity: 1 });
    },
  });

  const changeQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      nextQuantity,
    }: {
      productId: number;
      nextQuantity: number;
    }) => {
      if (!session) {
        if (nextQuantity <= 0) {
          guestCartService.remove(productId);
          return;
        }
        guestCartService.update(productId, nextQuantity);
        return;
      }

      if (nextQuantity <= 0) {
        await cartService.remove(productId);
        return;
      }

      await cartService.update(productId, { quantity: nextQuantity });
    },
  });

  const refreshCartQuantities = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cart.quantities"] });
    await queryClient.invalidateQueries({ queryKey: ["cart.get"] });
  };

  const updateSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim().length === 0) next.delete("search");
    else next.set("search", value);
    next.delete("page");
    setSearchParams(next);
  };

  const updateCategory = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete("categoryId");
    else next.set("categoryId", value);
    next.delete("page");
    setSearchParams(next);
  };

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return {
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
  };
}
