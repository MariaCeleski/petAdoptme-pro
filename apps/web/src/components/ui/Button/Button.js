'use client';

import styles from './Button.module.css';
import { clsx } from 'clsx';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  rounded = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className,
  as = 'button',
  href,
  ...props 
}) {
  const Component = as === 'link' ? 'a' : 'button';
  const componentProps = as === 'link' 
    ? { href, ...props } 
    : { type, disabled: disabled || loading, ...props };

  return (
    <Component
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        {
          [styles.disabled]: disabled,
          [styles.loading]: loading,
          [styles.fullWidth]: fullWidth,
          [styles.rounded]: rounded,
          [styles.iconOnly]: !children && icon
        },
        className
      )}
      onClick={onClick}
      {...componentProps}
    >
      {loading && (
        <span className={styles.spinner} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      
      <span className={loading ? styles.loadingText : ''}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.iconRight}>{icon}</span>
      )}
    </Component>
  );
}
