'use client';

import styles from './StatsCard.module.css';
import { clsx } from 'clsx';

/**
 * StatsCard - Component for displaying dashboard metrics
 * Displays a metric with icon, title, value, and optional trend
 */
export default function StatsCard({
  title,
  value,
  icon,
  variant = 'default',
  trend,
  trendDirection,
  loading = false,
  onClick,
  href,
  className,
  ...props
}) {
  const Component = href ? 'a' : onClick ? 'button' : 'div';
  
  const componentProps = href 
    ? { href, ...props }
    : onClick 
      ? { type: 'button', onClick, ...props }
      : props;

  return (
    <Component
      className={clsx(
        styles.statsCard,
        styles[variant],
        {
          [styles.loading]: loading,
          [styles.clickable]: onClick || href,
        },
        className
      )}
      {...componentProps}
    >
      {/* Icon */}
      {icon && (
        <div className={clsx(styles.iconContainer, styles[`icon-${variant}`])}>
          {typeof icon === 'string' ? (
            <span className={styles.iconEmoji}>{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        
        <div className={styles.valueContainer}>
          {loading ? (
            <div className={clsx(styles.value, styles.skeleton)}>
              <div className={styles.skeletonBar} />
            </div>
          ) : (
            <p className={styles.value}>{value}</p>
          )}
          
          {/* Trend indicator */}
          {trend && (
            <span className={clsx(styles.trend, styles[`trend-${trendDirection}`])}>
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>

      {/* Action indicator for clickable cards */}
      {(onClick || href) && (
        <div className={styles.actionIndicator}>
          →
        </div>
      )}
    </Component>
  );
}
