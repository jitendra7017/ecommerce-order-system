import type { USER_ROLES } from "@repo/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
export type RegisterResponse = { id: number; email: string; role: UserRole };

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };
