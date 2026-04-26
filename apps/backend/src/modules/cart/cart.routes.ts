import { Router } from "express";
import { USER_ROLES } from "@repo/constants";
import { authGuard, roleGuard } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.js";
import { cartController } from "./cart.controller.js";
import { addToCartSchema, updateCartItemSchema } from "./cart.types.js";
import { asyncHandler } from "../../middleware/async-handler.js";

export const cartRouter = Router();

cartRouter.use(authGuard);
cartRouter.use(roleGuard(USER_ROLES.CUSTOMER));
cartRouter.get("/", asyncHandler(cartController.get));
cartRouter.post("/", validate(addToCartSchema), asyncHandler(cartController.add));
cartRouter.put("/:productId", validate(updateCartItemSchema), asyncHandler(cartController.update));
cartRouter.delete("/:productId", asyncHandler(cartController.remove));
