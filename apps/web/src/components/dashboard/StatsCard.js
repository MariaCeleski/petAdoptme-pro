import Link from 'next/link';
import styles from './StatsCard.module.css';

/**
 * StatsCard Component
 * Displays a stat card with icon, title, and value
 */
export function StatsCard({
  title,
  value,
  icon,
  variant = 'primary',
  href = null
}) {
  const content = (
    <div className={`${styles.card} ${styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
}
