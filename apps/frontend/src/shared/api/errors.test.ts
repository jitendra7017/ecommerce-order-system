import { describe, expect, it } from "vitest";
import { parseAxiosError } from "./errors";

describe("parseAxiosError", () => {
  it("prefers backend envelope message when present", () => {
    const err = {
      response: {
        status: 400,
        data: { success: false, message: "Invalid payload", data: null },
      },
      message: "Request failed with status code 400",
    };

    const parsed = parseAxiosError(err);
    expect(parsed.name).toBe("ApiError");
    expect(parsed.message).toBe("Invalid payload");
    expect(parsed.status).toBe(400);
  });

  it("falls back to axios message when no envelope", () => {
    const err = {
      response: { status: 500, data: { foo: "bar" } },
      message: "Network error",
    };

    const parsed = parseAxiosError(err);
    expect(parsed.message).toBe("Network error");
    expect(parsed.status).toBe(500);
  });
});

