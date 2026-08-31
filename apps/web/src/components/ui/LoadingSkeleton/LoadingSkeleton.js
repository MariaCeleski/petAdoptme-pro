'use client';

import styles from './LoadingSkeleton.module.css';
import { clsx } from 'clsx';

export default function LoadingSkeleton({ 
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  rounded = false,
  className,
  ...props 
}) {
  const style = {
    width,
    height
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx(styles.textGroup, className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              styles.skeleton,
              styles.text,
              {
                [styles.animated]: animated,
                [styles.rounded]: rounded,
                [styles.lastLine]: index === lines - 1 && lines > 1
              }
            )}
            style={index === lines - 1 ? { ...style, width: '70%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        styles.skeleton,
        styles[variant],
        {
          [styles.animated]: animated,
          [styles.rounded]: rounded
        },
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Specialized skeleton components
LoadingSkeleton.Card = function SkeletonCard({ 
  showImage = true, 
  showActions = true, 
  animated = true,
  className,
  ...props 
}) {
  return (
    <div className={clsx(styles.cardSkeleton, className)} {...props}>
      {showImage && (
        <LoadingSkeleton 
          variant="image" 
          height="200px" 
          animated={animated}
          className={styles.cardImage}
        />
      )}
      <div className={styles.cardContent}>
        <LoadingSkeleton 
          variant="text" 
          height="24px" 
          width="80%" 
          animated={animated}
          className={styles.cardTitle}
        />
        <LoadingSkeleton 
          variant="text" 
          lines={2} 
          animated={animated}
          className={styles.cardDescription}
        />
        {showActions && (
          <div className={styles.cardActions}>
            <LoadingSkeleton 
              variant="button" 
              width="100px" 
              animated={animated}
            />
            <LoadingSkeleton 
              variant="button" 
              width="80px" 
              animated={animated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

LoadingSkeleton.Avatar = function SkeletonAvatar({ 
  size = 'medium', 
  animated = true,
  showName = false,
  className,
  ...props 
}) {
  const sizes = {
    small: '32px',
    medium: '40px',
    large: '56px',
    xl: '80px'
  };

  return (
    <div className={clsx(styles.avatarSkeleton, className)} {...props}>
      <LoadingSkeleton 
        variant="circle" 
        width={sizes[size]} 
        height={sizes[size]} 
        animated={animated}
      />
      {showName && (
        <div className={styles.avatarInfo}>
          <LoadingSkeleton 
            variant="text" 
            width="120px" 
            height="16px" 
            animated={animated}
          />
          <LoadingSkeleton 
            variant="text" 
            width="80px" 
            height="14px" 
            animated={animated}
          />
        </div>
      )}
    </div>
  );
};

LoadingSkeleton.List = function SkeletonList({ 
  items = 3, 
  showAvatar = true,
  showActions = true,
  animated = true,
  className,
  ...props 
}) {
  return (
    <div className={clsx(styles.listSkeleton, className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={styles.listItem}>
          {showAvatar && (
            <LoadingSkeleton 
              variant="circle" 
              width="40px" 
              height="40px" 
              animated={animated}
            />
          )}
          <div className={styles.listContent}>
            <LoadingSkeleton 
              variant="text" 
              height="16px" 
              width="60%" 
              animated={animated}
            />
            <LoadingSkeleton 
              variant="text" 
              height="14px" 
              width="40%" 
              animated={animated}
            />
          </div>
          {showActions && (
            <div className={styles.listActions}>
              <LoadingSkeleton 
                variant="button" 
                width="24px" 
                height="24px" 
                animated={animated}
                rounded
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

LoadingSkeleton.Table = function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  animated = true,
  className,
  ...props 
}) {
  return (
    <div className={clsx(styles.tableSkeleton, className)} {...props}>
      {showHeader && (
        <div className={styles.tableHeader}>
          {Array.from({ length: columns }).map((_, index) => (
            <LoadingSkeleton 
              key={index}
              variant="text" 
              height="16px" 
              width="80%" 
              animated={animated}
            />
          ))}
        </div>
      )}
      <div className={styles.tableBody}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className={styles.tableRow}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton 
                key={colIndex}
                variant="text" 
                height="14px" 
                width={colIndex === 0 ? "90%" : "70%"} 
                animated={animated}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

LoadingSkeleton.Form = function SkeletonForm({ 
  fields = 4,
  showButtons = true,
  animated = true,
  className,
  ...props 
}) {
  return (
    <div className={clsx(styles.formSkeleton, className)} {...props}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className={styles.formField}>
          <LoadingSkeleton 
            variant="text" 
            height="16px" 
            width="100px" 
            animated={animated}
            className={styles.formLabel}
          />
          <LoadingSkeleton 
            variant="input" 
            height="44px" 
            animated={animated}
          />
        </div>
      ))}
      {showButtons && (
        <div className={styles.formActions}>
          <LoadingSkeleton 
            variant="button" 
            width="100px" 
            animated={animated}
          />
          <LoadingSkeleton 
            variant="button" 
            width="80px" 
            animated={animated}
          />
        </div>
      )}
    </div>
  );
};