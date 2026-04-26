import { useEffect, useState } from "react";
import type { Product } from "@repo/types";
import { productApi } from "../api/endpoints";

export const useProducts = (search: string, categoryId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.list({ search, categoryId }).then((res) => setProducts(res.data.data.items));
  }, [search, categoryId]);

  return { products };
};
