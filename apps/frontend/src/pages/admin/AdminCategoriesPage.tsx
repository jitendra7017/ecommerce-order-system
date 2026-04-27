import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAdminCategories } from "@/features/admin/useAdminCategories";
import { adminCategorySchema } from "@/features/admin/schemas";
import type { CreateCategoryRequest } from "@/features/categories/types";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { useToast } from "@/shared/ui/toast/useToast";

export function AdminCategoriesPage() {
  const { categoriesQuery, createMutation } = useAdminCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const toast = useToast();
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCategoryRequest>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: CreateCategoryRequest) => {
    await createMutation.mutateAsync(values);
    reset();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (createMutation.isSuccess) {
      toast.success("Category created");
    }
  }, [createMutation.isSuccess, toast]);

  useEffect(() => {
    if (createMutation.isError) {
      toast.error(
        createMutation.error instanceof Error
          ? createMutation.error.message
          : "Category create failed",
      );
    }
  }, [createMutation.error, createMutation.isError, toast]);

  const busy = isSubmitting || createMutation.isPending;
  const categoryName = watch("name");
  const isSaveEnabled =
    !busy && typeof categoryName === "string" && categoryName.trim().length >= 2;
  const categories = categoriesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const visibleCategories = categories.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (categoriesQuery.isLoading) return <p>Loading categories...</p>;
  if (categoriesQuery.isError) {
    return (
      <p>
        {categoriesQuery.error instanceof Error
          ? categoriesQuery.error.message
          : "Failed to load categories"}
      </p>
    );
  }

  const openCreateModal = () => {
    reset({ name: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setIsModalOpen(false);
  };

  return (
    <section className="panel">
      <div className="panel-header-row">
        <h2 className="panel-title">Admin Categories</h2>
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          Create category
        </button>
      </div>

      <ul className="list-stack">
        {visibleCategories.map((category) => (
          <li key={category.id} className="list-item">
            {category.name}
          </li>
        ))}
      </ul>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      {isModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create category">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="panel-title">Create category</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={busy}
              >
                Close
              </button>
            </div>
            <form
              id="admin-category-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="form-grid"
            >
              <div className="form-field">
                <label htmlFor="category-name">
                  Name <span className="required-asterisk">*</span>
                </label>
                <input id="category-name" className="input" {...register("name")} />
                {errors.name?.message ? <p className="form-error">{errors.name.message}</p> : null}
              </div>
            </form>
            <div className="form-actions">
              <button
                type="submit"
                form="admin-category-form"
                className="btn btn-primary"
                disabled={!isSaveEnabled}
              >
                Save category
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
