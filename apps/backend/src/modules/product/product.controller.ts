import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendSuccess } from "../../lib/http-response.js";
import { productService } from "./product.service.js";

export const productController = {
  async create(req: Request, res: Response) {
    const data = await productService.create(req.body);
    sendSuccess(res, HTTP_STATUS.CREATED, req.t("PRODUCT.CREATED"), data);
  },

  async update(req: Request, res: Response) {
    const data = await productService.update(Number(req.params.id), req.body);
    sendSuccess(res, HTTP_STATUS.OK, req.t("PRODUCT.UPDATED"), data);
  },

  async remove(req: Request, res: Response) {
    await productService.remove(Number(req.params.id));
    sendSuccess(res, HTTP_STATUS.OK, req.t("PRODUCT.DELETED"), null);
  },

  async list(req: Request, res: Response) {
    const data = await productService.list(
      req.query as unknown as {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
      },
    );
    sendSuccess(res, HTTP_STATUS.OK, req.t("PRODUCT.FETCHED"), data);
  },
};
