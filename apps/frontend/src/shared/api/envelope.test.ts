import { describe, expect, it } from "vitest";
import { unwrapApiResponse, ApiError } from "./envelope";

describe("unwrapApiResponse", () => {
  it("returns data for success=true", () => {
    expect(unwrapApiResponse({ success: true, message: "ok", data: { x: 1 } })).toEqual({ x: 1 });
  });

  it("throws ApiError for success=false", () => {
    expect(() => unwrapApiResponse({ success: false, message: "bad", data: null })).toThrow(ApiError);
  });
});

