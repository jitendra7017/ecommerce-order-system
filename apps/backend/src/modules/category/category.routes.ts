import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authGuard, roleGuard } from "../../middleware/auth.middleware.js";
import { USER_ROLES } from "@repo/constants";
import { createCategorySchema } from "./category.types.js";
import { validate } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/async-handler.js";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(categoryController.list));
categoryRouter.post(
  "/",
  authGuard,
  roleGuard(USER_ROLES.ADMIN),
  validate(createCategorySchema),
  asyncHandler(categoryController.create),
);
