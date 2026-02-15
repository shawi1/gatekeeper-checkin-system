// Requirements: Database client export for all applications
// Purpose: Single source of truth for Prisma client instance

import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export Prisma types for type safety
export * from '@prisma/client';
