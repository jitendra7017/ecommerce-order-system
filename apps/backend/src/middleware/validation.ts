import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import { HTTP_STATUS } from "../constants/http-status.js";
import { sendError } from "../lib/http-response.js";

export const validate =
  (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });

    if (error) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.details[0]?.message ?? req.t("COMMON.INVALID_PAYLOAD"));
    }
    req.body = value;
    next();
  };
