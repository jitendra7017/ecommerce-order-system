import { ERROR_CODE, type ErrorCode } from "@repo/errors";
import { HTTP_STATUS } from "./http-status.js";
import type { HttpStatusCode } from "./http-status.js";
import type { MessageKey } from "../i18n/translate.js";

export const errorMap: Record<ErrorCode, { statusCode: HttpStatusCode; messageKey: MessageKey }> = {
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    messageKey: "COMMON.INTERNAL_SERVER_ERROR",
  },
  [ERROR_CODE.VALIDATION_ERROR]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "COMMON.INVALID_PAYLOAD",
  },
  [ERROR_CODE.UNAUTHORIZED]: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    messageKey: "AUTH.UNAUTHORIZED",
  },
  [ERROR_CODE.FORBIDDEN]: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    messageKey: "AUTH.FORBIDDEN",
  },
  [ERROR_CODE.INVALID_CREDENTIALS]: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    messageKey: "AUTH.INVALID_CREDENTIALS",
  },
  [ERROR_CODE.EMAIL_ALREADY_REGISTERED]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "AUTH.EMAIL_ALREADY_REGISTERED",
  },
  [ERROR_CODE.CART_EMPTY]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "ORDER.CART_EMPTY",
  },
  [ERROR_CODE.INSUFFICIENT_STOCK]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "ORDER.INSUFFICIENT_STOCK",
  },
  [ERROR_CODE.ORDER_NOT_FOUND]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "ORDER.NOT_FOUND",
  },
  [ERROR_CODE.ORDER_ALREADY_CANCELLED]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "ORDER.ALREADY_CANCELLED",
  },
  [ERROR_CODE.ORDER_CANCEL_FAILED]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    messageKey: "ORDER.CANCEL_FAILED",
  },
};
