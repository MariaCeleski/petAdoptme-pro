/**
 * Multer Upload Middleware - Handle multipart file uploads
 * Phase 2: Photo handling
 */

import multer from 'multer';

// Store files in memory (Cloudinary will handle persistence)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Acceptable MIME types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP allowed.`), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB per file
    files: 5, // Max 5 files
  },
});

export default upload;
