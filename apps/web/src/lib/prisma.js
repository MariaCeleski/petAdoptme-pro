import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

/**
 * Inicializa Prisma Client com PostgreSQL via adapter
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const adapter = new PrismaPg({ 
    connectionString
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? [] // Don't log in development to reduce overhead
      : ['error'],
    errorFormat: 'pretty',
  });
}

export const prisma = globalForPrisma.prisma || (() => {
  try {
    return createPrismaClient();
  } catch (error) {
    console.error('[Prisma] Failed to initialize client:', error.message);
    throw error;
  }
})();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Handlers de shutdown gracioso (apenas em produção)
 */
if (process.env.NODE_ENV === 'production') {
  async function handleShutdown(signal) {
    console.log(`[Prisma] Recebido sinal ${signal}, encerrando conexões...`);
    try {
      await prisma.$disconnect();
      console.log('[Prisma] Desconexão concluída com sucesso');
      process.exit(0);
    } catch (error) {
      console.error('[Prisma] Erro ao desconectar:', error);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}