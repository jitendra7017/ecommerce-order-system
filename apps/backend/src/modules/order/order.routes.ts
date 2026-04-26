import { Router } from "express";
import { USER_ROLES } from "@repo/constants";
import { authGuard, roleGuard } from "../../middleware/auth.middleware.js";
import { orderController } from "./order.controller.js";
import { asyncHandler } from "../../middleware/async-handler.js";

export const orderRouter = Router();
orderRouter.use(authGuard);
orderRouter.use(roleGuard(USER_ROLES.CUSTOMER));
orderRouter.get("/", asyncHandler(orderController.list));
orderRouter.post("/", asyncHandler(orderController.create));
orderRouter.post("/:id/cancel", asyncHandler(orderController.cancel));
