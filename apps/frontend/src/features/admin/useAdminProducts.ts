import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "./adminService";
import type { UpsertProductRequest } from "@/features/products/types";

export function useAdminProducts(page = 1, limit = 10) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin.categories.list"],
    queryFn: () => adminService.listCategories(),
  });

  const productsQuery = useQuery({
    queryKey: ["admin.products.list", { page, limit }],
    queryFn: () => adminService.listProducts({ page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: UpsertProductRequest) => adminService.createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin.products.list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpsertProductRequest }) =>
      adminService.updateProduct(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin.products.list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin.products.list"] });
    },
  });

  return { categoriesQuery, productsQuery, createMutation, updateMutation, deleteMutation };
}

