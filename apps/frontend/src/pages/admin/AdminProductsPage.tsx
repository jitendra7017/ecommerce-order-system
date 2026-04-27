import { zodResolver } from "@hookform/resolvers/zod";
import { type FocusEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Product } from "@repo/types";
import type { UpsertProductRequest } from "@/features/products/types";
import { adminProductSchema } from "@/features/admin/schemas";
import { useAdminProducts } from "@/features/admin/useAdminProducts";
import { PaginationControls } from "@/shared/ui/PaginationControls";
import { useToast } from "@/shared/ui/toast/useToast";

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { categoriesQuery, productsQuery, createMutation, updateMutation, deleteMutation } =
    useAdminProducts(page, pageSize);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpsertProductRequest>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: { name: "", description: "", price: 0, stock: 0, categoryId: 0 },
    mode: "onChange",
  });

  useEffect(() => {
    if (!editing) return;
    setIsModalOpen(true);
    reset({
      name: editing.name,
      description: editing.description ?? "",
      price: Number(editing.price),
      stock: editing.stock,
      categoryId: editing.categoryId,
    });
  }, [editing, reset]);

  useEffect(() => {
    if (createMutation.isSuccess) {
      toast.success("Product created");
    }
  }, [createMutation.isSuccess, toast]);

  useEffect(() => {
    if (updateMutation.isSuccess) {
      toast.success("Product updated");
    }
  }, [toast, updateMutation.isSuccess]);

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      toast.success("Product deleted");
    }
  }, [deleteMutation.isSuccess, toast]);

  useEffect(() => {
    if (createMutation.isError) {
      toast.error(
        createMutation.error instanceof Error
          ? createMutation.error.message
          : "Product create failed",
      );
    }
  }, [createMutation.error, createMutation.isError, toast]);

  useEffect(() => {
    if (updateMutation.isError) {
      toast.error(
        updateMutation.error instanceof Error
          ? updateMutation.error.message
          : "Product update failed",
      );
    }
  }, [toast, updateMutation.error, updateMutation.isError]);

  useEffect(() => {
    if (deleteMutation.isError) {
      toast.error(
        deleteMutation.error instanceof Error
          ? deleteMutation.error.message
          : "Product delete failed",
      );
    }
  }, [deleteMutation.error, deleteMutation.isError, toast]);

  const onSubmit = async (values: UpsertProductRequest) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: values });
      setEditing(null);
    } else {
      await createMutation.mutateAsync(values);
    }
    reset({ name: "", description: "", price: 0, stock: 0, categoryId: 0 });
    setIsModalOpen(false);
  };

  const categories = categoriesQuery.data ?? [];
  const productPage = productsQuery.data;
  const products = productPage?.items ?? [];
  const total = productPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const busy =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const [name, price, stock, categoryId] = watch(["name", "price", "stock", "categoryId"]);
  const isSaveEnabled =
    !busy &&
    typeof name === "string" &&
    name.trim().length >= 2 &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    Number.isInteger(categoryId) &&
    categoryId > 0;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (productsQuery.isLoading) return <p>Loading products...</p>;
  if (productsQuery.isError) {
    return (
      <p>
        {productsQuery.error instanceof Error
          ? productsQuery.error.message
          : "Failed to load products"}
      </p>
    );
  }

  const openCreateModal = () => {
    setEditing(null);
    reset({ name: "", description: "", price: 0, stock: 0, categoryId: 0 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setEditing(null);
    reset({ name: "", description: "", price: 0, stock: 0, categoryId: 0 });
    setIsModalOpen(false);
  };

  const handleNumericFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  return (
    <section className="panel">
      <div className="panel-header-row">
        <h2 className="panel-title">Admin Products</h2>
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          Create product
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const categoryName =
                categories.find((c) => c.id === product.categoryId)?.name ?? "Unknown";
              return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description?.trim() || "No description"}</td>
                  <td>${Number(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{categoryName}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => setEditing(product)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      {isModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit product" : "Create product"}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="panel-title">{editing ? "Edit product" : "Create product"}</h3>
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
              id="admin-product-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="form-grid"
            >
              <div className="form-field">
                <label htmlFor="product-name">
                  Name <span className="required-asterisk">*</span>
                </label>
                <input id="product-name" className="input" {...register("name")} />
                {errors.name?.message ? <p className="form-error">{errors.name.message}</p> : null}
              </div>

              <div className="form-field">
                <label htmlFor="product-description">Description</label>
                <input id="product-description" className="input" {...register("description")} />
              </div>

              <div className="form-field">
                <label htmlFor="product-price">
                  Price <span className="required-asterisk">*</span>
                </label>
                <input
                  id="product-price"
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  onFocus={handleNumericFocus}
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price?.message ? (
                  <p className="form-error">{errors.price.message}</p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="product-stock">
                  Stock <span className="required-asterisk">*</span>
                </label>
                <input
                  id="product-stock"
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  onFocus={handleNumericFocus}
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock?.message ? (
                  <p className="form-error">{errors.stock.message}</p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="product-category">
                  Category <span className="required-asterisk">*</span>
                </label>
                <select
                  id="product-category"
                  className="input"
                  {...register("categoryId", { setValueAs: (v) => Number(v) })}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId?.message ? (
                  <p className="form-error">{errors.categoryId.message}</p>
                ) : null}
              </div>
            </form>

            <div className="form-actions">
              <button
                type="submit"
                form="admin-product-form"
                className="btn btn-primary"
                disabled={!isSaveEnabled}
              >
                {editing ? "Save changes" : "Save product"}
              </button>
              {editing ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={openCreateModal}
                >
                  Switch to create
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
