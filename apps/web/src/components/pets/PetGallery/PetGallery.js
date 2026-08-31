'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MaximizeIcon
} from 'lucide-react';
import styles from './PetGallery.module.css';
import { clsx } from 'clsx';

/**
 * PetGallery Component
 * Interactive image gallery with zoom and fullscreen capabilities
 * Requirements: 5.2 (Complete image gallery with navigation)
 */
export default function PetGallery({ 
  images = [], 
  petName = '', 
  className 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter out empty/null images and ensure we have at least a placeholder
  const validImages = (Array.isArray(images) ? images : [])
    .filter(img => img && typeof img === 'string' && img.trim().length > 0);
  const galleryImages = validImages.length > 0 ? validImages : ['/images/pet-placeholder.jpg'];

  /**
   * Navigate to previous image
   */
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
    resetZoomAndPan();
  }, [galleryImages.length]);

  /**
   * Navigate to next image
   */
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
    resetZoomAndPan();
  }, [galleryImages.length]);

  /**
   * Go to specific image
   */
  const goToImage = useCallback((index) => {
    setCurrentIndex(index);
    resetZoomAndPan();
  }, []);

  /**
   * Open fullscreen modal
   */
  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    resetZoomAndPan();
  }, []);

  /**
   * Close fullscreen modal
   */
  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    resetZoomAndPan();
  }, []);

  /**
   * Reset zoom and pan to default
   */
  const resetZoomAndPan = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  /**
   * Handle zoom in
   */
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  }, []);

  /**
   * Handle zoom out
   */
  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 0.5);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  /**
   * Handle mouse down for dragging (fullscreen only)
   */
  const handleMouseDown = useCallback((e) => {
    if (!isFullscreen || zoomLevel <= 1) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  }, [isFullscreen, zoomLevel, panPosition]);

  /**
   * Handle mouse move for dragging
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit pan based on zoom level
    const maxPan = (zoomLevel - 1) * 100;
    
    setPanPosition({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  }, [isDragging, dragStart, zoomLevel]);

  /**
   * Handle mouse up for dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e) => {
    if (!isFullscreen) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Escape':
        e.preventDefault();
        closeFullscreen();
        break;
      case '+':
      case '=':
        e.preventDefault();
        zoomIn();
        break;
      case '-':
        e.preventDefault();
        zoomOut();
        break;
    }
  }, [isFullscreen, goToPrevious, goToNext, closeFullscreen, zoomIn, zoomOut]);

  // Add keyboard event listeners
  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isFullscreen, handleKeyDown, handleMouseMove, handleMouseUp]);

  /**
   * Render thumbnail
   */
  const renderThumbnail = (src, index) => (
    <button
      key={index}
      onClick={() => goToImage(index)}
      className={clsx(styles.thumbnail, {
        [styles.active]: index === currentIndex
      })}
      aria-label={`Ver imagem ${index + 1} de ${galleryImages.length}`}
    >
      <OptimizedImage
        src={src}
        alt={`${petName} - Foto ${index + 1}`}
        width={80}
        height={80}
        className={styles.thumbnailImage}
      />
    </button>
  );

  /**
   * Render main image
   */
  const renderMainImage = (inFullscreen = false) => (
    <div 
      className={clsx(styles.mainImageContainer, {
        [styles.fullscreen]: inFullscreen,
        [styles.zoomed]: zoomLevel > 1,
        [styles.dragging]: isDragging
      })}
    >
      <OptimizedImage
        src={galleryImages[currentIndex]}
        alt={`${petName} - Foto ${currentIndex + 1}`}
        width={inFullscreen ? 1200 : 600}
        height={inFullscreen ? 800 : 400}
        priority={currentIndex === 0}
        className={styles.mainImage}
        style={{
          transform: inFullscreen 
            ? `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`
            : undefined,
          cursor: inFullscreen && zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
        }}
        onClick={inFullscreen ? undefined : openFullscreen}
        onMouseDown={inFullscreen ? handleMouseDown : undefined}
      />

      {/* Navigation arrows */}
      {galleryImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            onClick={goToPrevious}
            className={clsx(styles.navButton, styles.prevButton)}
            aria-label="Imagem anterior"
          >
            <ChevronLeftIcon size={24} />
          </Button>

          <Button
            variant="ghost"
            onClick={goToNext}
            className={clsx(styles.navButton, styles.nextButton)}
            aria-label="Próxima imagem"
          >
            <ChevronRightIcon size={24} />
          </Button>
        </>
      )}

      {/* Fullscreen button (non-fullscreen only) */}
      {!inFullscreen && (
        <Button
          variant="ghost"
          onClick={openFullscreen}
          className={styles.fullscreenButton}
          aria-label="Ver em tela cheia"
        >
          <MaximizeIcon size={20} />
        </Button>
      )}

      {/* Image counter */}
      <div className={styles.imageCounter}>
        {currentIndex + 1} / {galleryImages.length}
      </div>
    </div>
  );

  return (
    <div className={clsx(styles.petGallery, className)}>
      {/* Main Image */}
      {renderMainImage(false)}

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className={styles.thumbnailsContainer}>
          <div className={styles.thumbnailsGrid}>
            {galleryImages.map((src, index) => renderThumbnail(src, index))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={closeFullscreen}
        size="full"
        className={styles.fullscreenModal}
      >
        <div className={styles.fullscreenContent}>
          {/* Fullscreen Header */}
          <div className={styles.fullscreenHeader}>
            <div className={styles.fullscreenTitle}>
              <h3>{petName}</h3>
              <span className={styles.fullscreenCounter}>
                {currentIndex + 1} / {galleryImages.length}
              </span>
            </div>

            <div className={styles.fullscreenControls}>
              <Button
                variant="ghost"
                onClick={zoomOut}
                disabled={zoomLevel <= 0.5}
                className={styles.zoomButton}
                aria-label="Diminuir zoom"
              >
                <ZoomOutIcon size={20} />
              </Button>

              <span className={styles.zoomLevel}>
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="ghost"
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className={styles.zoomButton}
                aria-label="Aumentar zoom"
              >
                <ZoomInIcon size={20} />
              </Button>

              <Button
                variant="ghost"
                onClick={closeFullscreen}
                className={styles.closeButton}
                aria-label="Fechar tela cheia"
              >
                <XIcon size={24} />
              </Button>
            </div>
          </div>

          {/* Fullscreen Main Image */}
          <div className={styles.fullscreenImageArea}>
            {renderMainImage(true)}
          </div>

          {/* Fullscreen Thumbnails */}
          {galleryImages.length > 1 && (
            <div className={styles.fullscreenThumbnails}>
              <div className={styles.thumbnailsScroll}>
                {galleryImages.map((src, index) => renderThumbnail(src, index))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}