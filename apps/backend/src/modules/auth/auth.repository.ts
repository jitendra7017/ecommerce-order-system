import { USER_ROLES } from "@repo/constants";
import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    }),

  findById: (id: number) =>
    prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    }),

  createUser: (payload: { firstName: string; lastName: string; email: string; password: string }) =>
    prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: USER_ROLES.CUSTOMER,
      },
    }),
};
