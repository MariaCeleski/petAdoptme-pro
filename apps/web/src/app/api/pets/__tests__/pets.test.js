/**
 * Unit tests for pets API routes
 * Tests the basic structure and validation logic
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    pet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    }
  }
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('Pets API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/pets', () => {
    it('should handle requests without filters', async () => {
      // Mock prisma responses
      const mockPets = [
        {
          id: 'test-id-1',
          name: 'Buddy',
          species: 'DOG',
          breed: 'Golden Retriever',
          age: '2 anos',
          size: 'LARGE',
          gender: 'MALE',
          color: 'Dourado',
          description: 'Cão carinhoso',
          isNeutered: true,
          isVaccinated: true,
          healthStatus: null,
          personality: '["brincalhão"]',
          images: '[]',
          status: 'APPROVED',
          location: 'São Paulo',
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: { id: 'owner-1', name: 'João', type: 'INDIVIDUAL_OWNER' },
          shelter: null
        }
      ];

      const { prisma } = await import('@/lib/prisma');
      prisma.pet.findMany.mockResolvedValue(mockPets);
      prisma.pet.count.mockResolvedValue(1);

      // Import and test the GET handler
      const { GET } = await import('../route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('pets');
      expect(data).toHaveProperty('pagination');
      expect(data.pets).toHaveLength(1);
      expect(data.pets[0].name).toBe('Buddy');
      expect(data.pets[0].personality).toEqual(['brincalhão']);
      expect(data.pets[0].images).toEqual([]);
    });

    it('should handle filter validation errors', async () => {
      const { GET } = await import('../route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets?species=INVALID');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.error).toContain('Invalid filter parameters');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should apply species filter correctly', async () => {
      const mockPets = [];
      const { prisma } = await import('@/lib/prisma');
      prisma.pet.findMany.mockResolvedValue(mockPets);
      prisma.pet.count.mockResolvedValue(0);

      const { GET } = await import('../route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets?species=DOG');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      // Verify the where clause included species filter
      expect(prisma.pet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            species: 'DOG',
            status: 'APPROVED'
          })
        })
      );
    });
  });

  describe('POST /api/pets', () => {
    it('should require authentication', async () => {
      const { getServerSession } = await import('next-auth');
      getServerSession.mockResolvedValue(null);

      const { POST } = await import('../route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should require proper user type', async () => {
      const { getServerSession } = await import('next-auth');
      getServerSession.mockResolvedValue({
        user: {
          id: 'user-1',
          type: 'ADOPTER' // Not allowed to create pets
        }
      });

      const { POST } = await import('../route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Pet',
          species: 'DOG',
          breed: 'Test Breed',
          age: '1 ano',
          size: 'MEDIUM',
          gender: 'MALE',
          color: 'Brown',
          description: 'Test description for validation'
        })
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.code).toBe('FORBIDDEN');
    });

    it('should validate pet data', async () => {
      const { getServerSession } = await import('next-auth');
      getServerSession.mockResolvedValue({
        user: {
          id: 'user-1',
          type: 'INDIVIDUAL_OWNER'
        }
      });

      const { POST } = await import('../route.js');
      
      // Missing required fields
      const request = new NextRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Pet'
          // Missing required fields
        })
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/pets/[id]', () => {
    it('should validate pet ID format', async () => {
      const { GET } = await import('../[id]/route.js');
      
      const request = new NextRequest('http://localhost:3000/api/pets/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.error).toContain('Invalid pet ID format');
    });

    it('should return 404 for non-existent pet', async () => {
      const { prisma } = await import('@/lib/prisma');
      prisma.pet.findUnique.mockResolvedValue(null);

      const { GET } = await import('../[id]/route.js');
      
      const validId = 'c123456789012345678901234'; // Valid CUID format
      const request = new NextRequest(`http://localhost:3000/api/pets/${validId}`);
      const response = await GET(request, { params: { id: validId } });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/pets/[id]', () => {
    it('should require authentication', async () => {
      const { getServerSession } = await import('next-auth');
      getServerSession.mockResolvedValue(null);

      const { PATCH } = await import('../[id]/route.js');
      
      const validId = 'c123456789012345678901234';
      const request = new NextRequest(`http://localhost:3000/api/pets/${validId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' })
      });
      
      const response = await PATCH(request, { params: { id: validId } });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/pets/[id]', () => {
    it('should require authentication', async () => {
      const { getServerSession } = await import('next-auth');
      getServerSession.mockResolvedValue(null);

      const { DELETE } = await import('../[id]/route.js');
      
      const validId = 'c123456789012345678901234';
      const request = new NextRequest(`http://localhost:3000/api/pets/${validId}`, {
        method: 'DELETE'
      });
      
      const response = await DELETE(request, { params: { id: validId } });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });
  });
});

// Test helpers and utilities
export const mockPetData = {
  valid: {
    name: 'Buddy',
    species: 'DOG',
    breed: 'Golden Retriever', 
    age: '2 anos',
    size: 'LARGE',
    gender: 'MALE',
    color: 'Dourado',
    description: 'Cão muito carinhoso e brincalhão, ideal para famílias',
    isNeutered: true,
    isVaccinated: true,
    personality: ['brincalhão', 'carinhoso'],
    images: []
  },
  invalid: {
    name: '', // Empty required field
    species: 'INVALID_SPECIES',
    breed: 'Test'
  }
};

export const mockSession = {
  petOwner: {
    user: {
      id: 'user-1',
      type: 'INDIVIDUAL_OWNER',
      email: 'owner@test.com',
      name: 'Pet Owner'
    }
  },
  adopter: {
    user: {
      id: 'user-2', 
      type: 'ADOPTER',
      email: 'adopter@test.com',
      name: 'Pet Adopter'
    }
  }
};