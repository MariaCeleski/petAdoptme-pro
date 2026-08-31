'use client';

import { Card, Button, Badge } from '@/components/ui';
import { 
  UserIcon,
  HomeIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  MapPinIcon,
  HeartHandshakeIcon
} from 'lucide-react';
import styles from './OwnerInfo.module.css';

/**
 * OwnerInfo Component
 * Display pet owner or shelter information
 * Requirements: 5.4 (Show Pet_Owner contact information)
 */
export default function OwnerInfo({ owner, shelter }) {
  const displayInfo = shelter || owner;
  const isShelter = !!shelter;

  if (!displayInfo) {
    return null;
  }

  /**
   * Get user type display
   */
  const getUserTypeDisplay = (type) => {
    switch (type) {
      case 'ADOPTER':
        return 'Adotante';
      case 'SHELTER':
        return 'Abrigo';
      case 'INDIVIDUAL':
        return 'Pessoa Física';
      default:
        return type;
    }
  };

  /**
   * Handle contact click
   */
  const handleContact = (type, value) => {
    switch (type) {
      case 'email':
        window.location.href = `mailto:${value}`;
        break;
      case 'phone':
        window.location.href = `tel:${value}`;
        break;
      case 'website':
        window.open(value, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  return (
    <Card className={styles.ownerInfoCard}>
      <Card.Body>
        <div className={styles.sectionHeader}>
          {isShelter ? (
            <HomeIcon size={20} className={styles.sectionIcon} />
          ) : (
            <UserIcon size={20} className={styles.sectionIcon} />
          )}
          <h3 className={styles.sectionTitle}>
            {isShelter ? 'Informações do Abrigo' : 'Informações do Proprietário'}
          </h3>
        </div>

        <div className={styles.ownerContent}>
          {/* Basic Info */}
          <div className={styles.basicInfo}>
            <div className={styles.ownerHeader}>
              <h4 className={styles.ownerName}>{displayInfo.name}</h4>
              {!isShelter && owner.type && (
                <Badge 
                  variant="secondary"
                  className={styles.typeBadge}
                >
                  {getUserTypeDisplay(owner.type)}
                </Badge>
              )}
            </div>

            {isShelter && shelter.description && (
              <p className={styles.shelterDescription}>
                {shelter.description}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <h5 className={styles.contactTitle}>
              <HeartHandshakeIcon size={16} />
              Informações de Contato
            </h5>

            <div className={styles.contactGrid}>
              {/* Email */}
              {displayInfo.email && (
                <button
                  onClick={() => handleContact('email', displayInfo.email)}
                  className={styles.contactItem}
                >
                  <MailIcon size={16} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>E-mail:</span>
                    <span className={styles.contactValue}>{displayInfo.email}</span>
                  </div>
                </button>
              )}

              {/* Phone (shelter only) */}
              {isShelter && shelter.phone && (
                <button
                  onClick={() => handleContact('phone', shelter.phone)}
                  className={styles.contactItem}
                >
                  <PhoneIcon size={16} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>Telefone:</span>
                    <span className={styles.contactValue}>{shelter.phone}</span>
                  </div>
                </button>
              )}

              {/* Website (shelter only) */}
              {isShelter && shelter.website && (
                <button
                  onClick={() => handleContact('website', shelter.website)}
                  className={styles.contactItem}
                >
                  <GlobeIcon size={16} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>Website:</span>
                    <span className={styles.contactValue}>
                      {shelter.website.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </button>
              )}

              {/* Address (shelter only) */}
              {isShelter && (shelter.address || shelter.city || shelter.state) && (
                <div className={styles.contactItem}>
                  <MapPinIcon size={16} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>Localização:</span>
                    <span className={styles.contactValue}>
                      {[shelter.address, shelter.city, shelter.state]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Button */}
          <div className={styles.contactActions}>
            <Button
              variant="primary"
              onClick={() => handleContact('email', displayInfo.email)}
              disabled={!displayInfo.email}
              className={styles.contactButton}
            >
              <MailIcon size={18} />
              {isShelter ? 'Contatar Abrigo' : 'Contatar Proprietário'}
            </Button>

            {isShelter && shelter.phone && (
              <Button
                variant="outline"
                onClick={() => handleContact('phone', shelter.phone)}
                className={styles.contactButton}
              >
                <PhoneIcon size={18} />
                Ligar
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <span className={styles.trustLabel}>Membro desde:</span>
              <span className={styles.trustValue}>
                {new Date(displayInfo.createdAt || owner.createdAt || Date.now())
                  .toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
              </span>
            </div>

            {/* TODO: Add more trust indicators like:
                - Number of successful adoptions
                - Verification badges
                - Reviews/ratings
            */}
          </div>

          {/* Privacy Notice */}
          <div className={styles.privacyNotice}>
            <p>
              💡 <strong>Dica:</strong> Ao entrar em contato, mencione que viu este pet 
              no PetAdopt. Isso ajuda os proprietários a acompanhar a efetividade da plataforma.
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}