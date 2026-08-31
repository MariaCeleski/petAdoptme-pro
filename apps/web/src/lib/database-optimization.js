/**
 * Índices do Banco de Dados
 * 
 * Este arquivo documenta os índices otimizados criados
 * para melhorar a performance das queries mais frequentes.
 * 
 * Requirements: 16.2 (Optimized database indexes)
 */

/**
 * ÍNDICES CRIADOS NO SCHEMA PRISMA:
 * 
 * 1. Tabela PETS
 *    - @@index([species, status]) - Para buscas filtradas por espécie e status
 *    - @@index([size, status])    - Para buscas filtradas por tamanho e status
 *    - @@index([ownerId])         - Para buscar pets de um proprietário
 * 
 * 2. Tabela ADOPTIONS
 *    - @@index([status])          - Para consultar adoções por status
 *    - @@index([adopterId])       - Para encontrar adoções de um usuário
 *    - @@index([petId])           - Para adoções de um pet específico
 * 
 * 3. Tabela EMAIL_PREFERENCE
 *    - @@index([userId])          - Para buscar preferências por usuário
 *    - @@index([unsubscribeToken])- Para validar tokens de unsubscribe
 * 
 * 4. Tabela ADOPTER_SEARCH_PREFERENCE
 *    - @@index([userId])          - Para buscar preferências por usuário
 *    - @@index([isActive])        - Para filtrar preferências ativas
 * 
 * 5. Tabela NOTIFICATION_LOG
 *    - @@index([userId])          - Para histórico de notificações por usuário
 *    - @@index([petId])           - Para notificações de um pet
 *    - @@index([notificationType])- Para filtrar por tipo de notificação
 *    - @@index([sentAt])          - Para relatórios por período
 *    - @@unique([userId, petId, notificationType]) - Previne alertas duplicados
 */

/**
 * Operações de Maintenance do Banco de Dados
 */

import { prisma } from './prisma.js';

/**
 * Analisar performance das queries
 * Útil para identificar queries lentas e índices faltando
 * 
 * Em SQLite: EXPLAIN QUERY PLAN
 * Em PostgreSQL: EXPLAIN ANALYZE
 */
export async function analyzeQueryPerformance(query) {
  if (process.env.DATABASE_TYPE === 'postgresql') {
    // Para PostgreSQL
    try {
      const result = await prisma.$queryRaw`EXPLAIN ANALYZE ${prisma.$raw(query)}`;
      console.log('[Performance] Query Analysis:', result);
      return result;
    } catch (error) {
      console.error('[Performance] Erro ao analisar query:', error);
      return null;
    }
  } else {
    // Para SQLite - retorna plano de execução
    try {
      const result = await prisma.$queryRaw`EXPLAIN QUERY PLAN ${prisma.$raw(query)}`;
      console.log('[Performance] Query Plan:', result);
      return result;
    } catch (error) {
      console.error('[Performance] Erro ao analisar query:', error);
      return null;
    }
  }
}

/**
 * Executar VACUUM no SQLite para otimizar arquivo de banco
 * Deve ser executado periodicamente em produção
 */
export async function optimizeDatabase() {
  try {
    if (process.env.DATABASE_TYPE === 'sqlite') {
      await prisma.$executeRaw`VACUUM`;
      console.log('[Database] Otimização (VACUUM) concluída');
      return { success: true, message: 'VACUUM concluído com sucesso' };
    } else if (process.env.DATABASE_TYPE === 'postgresql') {
      await prisma.$executeRaw`VACUUM ANALYZE`;
      console.log('[Database] Otimização (VACUUM ANALYZE) concluída');
      return { success: true, message: 'VACUUM ANALYZE concluído com sucesso' };
    }
    return { success: false, message: 'Tipo de banco de dados desconhecido' };
  } catch (error) {
    console.error('[Database] Erro ao otimizar:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reconstruir índices para melhorar performance
 * Útil após muitas operações de UPDATE/DELETE
 */
export async function rebuildIndexes() {
  try {
    if (process.env.DATABASE_TYPE === 'sqlite') {
      // SQLite não tem comando REINDEX VERBOSE
      await prisma.$executeRaw`REINDEX`;
      console.log('[Database] Índices reconstruídos');
      return { success: true, message: 'Índices reconstruídos com sucesso' };
    } else if (process.env.DATABASE_TYPE === 'postgresql') {
      // PostgreSQL
      const indexes = [
        'idx_pet_species_status',
        'idx_pet_size_status',
        'idx_pet_owner_id',
        'idx_adoption_status',
        'idx_adoption_adopter_id',
        'idx_adoption_pet_id',
      ];

      for (const indexName of indexes) {
        try {
          await prisma.$executeRaw`REINDEX INDEX ${prisma.$raw(indexName)}`;
        } catch (error) {
          // Index might not exist, continue
          console.warn(`[Database] Índice ${indexName} não encontrado`);
        }
      }
      console.log('[Database] Índices reconstruídos');
      return { success: true, message: 'Índices reconstruídos com sucesso' };
    }
    return { success: false, message: 'Tipo de banco de dados desconhecido' };
  } catch (error) {
    console.error('[Database] Erro ao reconstruir índices:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obter estatísticas de tamanho do banco de dados
 */
export async function getDatabaseStats() {
  try {
    if (process.env.DATABASE_TYPE === 'postgresql') {
      const result = await prisma.$queryRaw`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size,
          n_live_tup AS row_count
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
      `;
      return { success: true, data: result };
    } else if (process.env.DATABASE_TYPE === 'sqlite') {
      // SQLite - informações básicas
      const result = await prisma.$queryRaw`
        SELECT
          name as tablename,
          pgsize as size
        FROM dbstat
        ORDER BY pgsize DESC
      `;
      return { success: true, data: result };
    }
    return { success: false, message: 'Tipo de banco de dados desconhecido' };
  } catch (error) {
    console.error('[Database] Erro ao obter estatísticas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar integridade das relações estrangeiras
 */
export async function checkDatabaseIntegrity() {
  try {
    if (process.env.DATABASE_TYPE === 'postgresql') {
      // Verificar referências órfãs
      const orphanedAdoptions = await prisma.$queryRaw`
        SELECT a.id
        FROM adoptions a
        LEFT JOIN pets p ON a.pet_id = p.id
        LEFT JOIN users u ON a.adopter_id = u.id
        WHERE p.id IS NULL OR u.id IS NULL
      `;

      const orphanedPets = await prisma.$queryRaw`
        SELECT p.id
        FROM pets p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE u.id IS NULL
      `;

      return {
        success: true,
        orphanedAdoptions: orphanedAdoptions.length,
        orphanedPets: orphanedPets.length,
        integrityOK: orphanedAdoptions.length === 0 && orphanedPets.length === 0,
      };
    }
    return { success: false, message: 'Verificação não suportada para este banco' };
  } catch (error) {
    console.error('[Database] Erro ao verificar integridade:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Otimizações recomendadas para diferentes tipos de queries
 */
export const QUERY_OPTIMIZATION_TIPS = {
  listingPets: {
    name: 'Listagem de Pets Disponíveis',
    tip: 'Use filtros species + status com índice composto para performance ótima',
    example: 'findAvailablePets({ filters: { species: \'DOG\', size: \'SMALL\' } })',
    indexUsed: 'pets(species, status), pets(size, status)',
  },
  userAdoptions: {
    name: 'Adoções de um Usuário',
    tip: 'Use índice em adopterId para acesso rápido',
    example: 'findAdoptionsByUser(userId)',
    indexUsed: 'adoptions(adopterId)',
  },
  ownerRequests: {
    name: 'Solicitações para um Proprietário',
    tip: 'Combine pets(ownerId) com adoptions(petId)',
    example: 'findAdoptionRequests(ownerId)',
    indexUsed: 'pets(ownerId), adoptions(petId)',
  },
  petDetails: {
    name: 'Detalhes de um Pet',
    tip: 'Eager load relacionamentos para evitar N+1 queries',
    example: 'findPetById(petId)',
    indexUsed: 'primary key',
  },
  statistics: {
    name: 'Estatísticas e Agregações',
    tip: 'Cache os resultados por 5-10 minutos para reduzir carga',
    example: 'getPetStatistics()',
    indexUsed: 'GroupBy usa índices automaticamente',
  },
};

/**
 * Recomendações de Performance para Desenvolvimento
 */
export const PERFORMANCE_CHECKLIST = [
  {
    item: 'Usar eager loading ao buscar relacionamentos',
    status: 'implemented',
    file: 'database-queries.js',
  },
  {
    item: 'Cache de queries com baixa frequência de mudança',
    status: 'implemented',
    file: 'database-queries.js',
  },
  {
    item: 'Índices otimizados no schema Prisma',
    status: 'implemented',
    file: 'schema.prisma',
  },
  {
    item: 'Connection pooling configurado',
    status: 'implemented',
    file: 'prisma.js',
  },
  {
    item: 'Transactions para operações multi-table',
    status: 'implemented',
    file: 'database-queries.js',
  },
  {
    item: 'Paginação implementada nas listagens',
    status: 'implemented',
    file: 'database-queries.js',
  },
  {
    item: 'Query logging apenas em desenvolvimento',
    status: 'implemented',
    file: 'prisma.js',
  },
];

/**
 * Exportar diagnósticos e tools de monitoramento
 */
export const databaseTools = {
  analyzeQueryPerformance,
  optimizeDatabase,
  rebuildIndexes,
  getDatabaseStats,
  checkDatabaseIntegrity,
};

export default databaseTools;
