import { prisma } from "../../lib/prisma.js";

export const productRepository = {
  getActiveById: (id: number) =>
    prisma.product.findFirst({
      where: { id, deletedAt: null },
    }),

  create: (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: number;
  }) => prisma.product.create({ data }),

  update: (
    id: number,
    data: { name: string; description?: string; price: number; stock: number; categoryId: number },
  ) => prisma.product.update({ where: { id }, data }),

  remove: (id: number) =>
    prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),

  list: (page: number, limit: number, search?: string, categoryId?: number) =>
    prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(search ? { name: { contains: search } } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

  count: (search?: string, categoryId?: number) =>
    prisma.product.count({
      where: {
        deletedAt: null,
        ...(search ? { name: { contains: search } } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
    }),
};
