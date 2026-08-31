/**
 * Upload Routes
 * Handles image uploads and management
 */

import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadImages, deleteImage } from '../services/cloudinaryService.js';

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({
  dest: '/tmp/uploads',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    } else {
      cb(null, true);
    }
  },
});

/**
 * POST /api/upload
 * Upload single or multiple images
 */
router.post(
  '/',
  requireAuth,
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nenhum arquivo fornecido',
        code: 'NO_FILES',
        timestamp: new Date().toISOString(),
      });
    }

    const { petId } = req.body;
    if (!petId) {
      return res.status(400).json({
        error: 'petId é obrigatório',
        code: 'MISSING_PET_ID',
        timestamp: new Date().toISOString(),
      });
    }

    // Upload all files
    const uploadedImages = await uploadImages(req.files, petId);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} imagem(ns) enviada(s) com sucesso`,
      data: uploadedImages,
    });
  })
);

/**
 * DELETE /api/upload/:publicId
 * Delete image by public ID
 */
router.delete(
  '/:publicId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    await deleteImage(decodedPublicId);

    res.status(200).json({
      success: true,
      message: 'Imagem deletada com sucesso',
    });
  })
);

export default router;
