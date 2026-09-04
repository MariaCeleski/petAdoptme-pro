'use client';

import { useState, useRef } from 'react';
import styles from './PhotoUpload.module.css';

/**
 * PhotoUpload Component
 * Handles image file selection, preview, and validation
 * Features: drag & drop, file preview, remove individual photos, progress indicator
 */
export default function PhotoUpload({
  onChange,
  maxFiles = 5,
  maxSize = 2 * 1024 * 1024, // 2MB default
  acceptedFormats = ['image/jpeg', 'image/png'],
  error = null,
  value = [],
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  // Validate files on selection
  const validateAndAddFiles = (files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Check total files count
    if (previews.length + fileArray.length > maxFiles) {
      setLocalError(`⚠️ Máximo de ${maxFiles} fotos permitidas. Você já tem ${previews.length} foto(s).`);
      return;
    }

    fileArray.forEach((file) => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        newErrors.push(`❌ ${file.name}: Formato inválido. Use apenas JPG ou PNG.`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`❌ ${file.name}: Arquivo excede o tamanho máximo de 2MB`);
        return;
      }

      validFiles.push(file);
    });

    if (newErrors.length > 0) {
      setLocalError(newErrors.join('\n'));
      return;
    }

    // Create previews for valid files
    const newPreviews = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = {
          id: Date.now() + Math.random(),
          src: reader.result,
          file,
          name: file.name,
          size: (file.size / 1024).toFixed(2) // KB
        };
        newPreviews.push(preview);
        
        if (newPreviews.length === validFiles.length) {
          const allPreviews = [...previews, ...newPreviews];
          setPreviews(allPreviews);
          
          // Extract files from previews and call onChange
          const filesArray = allPreviews.map(p => p.file);
          onChange(filesArray);
          setLocalError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length === 0) {
      setLocalError('⚠️ Nenhum arquivo válido foi selecionado.');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files) {
      validateAndAddFiles(files);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      if (files) {
        validateAndAddFiles(files);
      }
    }
  };

  // Remove photo by id
  const removePhoto = (id) => {
    const newPreviews = previews.filter(p => p.id !== id);
    setPreviews(newPreviews);
    
    // Extract files and call onChange
    const filesArray = newPreviews.map(p => p.file);
    onChange(filesArray);
  };

  // Trigger file input click
  const handleClick = () => {
    if (!disabled && previews.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const isMaxReached = previews.length >= maxFiles;

  return (
    <div className={styles.photoUploadContainer}>
      {/* Drop Zone */}
      <label
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${isMaxReached ? styles.maxReached : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={styles.dropZoneIcon}>📷</div>
        <div className={styles.dropZoneText}>
          {isMaxReached ? 'Máximo de fotos atingido' : 'Clique ou arraste fotos aqui'}
        </div>
        <div className={styles.dropZoneSubtext}>
          {previews.length > 0
            ? `${previews.length}/${maxFiles} fotos adicionadas`
            : 'JPG ou PNG, máximo 2MB cada'}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className={styles.hiddenInput}
          disabled={disabled || isMaxReached}
        />
      </label>

      {/* Error Message */}
      {(error || localError) && (
        <div className={styles.errorMessage}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText} style={{ whiteSpace: 'pre-wrap' }}>
            {error || localError}
          </div>
        </div>
      )}

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewTitle}>
            Fotos Selecionadas ({previews.length}/{maxFiles})
          </div>
          <div className={styles.previewGrid}>
            {previews.map((preview) => (
              <div key={preview.id} className={styles.previewItem}>
                <img src={preview.src} alt={preview.name} className={styles.previewImage} />
                <div className={styles.previewInfo}>
                  <div className={styles.previewName} title={preview.name}>
                    {preview.name}
                  </div>
                  <div className={styles.previewSize}>{preview.size} KB</div>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removePhoto(preview.id)}
                  title="Remover foto"
                  aria-label={`Remover ${preview.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
