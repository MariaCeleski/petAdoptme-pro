'use client';

import { Card, Badge } from '@/components/ui';
import { 
  HeartIcon,
  CalendarIcon,
  TrophyIcon,
  UserCheckIcon
} from 'lucide-react';
import styles from './SuccessStories.module.css';

/**
 * SuccessStories Component
 * Display adoption success stories from the same owner
 * Requirements: 5.7 (Display adoption success stories from the same Pet_Owner)
 */
export default function SuccessStories({ 
  stories = [], 
  ownerName = '' 
}) {
  
  if (!stories || stories.length === 0) {
    return null;
  }

  /**
   * Format adoption date
   */
  const formatAdoptionDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `Há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
    } else if (diffMonths > 0) {
      return `Há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
    } else if (diffDays > 0) {
      return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    } else {
      return 'Recentemente';
    }
  };

  /**
   * Get adoption badge variant based on time
   */
  const getAdoptionBadgeVariant = (dateString) => {
    const diffDays = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return 'success';      // Recent (green)
    if (diffDays <= 180) return 'info';        // Within 6 months (blue)
    return 'secondary';                         // Older (gray)
  };

  return (
    <Card className={styles.successStoriesCard}>
      <Card.Body>
        <div className={styles.sectionHeader}>
          <TrophyIcon size={20} className={styles.sectionIcon} />
          <div className={styles.headerContent}>
            <h3 className={styles.sectionTitle}>Histórias de Sucesso</h3>
            <p className={styles.sectionSubtitle}>
              Outras adoções realizadas por <strong>{ownerName}</strong>
            </p>
          </div>
        </div>

        <div className={styles.storiesContainer}>
          {/* Statistics */}
          <div className={styles.statisticsSection}>
            <div className={styles.statCard}>
              <HeartIcon size={24} className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stories.length}</span>
                <span className={styles.statLabel}>
                  {stories.length === 1 ? 'Adoção' : 'Adoções'} Realizadas
                </span>
              </div>
            </div>
          </div>

          {/* Stories List */}
          <div className={styles.storiesList}>
            <h4 className={styles.storiesTitle}>
              <UserCheckIcon size={18} />
              Pets que encontraram seus lares
            </h4>
            
            <div className={styles.storiesGrid}>
              {stories.map((story) => (
                <div key={story.id} className={styles.storyItem}>
                  <div className={styles.storyHeader}>
                    <div className={styles.storyInfo}>
                      <span className={styles.adopterName}>
                        {story.adopterName}
                      </span>
                      <Badge 
                        variant={getAdoptionBadgeVariant(story.completedAt)}
                        className={styles.adoptionBadge}
                      >
                        {formatAdoptionDate(story.completedAt)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className={styles.storyDate}>
                    <CalendarIcon size={14} className={styles.dateIcon} />
                    <span>
                      Adotado em {new Date(story.completedAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Message */}
          <div className={styles.trustMessage}>
            <div className={styles.trustIcon}>
              <HeartIcon size={20} />
            </div>
            <div className={styles.trustContent}>
              <h5 className={styles.trustTitle}>Proprietário Confiável</h5>
              <p className={styles.trustDescription}>
                {ownerName} já ajudou {stories.length} pet{stories.length !== 1 ? 's' : ''} a 
                encontrar{stories.length === 1 ? '' : 'em'} 
                {stories.length === 1 ? ' um lar' : ' seus lares'} amorosos. 
                Isso demonstra compromisso e cuidado com o bem-estar animal.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className={styles.callToAction}>
            <p>
              <strong>💡 Histórias como estas</strong> mostram que este proprietário se preocupa 
              genuinamente em encontrar lares adequados para os pets. Entre em contato para saber 
              mais sobre o processo de adoção!
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}