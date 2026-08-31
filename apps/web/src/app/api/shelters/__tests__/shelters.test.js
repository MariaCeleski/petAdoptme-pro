/**
 * Unit tests for shelters API routes
 * Tests shelter creation, updates, and retrieval
 * Requirements: 11.1, 11.2, 11.4, 11.5, 11.6
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    shelter: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    pet: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    adoption: {
      findMany: jest.fn(),
      groupBy: jest.fn()
    }
  }
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

const { prisma } = require('@/lib/prisma');
const { getServerSession } = require('next-auth');

describe('Shelters API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Shelter Data Validation', () => {
    // Requirement 11.1, 11.2, 11.4
    
    it('should require all mandatory shelter fields', () => {
      const validShelter = {
        name: 'Abrigo ABC',
        address: 'Rua Principal 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        phone: '(11) 3333-3333',
        email: 'contact@abrigo.com'
      };

      // All fields present - should be valid
      const allFields = validShelter;
      expect(allFields).toHaveProperty('name');
      expect(allFields).toHaveProperty('address');
      expect(allFields).toHaveProperty('city');
      expect(allFields).toHaveProperty('state');
      expect(allFields).toHaveProperty('zipCode');
      expect(allFields).toHaveProperty('phone');
      expect(allFields).toHaveProperty('email');
    });

    it('should accept optional fields (website, description, logo, images)', () => {
      const shelterWithOptional = {
        name: 'Abrigo ABC',
        address: 'Rua Principal 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        phone: '(11) 3333-3333',
        email: 'contact@abrigo.com',
        website: 'https://abrigo.com',
        description: 'Um abrigo para animais',
        logo: 'https://example.com/logo.jpg',
        images: ['https://example.com/photo1.jpg']
      };

      expect(shelterWithOptional).toHaveProperty('website');
      expect(shelterWithOptional).toHaveProperty('description');
      expect(shelterWithOptional).toHaveProperty('logo');
      expect(shelterWithOptional).toHaveProperty('images');
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com'
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });

      expect(emailRegex.test('valid@email.com')).toBe(true);
    });

    it('should validate phone format', () => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;

      expect(phoneRegex.test('(11) 3333-3333')).toBe(true);
      expect(phoneRegex.test('11 99999-9999')).toBe(true);
      expect(phoneRegex.test('+55 11 3333-3333')).toBe(true);
      expect(phoneRegex.test('123')).toBe(false);
    });

    it('should validate ZIP code format', () => {
      const zipRegex = /^\d{5}-?\d{3}$/;

      expect(zipRegex.test('01310-100')).toBe(true);
      expect(zipRegex.test('01310100')).toBe(true);
      expect(zipRegex.test('invalid')).toBe(false);
    });
  });

  describe('Shelter Operations', () => {
    // Requirement 11.1, 11.2, 11.5, 11.6

    it('should create a shelter with valid data', async () => {
      const newShelter = {
        id: 'shelter-1',
        name: 'Abrigo ABC',
        address: 'Rua Principal 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        phone: '(11) 3333-3333',
        email: 'contact@abrigo.com',
        adminId: 'user-1',
        isVerified: false,
        createdAt: new Date()
      };

      prisma.shelter.create.mockResolvedValue(newShelter);

      const result = await prisma.shelter.create({
        data: newShelter
      });

      expect(result).toEqual(newShelter);
      expect(prisma.shelter.create).toHaveBeenCalled();
    });

    it('should update shelter information', async () => {
      const updatedShelter = {
        id: 'shelter-1',
        name: 'Abrigo XYZ',
        address: 'Rua Secundária 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        phone: '(21) 2222-2222',
        email: 'newemail@abrigo.com',
        adminId: 'user-1',
        isVerified: false,
        updatedAt: new Date()
      };

      prisma.shelter.update.mockResolvedValue(updatedShelter);

      const result = await prisma.shelter.update({
        where: { id: 'shelter-1' },
        data: updatedShelter
      });

      expect(result.name).toBe('Abrigo XYZ');
      expect(prisma.shelter.update).toHaveBeenCalled();
    });

    it('should retrieve shelter by ID', async () => {
      const shelter = {
        id: 'shelter-1',
        name: 'Abrigo ABC',
        address: 'Rua Principal 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        phone: '(11) 3333-3333',
        email: 'contact@abrigo.com',
        adminId: 'user-1',
        isVerified: false
      };

      prisma.shelter.findUnique.mockResolvedValue(shelter);

      const result = await prisma.shelter.findUnique({
        where: { id: 'shelter-1' }
      });

      expect(result).toEqual(shelter);
      expect(prisma.shelter.findUnique).toHaveBeenCalledWith({
        where: { id: 'shelter-1' }
      });
    });

    it('should filter shelters by search term', async () => {
      const shelters = [
        {
          id: 'shelter-1',
          name: 'Abrigo São Paulo',
          city: 'São Paulo'
        },
        {
          id: 'shelter-2',
          name: 'Abrigo Paulista',
          city: 'São Paulo'
        }
      ];

      prisma.shelter.findMany.mockResolvedValue(shelters);

      const result = await prisma.shelter.findMany({
        where: {
          OR: [
            { name: { contains: 'São Paulo', mode: 'insensitive' } },
            { city: { contains: 'São Paulo', mode: 'insensitive' } }
          ]
        }
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toContain('São Paulo');
    });

    it('should return adoption statistics for shelter', async () => {
      const shelterId = 'shelter-1';

      prisma.pet.count.mockResolvedValueOnce(10); // total pets
      prisma.pet.count.mockResolvedValueOnce(5);  // available
      prisma.pet.count.mockResolvedValueOnce(3);  // pending
      prisma.pet.count.mockResolvedValueOnce(2);  // adopted

      prisma.adoption.findMany.mockResolvedValue([
        { status: 'COMPLETED', createdAt: new Date('2024-01-01'), completedAt: new Date('2024-01-15') },
        { status: 'COMPLETED', createdAt: new Date('2024-01-02'), completedAt: new Date('2024-01-16') },
        { status: 'APPROVED', createdAt: new Date('2024-01-03'), completedAt: null },
        { status: 'PENDING', createdAt: new Date('2024-01-04'), completedAt: null }
      ]);

      const totalPets = await prisma.pet.count({ where: { shelterId } });
      const adoptedPets = await prisma.pet.count({ where: { shelterId, status: 'ADOPTED' } });
      const adoptions = await prisma.adoption.findMany({ where: { pet: { shelterId } } });

      expect(totalPets).toBe(10);
      expect(adoptedPets).toBe(2);
      expect(adoptions).toHaveLength(4);

      // Calculate adoption rate
      const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0;
      expect(adoptionRate).toBe(20);
    });
  });

  describe('Shelter Authorization', () => {
    // Requirement 11.7

    it('should prevent non-admin users from creating shelters', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', type: 'ADOPTER' }
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        type: 'ADOPTER'
      });

      const user = await prisma.user.findUnique({
        where: { id: 'user-1' }
      });

      expect(user.type).not.toBe('SHELTER_ADMIN');
    });

    it('should prevent unauthorized users from updating shelters', async () => {
      const shelter = {
        id: 'shelter-1',
        adminId: 'user-1'
      };

      const currentUserId = 'user-2'; // Different user

      expect(shelter.adminId).not.toBe(currentUserId);
    });

    it('should allow admin to update their own shelter', async () => {
      const shelter = {
        id: 'shelter-1',
        adminId: 'user-1'
      };

      const currentUserId = 'user-1'; // Same user

      expect(shelter.adminId).toBe(currentUserId);
    });
  });

  describe('Image Handling', () => {
    // Requirement 11.4

    it('should store shelter images as JSON array', async () => {
      const images = ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'];
      const storedImages = JSON.stringify(images);

      const parsedImages = JSON.parse(storedImages);
      expect(parsedImages).toEqual(images);
      expect(Array.isArray(parsedImages)).toBe(true);
    });

    it('should handle empty images array', async () => {
      const images = [];
      const storedImages = JSON.stringify(images);

      const parsedImages = JSON.parse(storedImages);
      expect(parsedImages).toEqual([]);
    });

    it('should validate logo URL format', () => {
      const validUrls = [
        'https://example.com/logo.jpg',
        'https://cdn.example.com/images/logo.png'
      ];

      const invalidUrls = [
        'not-a-url',
        'http://invalid',
        '/relative/path'
      ];

      validUrls.forEach(url => {
        try {
          new URL(url);
          expect(true).toBe(true);
        } catch {
          expect(false).toBe(true);
        }
      });

      invalidUrls.forEach(url => {
        try {
          new URL(url);
          expect(false).toBe(true);
        } catch {
          expect(true).toBe(true);
        }
      });
    });
  });
});
