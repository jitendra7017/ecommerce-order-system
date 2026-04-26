import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { orderService } from "./orderService";

export function useOrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<number, boolean>>({});
  const pageText = searchParams.get("page") ?? "1";
  const parsedPage = Number(pageText);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = 10;

  const query = useQuery({
    queryKey: ["orders.list", { page, limit }],
    queryFn: () => orderService.list({ page, limit }),
  });

  const isExpanded = (orderId: number): boolean => Boolean(expandedOrderIds[orderId]);

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderIds((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return {
    query,
    page,
    isExpanded,
    toggleExpanded,
    updatePage,
  };
}

