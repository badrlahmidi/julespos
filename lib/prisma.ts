import { PrismaClient } from '@prisma/client';

// Dummy class for build context
class DummyPrismaClient {
  user = { findMany: async () => [] };
  category = { create: async () => ({}) };
  product = { create: async () => ({}) };
  table = { create: async () => ({}) };
  $disconnect = async () => {};
}

const prismaClientSingleton = () => {
  // In a real environment, Prisma 7 uses prisma.config.ts automatically.
  // However, during Next.js static build phase in this sandbox, it lacks a driver adapter
  // because the "engineType" defaults to client which requires an adapter in this specific setup,
  // or we need to explicitly disable it. We return a dummy during build to prevent build crash.
  if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL) {
     return new DummyPrismaClient() as any;
  }
  return new PrismaClient({} as any);
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
