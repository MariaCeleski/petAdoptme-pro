'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';
import { clsx } from 'clsx';

/**
 * Toast Component
 * Notification system for success, error, and info messages
 * Props:
 * - id: unique identifier
 * - message: notification message
 * - type: 'success' | 'error' | 'info' (default: 'info')
 * - duration: milliseconds before auto-dismiss (default: 3000, 0 = no auto-dismiss)
 * - onDismiss: callback when dismissed
 */
export function Toast({ id, message, type = 'info', duration = 3000, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(id), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8V12M12 16H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8V12M12 16H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={clsx(
        styles.toast,
        styles[type],
        !isVisible && styles.hidden
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
      <button
        onClick={handleDismiss}
        className={styles.closeButton}
        aria-label="Fechar notificação"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * ToastContainer Component
 * Manages multiple toasts
 * Props:
 * - toasts: array of toast objects
 * - onDismiss: callback when toast is dismissed
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  const container = (
    <div className={styles.container}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(container, document.body);
}

/**
 * Hook for managing toasts
 * Usage:
 * const { toasts, addToast, removeToast } = useToast();
 * addToast({ message: 'Success!', type: 'success' });
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

export default Toast;
