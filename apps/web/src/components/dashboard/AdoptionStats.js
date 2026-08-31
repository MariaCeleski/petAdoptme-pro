import styles from './AdoptionStats.module.css';

/**
 * AdoptionStats Component
 * Displays adoption statistics cards for the adopter dashboard
 * Requirements: 7.1, 7.5
 */
export function AdoptionStats({ stats }) {
  const statCards = [
    {
      label: 'Solicitações',
      value: stats.total,
      color: 'blue',
      icon: '📝'
    },
    {
      label: 'Aguardando',
      value: stats.pending,
      color: 'yellow',
      icon: '⏳'
    },
    {
      label: 'Aprovadas',
      value: stats.approved,
      color: 'green',
      icon: '✓'
    },
    {
      label: 'Completas',
      value: stats.completed,
      color: 'emerald',
      icon: '🎉'
    }
  ];

  return (
    <>
      {statCards.map((card) => (
        <div key={card.label} className={`${styles.card} ${styles[`card${card.color.charAt(0).toUpperCase() + card.color.slice(1)}`]}`}>
          <div className={styles.icon}>{card.icon}</div>
          <div className={styles.content}>
            <p className={styles.label}>{card.label}</p>
            <p className={styles.value}>{card.value}</p>
          </div>
        </div>
      ))}
    </>
  );
}
