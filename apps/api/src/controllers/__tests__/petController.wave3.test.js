/**
 * Pet Controller - Wave 3 Tests
 * Tests for Update, Delete, and Pet Compatibility Deletion
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as petController from '../petController.js';
import { ApiError } from '../../middleware/errorHandler.js';
import * as supabaseClient from '../../services/supabaseClient.js';
import cloudinaryService from '../../services/cloudinary.service.js';

// Mock dependencies
vi.mock('../../services/supabaseClient.js');
vi.mock('../../services/cloudinary.service.js');
vi.mock('../../services/email.service.js');

// Mock the schema - we need to handle the import
vi.mock('@petadopt/shared', () => ({
  petCreateSchema: {
    parseAsync: vi.fn((data) => Promise.resolve(data)),
  },
  petUpdateSchema: {
    parseAsync: vi.fn((data) => Promise.resolve(data)),
  },
}));

describe('Pet Controller - Wave 3 (Edit/Delete)', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 'user-123' },
      params: { id: 'pet-123' },
      body: {},
      files: [],
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('updatePet', () => {
    it('should update pet with new data', async () => {
      const updatedPetData = {
        id: 'pet-123',
        name: 'Updated Name',
        breed: 'Updated Breed',
        photos: [],
      };

      supabaseClient.select.mockResolvedValue([
        {
          id: 'pet-123',
          owner_id: 'user-123',
          name: 'Old Name',
          photos: [],
        },
      ]);

      supabaseClient.update.mockResolvedValue([updatedPetData]);

      req.body = { name: 'Updated Name', breed: 'Updated Breed' };

      await petController.updatePet(req, res, next);

      // Verify cloudinary was not called for upload since no files
      expect(cloudinaryService.uploadMultiplePhotos).not.toHaveBeenCalled();

      // Verify update was called
      expect(supabaseClient.update).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pet updated successfully',
        data: updatedPetData,
      });
    });

    it('should return 404 if pet not found', async () => {
      supabaseClient.select.mockResolvedValue([]);

      await petController.updatePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });

    it('should return 403 if user is not the pet owner', async () => {
      supabaseClient.select.mockResolvedValue([
        {
          id: 'pet-123',
          owner_id: 'other-user',
          photos: [],
        },
      ]);

      await petController.updatePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      req.user = null;

      await petController.updatePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('deletePet', () => {
    it('should delete photos from Cloudinary before archiving pet', async () => {
      const pet = {
        id: 'pet-123',
        owner_id: 'user-123',
        photos: [
          { url: 'https://photo1.jpg', publicId: 'photo-1' },
          { url: 'https://photo2.jpg', publicId: 'photo-2' },
        ],
      };

      supabaseClient.select.mockResolvedValue([pet]);
      cloudinaryService.deleteMultiplePhotos.mockResolvedValue([]);
      supabaseClient.update.mockResolvedValue([{ status: 'ARCHIVED' }]);

      await petController.deletePet(req, res, next);

      expect(cloudinaryService.deleteMultiplePhotos).toHaveBeenCalledWith(
        ['photo-1', 'photo-2']
      );
      expect(supabaseClient.update).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pet deleted successfully',
      });
    });

    it('should handle pet with no photos', async () => {
      const pet = {
        id: 'pet-123',
        owner_id: 'user-123',
        photos: [],
      };

      supabaseClient.select.mockResolvedValue([pet]);
      supabaseClient.update.mockResolvedValue([{ status: 'ARCHIVED' }]);

      await petController.deletePet(req, res, next);

      // Should not attempt to delete photos
      expect(cloudinaryService.deleteMultiplePhotos).not.toHaveBeenCalled();

      expect(supabaseClient.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if pet not found', async () => {
      supabaseClient.select.mockResolvedValue([]);

      await petController.deletePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });

    it('should return 403 if user is not the pet owner', async () => {
      supabaseClient.select.mockResolvedValue([
        {
          id: 'pet-123',
          owner_id: 'other-user',
          photos: [],
        },
      ]);

      await petController.deletePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      req.user = null;

      await petController.deletePet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should continue even if Cloudinary deletion fails', async () => {
      const pet = {
        id: 'pet-123',
        owner_id: 'user-123',
        photos: [{ url: 'https://photo.jpg', publicId: 'photo-1' }],
      };

      supabaseClient.select.mockResolvedValue([pet]);
      cloudinaryService.deleteMultiplePhotos.mockRejectedValue(
        new Error('Cloudinary error')
      );
      supabaseClient.update.mockResolvedValue([{ status: 'ARCHIVED' }]);

      await petController.deletePet(req, res, next);

      // Pet should still be archived even if photo deletion fails
      expect(supabaseClient.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });;

  describe('deletePetCompatibility', () => {
    it('should delete pet compatibility record', async () => {
      supabaseClient.select.mockResolvedValue([
        {
          id: 'pet-123',
          owner_id: 'user-123',
        },
      ]);

      supabaseClient.remove.mockResolvedValue([]);

      await petController.deletePetCompatibility(req, res, next);

      expect(supabaseClient.remove).toHaveBeenCalledWith(
        'pet_compatibility',
        { pet_id: 'pet-123' }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pet compatibility deleted successfully',
      });
    });

    it('should return 404 if pet not found', async () => {
      supabaseClient.select.mockResolvedValue([]);

      await petController.deletePetCompatibility(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });

    it('should return 403 if user is not the pet owner', async () => {
      supabaseClient.select.mockResolvedValue([
        {
          id: 'pet-123',
          owner_id: 'other-user',
        },
      ]);

      await petController.deletePetCompatibility(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      req.user = null;

      await petController.deletePetCompatibility(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('savePetCompatibility', () => {
    it('should create new compatibility record', async () => {
      supabaseClient.select
        .mockResolvedValueOnce([{ id: 'pet-123', owner_id: 'user-123' }]) // pets check
        .mockResolvedValueOnce([]); // pet_compatibility check

      supabaseClient.insert.mockResolvedValue([
        {
          id: 'compat-123',
          pet_id: 'pet-123',
          good_with_children: true,
          good_with_pets: false,
          needs_special_care: false,
          notes: 'Friendly with kids',
        },
      ]);

      req.body = {
        good_with_children: true,
        good_with_pets: false,
        needs_special_care: false,
        notes: 'Friendly with kids',
      };

      await petController.savePetCompatibility(req, res, next);

      expect(supabaseClient.insert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pet compatibility saved successfully',
        data: expect.objectContaining({
          good_with_children: true,
        }),
      });
    });

    it('should update existing compatibility record', async () => {
      supabaseClient.select
        .mockResolvedValueOnce([{ id: 'pet-123', owner_id: 'user-123' }]) // pets check
        .mockResolvedValueOnce([{ id: 'compat-123', pet_id: 'pet-123' }]); // pet_compatibility check

      supabaseClient.update.mockResolvedValue([
        {
          id: 'compat-123',
          pet_id: 'pet-123',
          good_with_children: false,
          good_with_pets: true,
        },
      ]);

      req.body = {
        good_with_children: false,
        good_with_pets: true,
        needs_special_care: false,
        notes: 'Updated',
      };

      await petController.savePetCompatibility(req, res, next);

      expect(supabaseClient.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
