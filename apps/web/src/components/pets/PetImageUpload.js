'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './PetImageUpload.module.css';

/**
 * Pet Image Upload Component
 * Handles image upload with preview, validation, and Cloudinary integration
 */
export function PetImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato não suportado. Use JPG, PNG ou WebP.');
    }
    if (file.size > maxFileSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }
    if (images.length >= maxImages) {
      throw new Error(`Máximo ${maxImages} imagens permitidas.`);
    }
  };

  const uploadFileToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return null; // Return null to indicate Cloudinary not configured
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          timeout: 30000
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary error:', errorData);
        return null;
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return null;
    }
  };

  const uploadFileToLocalServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-local', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Local server upload error:', err);
      throw err;
    }
  };

  const uploadFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (err) => {
        reject(new Error('Erro ao processar a imagem'));
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file) => {
    validateFile(file);

    // Try Cloudinary first
    console.log('Attempting Cloudinary upload...');
    const cloudinaryUrl = await uploadFileToCloudinary(file);
    
    if (cloudinaryUrl) {
      console.log('Cloudinary upload successful:', cloudinaryUrl);
      return cloudinaryUrl;
    }

    // Try local server next
    console.log('Attempting local server upload...');
    try {
      const localUrl = await uploadFileToLocalServer(file);
      console.log('Local server upload successful:', localUrl);
      return localUrl;
    } catch (err) {
      console.warn('Local server upload failed:', err.message);
    }

    // Fallback to Base64 (for development/MVP)
    console.warn('Using Base64 fallback (images will not be saved)');
    try {
      const base64Url = await uploadFileAsBase64(file);
      console.log('Using Base64 storage for development');
      return base64Url;
    } catch (err) {
      throw new Error('Erro ao processar a imagem. Tente novamente.');
    }
  };

  const handleFiles = async (files) => {
    setError(null);
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const uploadedUrls = [];

      for (const file of fileArray) {
        if (images.length + uploadedUrls.length >= maxImages) {
          setError(`Máximo de ${maxImages} imagens atingido.`);
          break;
        }

        try {
          const url = await uploadFile(file);
          uploadedUrls.push(url);
        } catch (err) {
          console.error('Upload error:', err);
          setError(err.message || 'Erro ao fazer upload. Tente novamente.');
          break;
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        
        // Show warning if using Base64 fallback
        if (uploadedUrls[0]?.startsWith('data:')) {
          console.info('📝 Aviso: Imagens em Base64 (não serão salvas).');
          setError('⚠️  Imagens em modo desenvolvimento (não serão salvas). Tente recarregar.');
        }
      }
    } finally {
      setUploading(false);
      setDragActive(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setError(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      {/* Development Mode Info */}
      {images.length > 0 && images[0]?.startsWith('data:') && (
        <div className={styles.warningMessage}>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong>⚠️ Aviso:</strong> Imagens não serão salvas. Configure Cloudinary para persistência.
          </span>
        </div>
      )}

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((image, index) => (
            <div key={index} className={styles.previewItem}>
              <div className={styles.imageWrapper}>
                <Image
                  src={image}
                  alt={`Pet image ${index + 1}`}
                  fill
                  className={styles.image}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className={styles.removeButton}
                title="Remover imagem"
                disabled={uploading}
              >
                ✕
              </button>
              {index === 0 && (
                <div className={styles.badge}>Principal</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Área de Upload */}
      {images.length < maxImages && (
        <div
          className={`${styles.uploadArea} ${dragActive ? styles.active : ''} ${uploading ? styles.disabled : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleChange}
            disabled={uploading}
            className={styles.fileInput}
          />

          <div className={styles.uploadContent}>
            <svg
              className={styles.uploadIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            <div className={styles.uploadText}>
              <h3 className={styles.uploadTitle}>
                {uploading ? 'Enviando...' : 'Arraste fotos aqui'}
              </h3>
              <p className={styles.uploadDescription}>
                ou{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className={styles.browseButton}
                  disabled={uploading}
                >
                  clique para selecionar
                </button>
              </p>
              <p className={styles.uploadInfo}>
                Máximo {maxImages} imagens • Até 5MB cada • JPG, PNG, WebP
              </p>
            </div>

            {uploading && <div className={styles.spinner} />}
          </div>
        </div>
      )}

      {/* Mensagens de Status */}
      {error && (
        <div className={styles.errorMessage}>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Development Mode Info */}
      {images.length > 0 && images[0]?.startsWith('data:') && (
        <div className={styles.infoMessage}>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong>Modo de desenvolvimento:</strong> Imagens armazenadas localmente. Configure Cloudinary para produção.
          </span>
        </div>
      )}

      {/* Contador de Imagens */}
      {images.length > 0 && (
        <div className={styles.counter}>
          {images.length} de {maxImages} imagens
        </div>
      )}
    </div>
  );
}
