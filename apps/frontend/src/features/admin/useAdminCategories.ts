import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "./adminService";
import type { CreateCategoryRequest } from "@/features/categories/types";

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin.categories.list"],
    queryFn: () => adminService.listCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => adminService.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin.categories.list"] });
    },
  });

  return { categoriesQuery, createMutation };
}
