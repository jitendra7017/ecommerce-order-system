import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { sendSuccess } from "../../lib/http-response.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req: Request, res: Response) {
    const data = await authService.register(req.body);
    sendSuccess(res, HTTP_STATUS.CREATED, req.t("AUTH.USER_REGISTERED"), data);
  },

  async login(req: Request, res: Response) {
    const data = await authService.login(req.body);
    sendSuccess(res, HTTP_STATUS.OK, req.t("AUTH.LOGIN_SUCCESS"), data);
  },
};
