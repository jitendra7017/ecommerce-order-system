import { loginSchema, registerSchema } from "../src/modules/auth/auth.types.js";

describe("auth joi validation", () => {
  test("register schema accepts valid payload", () => {
    const result = registerSchema.validate({
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.error).toBeUndefined();
  });

  test("register schema rejects invalid email", () => {
    const result = registerSchema.validate({
      firstName: "Test",
      lastName: "User",
      email: "bad-email",
      password: "secret123",
    });
    expect(result.error).toBeDefined();
  });

  test("login schema rejects short password", () => {
    const result = loginSchema.validate({ email: "user@example.com", password: "123" });
    expect(result.error).toBeDefined();
  });
});
