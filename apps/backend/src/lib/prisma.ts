import prismaClientPkg from "@prisma/client";
import { env } from "../config/env.js";

const { PrismaClient } = prismaClientPkg;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
});
