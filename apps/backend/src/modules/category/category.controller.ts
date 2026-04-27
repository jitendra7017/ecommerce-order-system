import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendSuccess } from "../../lib/http-response.js";
import { categoryService } from "./category.service.js";

export const categoryController = {
  async create(req: Request, res: Response) {
    const data = await categoryService.create(req.body.name);
    sendSuccess(res, HTTP_STATUS.CREATED, req.t("CATEGORY.CREATED"), data);
  },

  async list(req: Request, res: Response) {
    const data = await categoryService.list();
    sendSuccess(res, HTTP_STATUS.OK, req.t("CATEGORY.FETCHED"), data);
  },
};
