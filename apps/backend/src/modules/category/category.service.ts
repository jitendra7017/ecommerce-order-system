import { categoryRepository } from "./category.repository.js";

export const categoryService = {
  create: (name: string) => categoryRepository.create(name),
  list: () => categoryRepository.list(),
};
