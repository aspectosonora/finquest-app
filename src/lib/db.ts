import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePath = rawUrl.replace(/^file:/, "");
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
