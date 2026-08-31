'use client';

import styles from './Badge.module.css';
import { clsx } from 'clsx';

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'medium',
  rounded = false,
  dot = false,
  icon,
  removable = false,
  onRemove,
  className,
  ...props 
}) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        styles[size],
        {
          [styles.rounded]: rounded,
          [styles.dot]: dot,
          [styles.removable]: removable,
          [styles.hasIcon]: icon
        },
        className
      )}
      {...props}
    >
      {dot && <span className={styles.dotIndicator} />}
      
      {icon && !dot && (
        <span className={styles.icon}>{icon}</span>
      )}
      
      {!dot && (
        <span className={styles.content}>{children}</span>
      )}
      
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={styles.removeButton}
          aria-label="Remover badge"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// Status badges for common use cases
Badge.Status = function StatusBadge({ status, children, ...props }) {
  const statusVariants = {
    available: 'success',
    pending: 'warning', 
    adopted: 'info',
    unavailable: 'neutral',
    active: 'success',
    inactive: 'neutral',
    approved: 'success',
    rejected: 'danger',
    draft: 'neutral'
  };

  return (
    <Badge variant={statusVariants[status] || 'default'} {...props}>
      {children || status}
    </Badge>
  );
};

// Pet-specific badges
Badge.Pet = function PetBadge({ type, ...props }) {
  const petConfig = {
    neutered: { variant: 'success', icon: '✓', children: 'Castrado' },
    vaccinated: { variant: 'success', icon: '💉', children: 'Vacinado' },
    special_needs: { variant: 'warning', icon: '🏥', children: 'Necessidades Especiais' },
    friendly: { variant: 'info', icon: '😊', children: 'Amigável' },
    playful: { variant: 'info', icon: '🎾', children: 'Brincalhão' },
    calm: { variant: 'neutral', icon: '😌', children: 'Calmo' }
  };

  const config = petConfig[type] || { variant: 'default', children: type };
  
  return <Badge {...config} {...props} />;
};

// Counter badge for notifications
Badge.Counter = function CounterBadge({ count, max = 99, ...props }) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge 
      variant="danger" 
      size="small" 
      rounded 
      {...props}
    >
      {displayCount}
    </Badge>
  );
};