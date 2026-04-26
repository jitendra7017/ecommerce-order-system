import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "../src/middleware/error.middleware.js";

function makeRes() {
  const res = {} as Response & { body?: unknown; statusCode?: number };
  res.status = ((code: number) => {
    res.statusCode = code;
    return res;
  }) as Response["status"];
  res.json = ((body: unknown) => {
    res.body = body;
    return res;
  }) as Response["json"];
  return res;
}

describe("error middleware", () => {
  test("maps Prisma P2025 to 404 envelope", () => {
    const err = { code: "P2025" } as Error & { code: string };

    const req = {
      t: (key: string) => (key === "COMMON.NOT_FOUND" ? "Not found" : key),
    } as unknown as Request;

    const res = makeRes();
    const next: NextFunction = () => undefined;
    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Not found", data: null });
  });
});

