/**
 * Custom hook for handling image uploads with Cloudinary
 */

import { useState, useCallback, useRef } from 'react';
import { validateImageFile, validateMultipleImageFiles } from '@/lib/upload/validation.js';

/**
 * Hook for managing image uploads
 * @param {Object} options - Configuration options
 * @returns {Object} Upload state and functions
 */
export function useImageUpload(options = {}) {
  const {
    maxFiles = 10,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    uploadType = 'pet', // 'pet' or 'avatar'
    onSuccess,
    onError,
    onProgress
  } = options;

  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    results: [],
    errors: [],
    completed: false
  });

  const abortController = useRef(null);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      results: [],
      errors: [],
      completed: false
    });
  }, []);

  /**
   * Validate files before upload
   * @param {FileList|Array<File>} files - Files to validate
   * @returns {Object} Validation result
   */
  const validateFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    
    if (uploadType === 'avatar') {
      if (fileArray.length > 1) {
        return {
          isValid: false,
          errors: ['Avatar deve ser apenas um arquivo']
        };
      }
      return validateImageFile(fileArray[0]);
    } else {
      return validateMultipleImageFiles(fileArray, maxFiles);
    }
  }, [uploadType, maxFiles]);

  /**
   * Upload files to the server
   * @param {FileList|Array<File>} files - Files to upload
   * @param {Object} uploadOptions - Additional upload options
   * @returns {Promise<Object>} Upload result
   */
  const uploadFiles = useCallback(async (files, uploadOptions = {}) => {
    const fileArray = Array.from(files);
    
    // Validate files first
    const validation = validateFiles(fileArray);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.code = 'VALIDATION_ERROR';
      error.details = validation.errors;
      
      setUploadState(prev => ({
        ...prev,
        errors: validation.errors,
        completed: true
      }));
      
      onError?.(error);
      throw error;
    }

    // Reset state
    setUploadState({
      uploading: true,
      progress: 0,
      results: [],
      errors: [],
      completed: false
    });

    try {
      // Create abort controller for cancellation
      abortController.current = new AbortController();

      // Prepare form data
      const formData = new FormData();
      fileArray.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('type', uploadType);
      formData.append('maxFiles', maxFiles.toString());
      
      // Add additional options
      Object.entries(uploadOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Upload with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: abortController.current.signal
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update state with results
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        results: uploadType === 'avatar' ? [result] : result.uploads || [],
        errors: result.errors || [],
        completed: true
      }));

      // Call success callback
      onSuccess?.(result);
      
      return result;

    } catch (error) {
      console.error('Upload error:', error);
      
      const errorMessage = error.name === 'AbortError' 
        ? 'Upload cancelado'
        : error.message || 'Erro no upload';

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        errors: [errorMessage],
        completed: true
      }));

      onError?.(error);
      throw error;
    }
  }, [uploadType, maxFiles, validateFiles, onSuccess, onError]);

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setUploadState(prev => ({
      ...prev,
      uploading: false,
      progress: 0,
      errors: ['Upload cancelado'],
      completed: true
    }));
  }, []);

  /**
   * Delete uploaded image
   * @param {string} publicIdOrUrl - Public ID or URL of image to delete
   * @returns {Promise<Object>} Delete result
   */
  const deleteImage = useCallback(async (publicIdOrUrl) => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [publicIdOrUrl.includes('cloudinary.com') ? 'url' : 'publicId']: publicIdOrUrl
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      return result;

    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }, []);

  /**
   * Delete multiple images
   * @param {Array<string>} publicIdsOrUrls - Array of public IDs or URLs
   * @returns {Promise<Object>} Delete result
   */
  const deleteMultipleImages = useCallback(async (publicIdsOrUrls) => {
    try {
      const hasUrls = publicIdsOrUrls.some(item => item.includes('cloudinary.com'));
      
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [hasUrls ? 'urls' : 'publicIds']: publicIdsOrUrls
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      return result;

    } catch (error) {
      console.error('Multiple delete error:', error);
      throw error;
    }
  }, []);

  return {
    // State
    uploading: uploadState.uploading,
    progress: uploadState.progress,
    results: uploadState.results,
    errors: uploadState.errors,
    completed: uploadState.completed,
    hasErrors: uploadState.errors.length > 0,
    hasResults: uploadState.results.length > 0,
    
    // Functions
    uploadFiles,
    deleteImage,
    deleteMultipleImages,
    cancelUpload,
    reset,
    validateFiles
  };
}

/**
 * Hook specifically for pet image uploads
 */
export function usePetImageUpload(options = {}) {
  return useImageUpload({
    ...options,
    uploadType: 'pet',
    maxFiles: options.maxFiles || 10
  });
}

/**
 * Hook specifically for avatar uploads
 */
export function useAvatarUpload(options = {}) {
  return useImageUpload({
    ...options,
    uploadType: 'avatar',
    maxFiles: 1
  });
}

/**
 * Hook for upload configuration and limits
 */
export function useUploadConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/upload');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch config');
      }

      setConfig(result);
    } catch (error) {
      console.error('Config fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    config,
    loading,
    error,
    fetchConfig
  };
}