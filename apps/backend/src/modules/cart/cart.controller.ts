import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendSuccess } from "../../lib/http-response.js";
import { cartService } from "./cart.service.js";

export const cartController = {
  async add(req: Request, res: Response) {
    const data = await cartService.add(req.user!.id, req.body.productId, req.body.quantity);
    sendSuccess(res, HTTP_STATUS.CREATED, req.t("CART.ITEM_ADDED"), data);
  },

  async update(req: Request, res: Response) {
    const data = await cartService.update(
      req.user!.id,
      Number(req.params.productId),
      req.body.quantity,
    );
    sendSuccess(res, HTTP_STATUS.OK, req.t("CART.ITEM_UPDATED"), data);
  },

  async remove(req: Request, res: Response) {
    await cartService.remove(req.user!.id, Number(req.params.productId));
    sendSuccess(res, HTTP_STATUS.OK, req.t("CART.ITEM_REMOVED"), null);
  },

  async get(req: Request, res: Response) {
    const data = await cartService.get(req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, req.t("CART.FETCHED"), data);
  },
};
