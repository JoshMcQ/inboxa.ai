import { env } from "@/env";
import { PrismaClient } from "@prisma/client";
import { encryptedTokens } from "@/utils/prisma-extensions";

declare global {
  var prisma: PrismaClient | undefined;
}

// Append pgbouncer=true to disable prepared statements for Supabase transaction pooler
const databaseUrl = env.DATABASE_URL.includes("?")
  ? `${env.DATABASE_URL}&pgbouncer=true`
  : `${env.DATABASE_URL}?pgbouncer=true`;

// Create the Prisma client with extensions, but cast it back to PrismaClient for type compatibility
const _prisma =
  global.prisma ||
  (new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends(encryptedTokens) as unknown as PrismaClient);

if (env.NODE_ENV === "development") global.prisma = _prisma;

export default _prisma;
