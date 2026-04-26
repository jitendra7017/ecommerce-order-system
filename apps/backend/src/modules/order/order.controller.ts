import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendSuccess } from "../../lib/http-response.js";
import { orderService } from "./order.service.js";

export const orderController = {
  async create(req: Request, res: Response) {
    const data = await orderService.create(req.user!.id);
    sendSuccess(res, HTTP_STATUS.CREATED, req.t("ORDER.PLACED"), data);
  },
  async list(req: Request, res: Response) {
    const data = await orderService.list(req.user!.id, req.query as unknown as { page?: number; limit?: number });
    sendSuccess(res, HTTP_STATUS.OK, req.t("ORDER.FETCHED"), data);
  },
  async cancel(req: Request, res: Response) {
    const data = await orderService.cancel(req.user!.id, Number(req.params.id));
    sendSuccess(res, HTTP_STATUS.OK, req.t("ORDER.CANCELLED"), data);
  },
};
