import type { Response } from "express";
import { createErrorResponse, createSuccessResponse } from "@repo/utils";
import type { HttpStatusCode } from "../constants/http-status.js";

export const sendSuccess = <T>(
  res: Response,
  statusCode: HttpStatusCode,
  message: string,
  data: T,
) => res.status(statusCode).json(createSuccessResponse(message, data));

export const sendError = (res: Response, statusCode: HttpStatusCode, message: string) =>
  res.status(statusCode).json(createErrorResponse(message));
