import { prisma } from "../../lib/prisma.js";

export const categoryRepository = {
  create: (name: string) => prisma.category.create({ data: { name } }),
  list: () => prisma.category.findMany({ orderBy: { createdAt: "desc" } }),
};
