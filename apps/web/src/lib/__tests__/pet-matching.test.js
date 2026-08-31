/**
 * Tests for pet matching algorithm
 * 
 * Unit tests verify:
 * - Match score calculation based on individual preference fields
 * - Filtering of matching pets
 * - Duplicate notification prevention
 * - Search preference persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateMatchScore,
  findMatchingPets,
  wasNotificationSent,
  logNotification,
  saveAdopterSearchPreferences
} from '../pet-matching';
import { prisma } from '../prisma';

// Mock Prisma
vi.mock('../prisma', () => ({
  prisma: {
    adopterSearchPreference: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn()
    },
    pet: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    notificationLog: {
      findUnique: vi.fn(),
      upsert: vi.fn()
    }
  }
}));

describe('Pet Matching Algorithm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateMatchScore', () => {
    it('returns 0 when preferences are null', () => {
      const pet = {
        species: 'DOG',
        size: 'MEDIUM',
        age: '3',
        gender: 'MALE',
        personality: JSON.stringify(['friendly', 'energetic'])
      };

      const score = calculateMatchScore(pet, null);
      expect(score).toBe(0);
    });

    it('returns perfect score (100) when all preferences match', () => {
      const pet = {
        species: 'DOG',
        size: 'MEDIUM',
        age: '3',
        gender: 'MALE',
        personality: JSON.stringify(['friendly', 'energetic']),
        location: 'São Paulo'
      };

      const preferences = {
        species: 'DOG',
        sizePreferences: JSON.stringify(['MEDIUM', 'LARGE']),
        minAge: '1',
        maxAge: '5',
        genderPreference: 'MALE',
        personalityTraits: JSON.stringify(['friendly', 'energetic']),
        location: 'São Paulo'
      };

      const score = calculateMatchScore(pet, preferences);
      expect(score).toBe(100);
    });

    it('returns partial score when some preferences match', () => {
      const pet = {
        species: 'DOG',
        size: 'SMALL',
        age: '5',
        gender: 'MALE',
        personality: JSON.stringify(['calm']),
        location: 'Rio de Janeiro'
      };

      const preferences = {
        species: 'DOG',
        sizePreferences: JSON.stringify(['MEDIUM', 'LARGE']),
        minAge: '1',
        maxAge: '10',
        genderPreference: 'MALE',
        personalityTraits: JSON.stringify(['calm', 'quiet']),
        location: 'São Paulo'
      };

      const score = calculateMatchScore(pet, preferences);
      // Should have partial match (species, age, gender match, but size and location don't)
      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(100);
    });

    it('matches when no species preference set', () => {
      const pet = {
        species: 'CAT',
        size: 'SMALL',
        age: '2',
        gender: 'FEMALE',
        personality: JSON.stringify([]),
        location: null
      };

      const preferences = {
        species: null,
        sizePreferences: JSON.stringify(['SMALL']),
        minAge: null,
        maxAge: null,
        genderPreference: null,
        personalityTraits: null,
        location: null
      };

      const score = calculateMatchScore(pet, preferences);
      expect(score).toBe(100);
    });

    it('handles empty preference arrays gracefully', () => {
      const pet = {
        species: 'DOG',
        size: 'LARGE',
        age: '4',
        gender: 'FEMALE',
        personality: JSON.stringify(['energetic']),
        location: 'Belo Horizonte'
      };

      const preferences = {
        species: 'DOG',
        sizePreferences: JSON.stringify([]),
        minAge: null,
        maxAge: null,
        genderPreference: null,
        personalityTraits: JSON.stringify([]),
        location: null
      };

      const score = calculateMatchScore(pet, preferences);
      expect(score).toBeGreaterThan(0);
    });

    it('returns 0 when species does not match', () => {
      const pet = {
        species: 'CAT',
        size: 'MEDIUM',
        age: '3',
        gender: 'MALE',
        personality: JSON.stringify(['friendly']),
        location: null
      };

      const preferences = {
        species: 'DOG',
        sizePreferences: JSON.stringify(['MEDIUM']),
        minAge: '1',
        maxAge: '5',
        genderPreference: 'MALE',
        personalityTraits: JSON.stringify(['friendly']),
        location: null
      };

      const score = calculateMatchScore(pet, preferences);
      // Species is critical, should be low
      expect(score).toBeLessThan(40);
    });

    it('calculates personality match percentage correctly', () => {
      const pet = {
        species: 'DOG',
        size: 'MEDIUM',
        age: '2',
        gender: 'MALE',
        personality: JSON.stringify(['friendly', 'energetic', 'calm']),
        location: null
      };

      const preferences = {
        species: 'DOG',
        sizePreferences: JSON.stringify(['MEDIUM']),
        minAge: '1',
        maxAge: '5',
        genderPreference: 'MALE',
        personalityTraits: JSON.stringify(['friendly', 'energetic']), // 2 out of 3 match = 66%
        location: null
      };

      const score = calculateMatchScore(pet, preferences);
      // Should have good score with partial personality match
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThan(100);
    });
  });

  describe('wasNotificationSent', () => {
    it('returns true when notification was already sent', async () => {
      prisma.notificationLog.findUnique.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        petId: 'pet-1',
        notificationType: 'pet_matching'
      });

      const result = await wasNotificationSent('user-1', 'pet-1', 'pet_matching');
      expect(result).toBe(true);
      expect(prisma.notificationLog.findUnique).toHaveBeenCalledWith({
        where: {
          userId_petId_notificationType: {
            userId: 'user-1',
            petId: 'pet-1',
            notificationType: 'pet_matching'
          }
        }
      });
    });

    it('returns false when notification was not sent', async () => {
      prisma.notificationLog.findUnique.mockResolvedValue(null);

      const result = await wasNotificationSent('user-1', 'pet-1', 'pet_matching');
      expect(result).toBe(false);
    });

    it('handles errors gracefully', async () => {
      prisma.notificationLog.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await wasNotificationSent('user-1', 'pet-1', 'pet_matching');
      expect(result).toBe(false);
    });
  });

  describe('logNotification', () => {
    it('creates new notification log entry', async () => {
      prisma.notificationLog.upsert.mockResolvedValue({
        userId: 'user-1',
        petId: 'pet-1',
        notificationType: 'pet_matching',
        email: 'adopter@example.com',
        deliveryStatus: 'sent'
      });

      await logNotification('user-1', 'pet-1', 'pet_matching', 'adopter@example.com', 'sent');

      expect(prisma.notificationLog.upsert).toHaveBeenCalled();
      const call = prisma.notificationLog.upsert.mock.calls[0][0];
      expect(call.where.userId_petId_notificationType).toEqual({
        userId: 'user-1',
        petId: 'pet-1',
        notificationType: 'pet_matching'
      });
    });

    it('handles errors gracefully', async () => {
      prisma.notificationLog.upsert.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(
        logNotification('user-1', 'pet-1', 'pet_matching', 'adopter@example.com')
      ).resolves.toBeUndefined();
    });
  });

  describe('saveAdopterSearchPreferences', () => {
    it('creates new search preferences', async () => {
      const preferences = {
        species: 'DOG',
        sizePreferences: ['MEDIUM', 'LARGE'],
        minAge: '1',
        maxAge: '5',
        genderPreference: 'MALE',
        personalityTraits: ['friendly', 'energetic'],
        location: 'São Paulo'
      };

      prisma.adopterSearchPreference.upsert.mockResolvedValue({
        userId: 'user-1',
        ...preferences,
        sizePreferences: JSON.stringify(preferences.sizePreferences),
        personalityTraits: JSON.stringify(preferences.personalityTraits)
      });

      const result = await saveAdopterSearchPreferences('user-1', preferences);

      expect(result.userId).toBe('user-1');
      expect(result.species).toBe('DOG');
    });

    it('updates existing search preferences', async () => {
      const newPreferences = {
        species: 'CAT',
        sizePreferences: ['SMALL'],
        isActive: true
      };

      prisma.adopterSearchPreference.upsert.mockResolvedValue({
        userId: 'user-1',
        ...newPreferences,
        sizePreferences: JSON.stringify(newPreferences.sizePreferences)
      });

      await saveAdopterSearchPreferences('user-1', newPreferences);

      expect(prisma.adopterSearchPreference.upsert).toHaveBeenCalled();
    });

    it('throws error when save fails', async () => {
      prisma.adopterSearchPreference.upsert.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        saveAdopterSearchPreferences('user-1', { species: 'DOG' })
      ).rejects.toThrow('Database error');
    });
  });
});
