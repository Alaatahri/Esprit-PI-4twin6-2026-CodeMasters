import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL est requis pour Prisma (stock / marketplace). Ajoutez-la dans Vercel → Settings → Environment Variables."
    );
  }

  globalForPrisma.prisma = new PrismaClient();
  return globalForPrisma.prisma;
}

/** Instance lazy : évite d’instancier Prisma pendant `next build` si DATABASE_URL n’est pas encore défini. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export default prisma;
