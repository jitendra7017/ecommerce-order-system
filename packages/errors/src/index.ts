export const ERROR_CODE = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  CART_EMPTY: "CART_EMPTY",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  ORDER_ALREADY_CANCELLED: "ORDER_ALREADY_CANCELLED",
  ORDER_CANCEL_FAILED: "ORDER_CANCEL_FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export class AppError extends Error {
  code: ErrorCode;
  context?: Record<string, unknown>;

  constructor(code: ErrorCode, context?: Record<string, unknown>) {
    super(code);
    this.code = code;
    this.context = context;
  }
}
