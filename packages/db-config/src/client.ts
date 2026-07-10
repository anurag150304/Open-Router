import { env } from "@repo/env-config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
export default prisma;
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
