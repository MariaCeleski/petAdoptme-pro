'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import styles from './OptimizedImage.module.css';

/**
 * Optimized Image Component with advanced features:
 * - Progressive loading with blur placeholder
 * - Error handling with fallback
 * - Lazy loading with intersection observer
 * - Responsive sizing
 * - Performance optimizations
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/images/pet-placeholder.jpg',
  className,
  containerClassName,
  onLoad,
  onError,
  onLoadStart,
  aspectRatio,
  objectFit = 'cover',
  lazy = true,
  fadeIn = true,
  rounded = false,
  zoomOnHover = false,
  showLoadingSpinner = true,
  ...props
}) {
  // CRITICAL: Validate src immediately - before any hooks
  const isInitialSrcEmpty = !src || (typeof src === 'string' && src.trim() === '');
  
  // If src is empty from prop, return error state immediately
  if (isInitialSrcEmpty) {
    return (
      <div 
        className={clsx(
          styles.container,
          { [styles.rounded]: rounded, [styles.error]: true },
          containerClassName
        )}
        style={aspectRatio && !fill ? { aspectRatio } : {}}
      >
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠</div>
          <span className={styles.errorText}>Imagem não disponível</span>
        </div>
      </div>
    );
  }

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [loadStarted, setLoadStarted] = useState(false);
  
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Default blur data URL for placeholder
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+kXoiijm3zHmLiIcBOKhvpgRPrXHTnHIASZuoAJgPdv/X4k0l1KN/LJGYlM=';

  // Update src when prop changes
  useEffect(() => {
    if (src !== imageSrc && !hasError) {
      // Validate new src before setting
      if (src && typeof src === 'string' && src.trim().length > 0) {
        setImageSrc(src);
        setIsLoading(true);
        setHasError(false);
        setLoadStarted(false);
      }
    }
  }, [src, imageSrc, hasError]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  // Handle image load start
  const handleLoadStart = () => {
    if (!loadStarted) {
      setLoadStarted(true);
      onLoadStart?.();
    }
  };

  // Handle successful image load
  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  };

  // Handle image error
  const handleError = (e) => {
    console.warn('Image failed to load:', imageSrc);
    
    // Try fallback if current src is not already the fallback
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    // If even fallback failed
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  };

  // Calculate container styles
  const containerStyles = {};
  if (aspectRatio && !fill) {
    containerStyles.aspectRatio = aspectRatio;
  }

  // Container classes
  const containerClasses = clsx(
    styles.container,
    {
      [styles.fill]: fill,
      [styles.rounded]: rounded,
      [styles.zoomOnHover]: zoomOnHover,
      [styles.loading]: isLoading && showLoadingSpinner,
      [styles.error]: hasError,
      [styles.fadeIn]: fadeIn && !isLoading
    },
    containerClassName
  );

  // Image classes
  const imageClasses = clsx(
    styles.image,
    {
      [styles.loaded]: !isLoading && !hasError,
      [styles.objectCover]: objectFit === 'cover',
      [styles.objectContain]: objectFit === 'contain',
      [styles.objectFill]: objectFit === 'fill'
    },
    className
  );

  // Validate current imageSrc is not empty
  const isSrcValid = imageSrc && typeof imageSrc === 'string' && imageSrc.trim().length > 0;

  if (!isSrcValid) {
    return (
      <div 
        ref={containerRef}
        className={clsx(
          styles.container,
          { [styles.rounded]: rounded, [styles.error]: true },
          containerClassName
        )}
        style={aspectRatio && !fill ? { aspectRatio } : {}}
      >
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠</div>
          <span className={styles.errorText}>Imagem não disponível</span>
        </div>
      </div>
    );
  }

  // Don't render image until in view (for lazy loading)
  if (!isInView && lazy && !priority) {
    return (
      <div 
        ref={containerRef}
        className={containerClasses}
        style={containerStyles}
      >
        <div className={styles.placeholder}>
          {showLoadingSpinner && (
            <div className={styles.spinner} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={containerStyles}
    >
      {isLoading && showLoadingSpinner && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}
      
      {hasError ? (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠</div>
          <span className={styles.errorText}>Falha ao carregar imagem</span>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={isSrcValid && priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          className={imageClasses}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          style={{ objectFit }}
          {...props}
        />
      )}
    </div>
  );
}

// Preset variants
OptimizedImage.Card = function OptimizedImageCard(props) {
  return (
    <OptimizedImage 
      {...props} 
      aspectRatio="4/3"
      rounded
      fadeIn
      zoomOnHover
    />
  );
};

OptimizedImage.Avatar = function OptimizedImageAvatar(props) {
  return (
    <OptimizedImage 
      {...props} 
      aspectRatio="1"
      rounded
      objectFit="cover"
      quality={90}
    />
  );
};

OptimizedImage.Hero = function OptimizedImageHero(props) {
  return (
    <OptimizedImage 
      {...props} 
      priority
      quality={95}
      fadeIn
      objectFit="cover"
    />
  );
};

OptimizedImage.Thumbnail = function OptimizedImageThumbnail(props) {
  return (
    <OptimizedImage 
      {...props} 
      aspectRatio="1"
      quality={75}
      objectFit="cover"
    />
  );
};

OptimizedImage.Gallery = function OptimizedImageGallery(props) {
  return (
    <OptimizedImage 
      {...props} 
      quality={90}
      fadeIn
      zoomOnHover
    />
  );
};