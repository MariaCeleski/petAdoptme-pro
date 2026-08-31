/**
 * useCloudinaryUpload Hook
 * Custom hook for Cloudinary image uploads
 */

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export function useCloudinaryUpload() {
  const { request } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadImages = useCallback(
    async (files, petId) => {
      if (!files || files.length === 0) {
        throw new Error('Nenhum arquivo selecionado');
      }

      if (!petId) {
        throw new Error('ID do pet é obrigatório');
      }

      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        
        files.forEach((file) => {
          formData.append('files', file);
        });
        
        formData.append('petId', petId);

        // Use fetch directly for progress tracking
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${useSession().data?.accessToken}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao fazer upload');
        }

        const result = await response.json();
        setProgress(100);
        return result.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(
    async (publicId) => {
      setLoading(true);
      setError(null);

      try {
        const data = await request(`/api/upload/${encodeURIComponent(publicId)}`, {
          method: 'DELETE',
        });
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  return {
    uploadImages,
    deleteImage,
    loading,
    error,
    progress,
  };
}

export default useCloudinaryUpload;
