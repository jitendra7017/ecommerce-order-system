import { Router } from "express";
import { productController } from "./product.controller.js";
import { authGuard, roleGuard } from "../../middleware/auth.middleware.js";
import { USER_ROLES } from "@repo/constants";
import { upsertProductSchema } from "./product.types.js";
import { validate } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/async-handler.js";

export const productRouter = Router();

productRouter.get("/", asyncHandler(productController.list));
productRouter.post(
  "/",
  authGuard,
  roleGuard(USER_ROLES.ADMIN),
  validate(upsertProductSchema),
  asyncHandler(productController.create),
);
productRouter.put(
  "/:id",
  authGuard,
  roleGuard(USER_ROLES.ADMIN),
  validate(upsertProductSchema),
  asyncHandler(productController.update),
);
productRouter.delete(
  "/:id",
  authGuard,
  roleGuard(USER_ROLES.ADMIN),
  asyncHandler(productController.remove),
);
