import { calculateTotal, createErrorResponse, createSuccessResponse, toPositiveInt } from "@repo/utils";

describe("shared utils", () => {
  test("calculateTotal returns expected sum", () => {
    expect(
      calculateTotal([
        { quantity: 2, unitPrice: 10 },
        { quantity: 3, unitPrice: 7.5 },
      ]),
    ).toBe(42.5);
  });

  test("response builders return consistent shape", () => {
    expect(createSuccessResponse("ok", { id: 1 })).toEqual({
      success: true,
      message: "ok",
      data: { id: 1 },
    });
    expect(createErrorResponse("bad")).toEqual({
      success: false,
      message: "bad",
      data: null,
    });
  });

  test("toPositiveInt returns fallback for invalid values", () => {
    expect(toPositiveInt("5", 1)).toBe(5);
    expect(toPositiveInt("-1", 1)).toBe(1);
    expect(toPositiveInt("abc", 3)).toBe(3);
  });
});
