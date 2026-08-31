import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pet: {
      count: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe('/api/pets/owner', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      type: 'INDIVIDUAL_OWNER'
    }
  };

  const mockPets = [
    {
      id: 'pet-1',
      name: 'Buddy',
      species: 'DOG',
      breed: 'Golden Retriever',
      age: '3 anos',
      size: 'LARGE',
      gender: 'MALE',
      color: 'Golden',
      description: 'Friendly dog',
      isNeutered: true,
      isVaccinated: true,
      healthStatus: 'Healthy',
      personality: '["friendly", "playful"]',
      images: '["https://example.com/buddy.jpg"]',
      status: 'APPROVED',
      location: 'São Paulo, SP',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      owner: { id: 'user-123', name: 'John', type: 'INDIVIDUAL_OWNER' },
      shelter: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 when user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/pets/owner');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
  });

  test('returns 403 when user is not a pet owner', async () => {
    const adopterSession = {
      user: {
        id: 'user-123',
        type: 'ADOPTER'
      }
    };
    getServerSession.mockResolvedValue(adopterSession);

    const request = new Request('http://localhost:3000/api/pets/owner');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe('FORBIDDEN');
  });

  test('returns user pets with pagination', async () => {
    getServerSession.mockResolvedValue(mockSession);
    prisma.pet.count.mockResolvedValue(1);
    prisma.pet.findMany.mockResolvedValue(mockPets);

    const request = new Request('http://localhost:3000/api/pets/owner?page=1&limit=12');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pets).toHaveLength(1);
    expect(data.pets[0].name).toBe('Buddy');
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.hasNextPage).toBe(false);
  });

  test('applies pagination correctly', async () => {
    getServerSession.mockResolvedValue(mockSession);
    prisma.pet.count.mockResolvedValue(25);
    prisma.pet.findMany.mockResolvedValue(mockPets.slice(0, 12));

    const request = new Request('http://localhost:3000/api/pets/owner?page=2&limit=12');
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.page).toBe(2);
    expect(data.pagination.totalPages).toBe(3);
    expect(data.pagination.hasNextPage).toBe(true);
    expect(data.pagination.hasPrevPage).toBe(true);
  });

  test('parses JSON string arrays for personality and images', async () => {
    getServerSession.mockResolvedValue(mockSession);
    prisma.pet.count.mockResolvedValue(1);
    prisma.pet.findMany.mockResolvedValue(mockPets);

    const request = new Request('http://localhost:3000/api/pets/owner');
    const response = await GET(request);
    const data = await response.json();

    expect(Array.isArray(data.pets[0].personality)).toBe(true);
    expect(data.pets[0].personality).toEqual(['friendly', 'playful']);
    expect(Array.isArray(data.pets[0].images)).toBe(true);
    expect(data.pets[0].images).toEqual(['https://example.com/buddy.jpg']);
  });

  test('returns empty array when user has no pets', async () => {
    getServerSession.mockResolvedValue(mockSession);
    prisma.pet.count.mockResolvedValue(0);
    prisma.pet.findMany.mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/pets/owner');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pets).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  test('filters by owner ID for both INDIVIDUAL_OWNER and SHELTER_ADMIN', async () => {
    const shelterSession = {
      user: {
        id: 'shelter-admin-123',
        type: 'SHELTER_ADMIN'
      }
    };
    getServerSession.mockResolvedValue(shelterSession);
    prisma.pet.count.mockResolvedValue(1);
    prisma.pet.findMany.mockResolvedValue(mockPets);

    const request = new Request('http://localhost:3000/api/pets/owner');
    await GET(request);

    // Verify that the query was made with the correct user ID
    expect(prisma.pet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerId: 'shelter-admin-123'
        })
      })
    );
  });

  test('returns 500 on database error', async () => {
    getServerSession.mockResolvedValue(mockSession);
    prisma.pet.count.mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/pets/owner');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe('INTERNAL_ERROR');
  });
});
