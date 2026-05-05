import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const FALLBACK_DB =
  "mongodb://127.0.0.1:27017/bmp_build_placeholder";

if (
  typeof process.env.DATABASE_URL !== "string" ||
  process.env.DATABASE_URL.trim() === ""
) {
  process.env.DATABASE_URL = FALLBACK_DB;
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
