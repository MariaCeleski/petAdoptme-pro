'use client';

import { useState } from 'react';
import styles from './Avatar.module.css';
import { clsx } from 'clsx';

export default function Avatar({ 
  src, 
  alt, 
  name,
  size = 'medium',
  variant = 'circular',
  status,
  placeholder,
  fallbackIcon,
  className,
  onClick,
  ...props 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Generate background color from name
  const getBackgroundColor = (name) => {
    if (!name) return 'var(--neutral-medium)';
    
    const colors = [
      'var(--primary-orange)',
      'var(--primary-blue)',
      'var(--primary-green)',
      'var(--secondary-coral)',
      'var(--secondary-purple)',
      'var(--info)'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const showImage = src && !imageError;
  const showInitials = name && (!src || imageError);
  const showPlaceholder = !showImage && !showInitials;

  return (
    <div
      className={clsx(
        styles.avatar,
        styles[size],
        styles[variant],
        {
          [styles.clickable]: onClick,
          [styles.hasStatus]: status
        },
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={showInitials ? { backgroundColor: getBackgroundColor(name) } : undefined}
      {...props}
    >
      {showImage && (
        <>
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={clsx(styles.image, {
              [styles.loaded]: imageLoaded
            })}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className={styles.imagePlaceholder}>
              <div className={styles.spinner} />
            </div>
          )}
        </>
      )}
      
      {showInitials && (
        <span className={styles.initials}>
          {getInitials(name)}
        </span>
      )}
      
      {showPlaceholder && (
        <div className={styles.placeholder}>
          {placeholder || fallbackIcon || (
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </div>
      )}
      
      {status && (
        <div className={clsx(styles.status, styles[`status-${status}`])} />
      )}
    </div>
  );
}

// Avatar Group component for displaying multiple avatars
Avatar.Group = function AvatarGroup({ 
  children, 
  max = 3, 
  size = 'medium',
  className,
  ...props 
}) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  return (
    <div className={clsx(styles.avatarGroup, styles[`group-${size}`], className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className={styles.avatarWrapper} style={{ zIndex: max - index }}>
          {avatar}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={clsx(styles.avatar, styles[size], styles.circular, styles.overflow)}
          style={{ zIndex: 0 }}
        >
          <span className={styles.overflowText}>+{remainingCount}</span>
        </div>
      )}
    </div>
  );
};