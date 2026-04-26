import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number({ error: "Price is required" }).min(0, "Price must be 0 or greater"),
  stock: z
    .number({ error: "Stock is required" })
    .int("Stock must be a whole number")
    .min(0, "Stock must be 0 or greater"),
  categoryId: z.number().int().positive("Category is required"),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

