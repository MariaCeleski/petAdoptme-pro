/**
 * Utilitários de Otimização de Queries
 * 
 * Módulo responsável por otimizar queries e cachear dados frequentemente acessados.
 * Implementa boas práticas de query building, eager loading e query caching.
 * 
 * Requirements: 16.2 (Database optimization utilities)
 */

import { prisma } from './prisma.js';

/**
 * Cache simples para dados que mudam com baixa frequência
 * Em produção, isso seria Redis ou similar
 */
const queryCache = new Map();
const CACHE_TTL = {
  PETS_STATS: 5 * 60 * 1000,      // 5 minutos para estatísticas
  PET_CATEGORIES: 10 * 60 * 1000,  // 10 minutos para categorias
  SHELTERS: 15 * 60 * 1000,       // 15 minutos para abrigos
};

/**
 * Wrapper para caching de queries
 * @param {string} cacheKey - Chave única do cache
 * @param {Function} queryFn - Função que executa a query
 * @param {number} ttl - Time to live em ms
 * @returns {Promise} Resultado da query
 */
async function withCache(cacheKey, queryFn, ttl = CACHE_TTL.PETS_STATS) {
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Auto-cleanup do cache após TTL
  setTimeout(() => queryCache.delete(cacheKey), ttl);
  
  return data;
}

/**
 * Invalida cache por padrão de chave
 * @param {string|RegExp} pattern - Padrão de chave para invalidar
 */
function invalidateCache(pattern) {
  if (pattern instanceof RegExp) {
    for (const key of queryCache.keys()) {
      if (pattern.test(key)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.delete(pattern);
  }
}

/**
 * Otimizada: Buscar pets com filtros usando índices
 * 
 * Utiliza:
 * - Índice: pets(species, status)
 * - Índice: pets(size, status)
 * - Índice: pets(ownerId)
 * - Eager loading de relacionamentos
 */
export async function findAvailablePets({
  page = 1,
  limit = 12,
  filters = {},
} = {}) {
  const skip = (page - 1) * limit;

  // Build where clause com filtros
  const where = {
    status: 'APPROVED',
    ...(filters.species && { species: filters.species }),
    ...(filters.size && { size: filters.size }),
    ...(filters.gender && { gender: filters.gender }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { breed: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  };

  // Queries paralelas para melhor performance
  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            location: true,
            avatar: true,
          },
        },
        shelter: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pet.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data: pets,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Otimizada: Buscar um pet com todos os relacionamentos
 * Eagerly carrega dados para evitar N+1 queries
 */
export async function findPetById(petId) {
  return await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          avatar: true,
          type: true,
        },
      },
      shelter: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          phone: true,
          website: true,
          logo: true,
        },
      },
      adoptions: {
        where: { status: 'COMPLETED' },
        select: {
          id: true,
          createdAt: true,
          adopter: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
      },
    },
  });
}

/**
 * Otimizada: Estatísticas de pets com cache
 * Usa agregações do Prisma para performance
 */
export async function getPetStatistics() {
  return await withCache(
    'pet_stats',
    async () => {
      const [total, bySpecies, bySize, byStatus] = await Promise.all([
        prisma.pet.count(),
        prisma.pet.groupBy({
          by: ['species'],
          _count: true,
          where: { status: 'APPROVED' },
        }),
        prisma.pet.groupBy({
          by: ['size'],
          _count: true,
          where: { status: 'APPROVED' },
        }),
        prisma.pet.groupBy({
          by: ['status'],
          _count: true,
        }),
      ]);

      return {
        total,
        available: byStatus.find(s => s.status === 'APPROVED')?._count || 0,
        bySpecies: Object.fromEntries(
          bySpecies.map(s => [s.species, s._count])
        ),
        bySize: Object.fromEntries(bySize.map(s => [s.size, s._count])),
      };
    },
    CACHE_TTL.PETS_STATS
  );
}

/**
 * Otimizada: Buscar adoções com eager loading
 * Índice em adoptions(status, adopterId)
 */
export async function findAdoptionsByUser(userId, status = null) {
  const where = {
    adopterId: userId,
    ...(status && { status }),
  };

  return await prisma.adoption.findMany({
    where,
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          images: true,
          status: true,
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Otimizada: Buscar solicitações de adoção para um proprietário
 * Índice em adoptions(status, petId)
 */
export async function findAdoptionRequests(ownerId, status = null) {
  const where = {
    pet: { ownerId },
    ...(status && { status }),
  };

  return await prisma.adoption.findMany({
    where,
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          images: true,
        },
      },
      adopter: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Otimizada: Buscar pets de um proprietário/abrigo
 * Índice em pets(ownerId)
 */
export async function findPetsByOwner(ownerId, options = {}) {
  const { page = 1, limit = 20, status = null } = options;
  const skip = (page - 1) * limit;

  const where = {
    ownerId,
    ...(status && { status }),
  };

  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where,
      skip,
      take: limit,
      include: {
        adoptions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pet.count({ where }),
  ]);

  return {
    success: true,
    data: pets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Otimizada: Buscar abrigos com contagem de pets
 * Cache de 15 minutos
 */
export async function findShelters(options = {}) {
  return await withCache(
    'shelters_list',
    async () => {
      const { page = 1, limit = 20, verified = true } = options;
      const skip = (page - 1) * limit;

      const where = {
        ...(verified !== null && { isVerified: verified }),
      };

      const [shelters, total] = await Promise.all([
        prisma.shelter.findMany({
          where,
          skip,
          take: limit,
          include: {
            admin: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: { pets: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.shelter.count({ where }),
      ]);

      return {
        success: true,
        data: shelters,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    CACHE_TTL.SHELTERS
  );
}

/**
 * Otimizada: Buscar um abrigo específico
 */
export async function findShelterById(shelterId) {
  return await prisma.shelter.findUnique({
    where: { id: shelterId },
    include: {
      admin: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      pets: {
        where: { status: 'APPROVED' },
        select: {
          id: true,
          name: true,
          images: true,
          species: true,
          size: true,
        },
      },
      _count: {
        select: {
          pets: true,
        },
      },
    },
  });
}

/**
 * Otimizada: Transaction para criar adoção
 * Garante integridade dos dados
 */
export async function createAdoptionWithPetUpdate(adoptionData, petStatus = 'PENDING') {
  return await prisma.$transaction(async (tx) => {
    // Criar adoção
    const adoption = await tx.adoption.create({
      data: adoptionData,
      include: {
        pet: true,
        adopter: {
          select: { email: true, name: true },
        },
      },
    });

    // Atualizar status do pet
    await tx.pet.update({
      where: { id: adoptionData.petId },
      data: { status: petStatus },
    });

    return adoption;
  });
}

/**
 * Otimizada: Transaction para completar adoção
 */
export async function completeAdoptionTransaction(adoptionId) {
  return await prisma.$transaction(async (tx) => {
    const adoption = await tx.adoption.update({
      where: { id: adoptionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Atualizar status do pet para ADOPTED
    await tx.pet.update({
      where: { id: adoption.petId },
      data: { status: 'ADOPTED' },
    });

    // Invalidar stats cache
    invalidateCache(/^pet_stats/);

    return adoption;
  });
}

/**
 * Otimizada: Transaction para rejeitar adoção
 */
export async function rejectAdoptionTransaction(adoptionId, rejectionReason) {
  return await prisma.$transaction(async (tx) => {
    const adoption = await tx.adoption.update({
      where: { id: adoptionId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    // Retornar pet para AVAILABLE se não houver outras solicitações pendentes
    const pendingAdoptions = await tx.adoption.count({
      where: {
        petId: adoption.petId,
        status: 'PENDING',
      },
    });

    if (pendingAdoptions === 0) {
      await tx.pet.update({
        where: { id: adoption.petId },
        data: { status: 'APPROVED' },
      });
    }

    return adoption;
  });
}

/**
 * Limpar cache expirado periodicamente
 * Chamado de forma manual ou via cron job
 */
export function cleanExpiredCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL.PETS_STATS) {
      queryCache.delete(key);
      cleaned++;
    }
  }

  console.log(`[Cache] Limpeza concluída: ${cleaned} entradas removidas`);
}

export { invalidateCache, withCache };
