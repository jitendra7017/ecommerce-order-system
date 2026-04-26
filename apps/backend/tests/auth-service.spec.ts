/// <reference types="jest" />
import * as repoAuth from "@repo/auth";
import { authService } from "../src/modules/auth/auth.service.js";
import { authRepository } from "../src/modules/auth/auth.repository.js";

jest.mock("@repo/auth");

describe("authService", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/test";
    jest.clearAllMocks();
  });

  test("register creates a new customer user", async () => {
    jest.spyOn(authRepository, "findByEmail").mockResolvedValue(null as never);
    jest.spyOn(repoAuth, "hashPassword").mockResolvedValue("hashed" as never);
    jest.spyOn(authRepository, "createUser").mockResolvedValue({
      id: 1,
      email: "user@example.com",
      role: "customer",
    } as never);

    const result = await authService.register({
      firstName: "John",
      lastName: "Doe",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result).toEqual({ id: 1, email: "user@example.com", role: "customer" });
  });

  test("login returns JWT token for valid credentials", async () => {
    jest.spyOn(authRepository, "findByEmail").mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password: "hashed",
      role: "customer",
    } as never);
    jest.spyOn(repoAuth, "verifyPassword").mockResolvedValue(true as never);
    jest.spyOn(repoAuth, "signUserToken").mockReturnValue("jwt-token");

    const result = await authService.login({ email: "user@example.com", password: "secret123" });
    expect(result).toEqual({ token: "jwt-token" });
  });
});
