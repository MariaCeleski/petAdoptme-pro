'use client';

import { forwardRef, useId, useEffect, useState } from 'react';
import styles from './Input.module.css';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  required = false,
  placeholder,
  type = 'text',
  className,
  leftIcon,      // Extract these
  rightElement,  // Extract these
  ...props 
}, ref) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const generatedId = useId();
  const inputId = props.id || (isHydrated ? generatedId : 'input-ssr');
  
  // Use leftIcon if provided, otherwise fall back to icon
  const displayIcon = icon || leftIcon;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={clsx(
      styles.inputGroup,
      {
        [styles.fullWidth]: fullWidth,
        [styles.hasError]: error,
        [styles.hasIcon]: displayIcon
      },
      className
    )}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {displayIcon && iconPosition === 'left' && (
          <div className={styles.iconLeft}>{displayIcon}</div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            styles.input,
            styles[variant],
            styles[size],
            {
              [styles.withIconLeft]: displayIcon && iconPosition === 'left',
              [styles.withIconRight]: displayIcon && iconPosition === 'right'
            }
          )}
          {...props}
        />
        
        {displayIcon && iconPosition === 'right' && (
          <div className={styles.iconRight}>{displayIcon}</div>
        )}
      </div>
      
      {error && <span className={styles.error}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
