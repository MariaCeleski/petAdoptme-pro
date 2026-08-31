'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage/OptimizedImage';
import Badge from '@/components/ui/Badge/Badge';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import styles from './ShelterInfo.module.css';

/**
 * ShelterInfo Component
 * 
 * Exibe informações do abrigo na página de detalhes do pet
 * Mostra logo, informações de contato e botão para página pública do abrigo
 * 
 * Props:
 * - shelter: Objeto com dados do abrigo
 * - adoptionStats: Objeto com estatísticas de adoção (opcional)
 * 
 * Validates Requirements: 11.3, 11.5
 */
export default function ShelterInfo({ shelter, adoptionStats = null }) {
  if (!shelter) {
    return null;
  }

  const images = shelter.images ? JSON.parse(shelter.images) : [];

  return (
    <Card className={styles.card}>
      <div className={styles.container}>
        {/* Logo Section */}
        {shelter.logo && (
          <div className={styles.logoSection}>
            <OptimizedImage
              src={shelter.logo}
              alt={shelter.name}
              width={100}
              height={100}
              className={styles.logo}
            />
          </div>
        )}

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <div>
              <h3 className={styles.title}>{shelter.name}</h3>
              {shelter.isVerified && (
                <Badge variant="success">Verificado</Badge>
              )}
            </div>
          </div>

          {shelter.description && (
            <p className={styles.description}>{shelter.description}</p>
          )}

          {/* Location */}
          <div className={styles.detail}>
            <span className={styles.label}>📍 Localização:</span>
            <span className={styles.value}>
              {shelter.city}, {shelter.state}
            </span>
          </div>

          {/* Contact Info */}
          <div className={styles.detail}>
            <span className={styles.label}>📞 Telefone:</span>
            <a href={`tel:${shelter.phone}`} className={styles.link}>
              {shelter.phone}
            </a>
          </div>

          <div className={styles.detail}>
            <span className={styles.label}>✉️ Email:</span>
            <a href={`mailto:${shelter.email}`} className={styles.link}>
              {shelter.email}
            </a>
          </div>

          {shelter.website && (
            <div className={styles.detail}>
              <span className={styles.label}>🌐 Website:</span>
              <a 
                href={shelter.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                Visitar
              </a>
            </div>
          )}

          {/* Stats */}
          {adoptionStats && (
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{adoptionStats.totalPets}</span>
                <span className={styles.statLabel}>Pets</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{adoptionStats.adoptedCount}</span>
                <span className={styles.statLabel}>Adotados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{adoptionStats.adoptionRate || '0'}%</span>
                <span className={styles.statLabel}>Taxa</span>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className={styles.actions}>
            <Link href={`/shelters/${shelter.id}`}>
              <Button variant="secondary" fullWidth>
                Ver Perfil do Abrigo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {images.length > 0 && (
        <div className={styles.gallery}>
          <h4 className={styles.galleryTitle}>Fotos do Abrigo</h4>
          <div className={styles.galleryGrid}>
            {images.slice(0, 4).map((image, idx) => (
              <div key={idx} className={styles.galleryItem}>
                <OptimizedImage
                  src={image}
                  alt={`Foto do abrigo ${idx + 1}`}
                  width={150}
                  height={150}
                  className={styles.galleryImage}
                />
              </div>
            ))}
            {images.length > 4 && (
              <Link href={`/shelters/${shelter.id}`} className={styles.galleryItem}>
                <div className={styles.morePhotos}>
                  <span className={styles.moreCount}>+{images.length - 4}</span>
                  <span className={styles.moreText}>Mais Fotos</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
