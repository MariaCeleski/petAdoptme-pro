'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './PetDetailsPage.module.css';

/**
 * Pet Details Page - Renders complete pet information from registration form
 * Displays photos, characteristics, health info, personality, and owner contact
 */
export function PetDetailsPage({ pet }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  if (!pet) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <div className={styles.notFoundEmoji}>🐾</div>
          <h1>Pet não encontrado</h1>
          <p>O pet que você está procurando pode ter sido adotado, removido da plataforma ou o link pode estar incorreto.</p>
          <Link href="/pets" className={styles.backLink}>
            ← Ver todos os pets disponíveis
          </Link>
        </div>
      </div>
    );
  }

  // Extract photo URLs from the photos array
  const photos = pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0 
    ? pet.photos.map(p => typeof p === 'string' ? p : p.url).filter(Boolean)
    : [];

  const currentPhoto = photos[currentPhotoIndex] || '/images/pet-placeholder.jpg';

  // Navigation functions
  const goToPreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => prev === 0 ? photos.length - 1 : prev - 1);
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) => prev === photos.length - 1 ? 0 : prev + 1);
  };

  // Get gender label
  const getGenderLabel = () => {
    const genderMap = {
      'M': 'Macho',
      'F': 'Fêmea',
      'MALE': 'Macho',
      'FEMALE': 'Fêmea',
      'male': 'Macho',
      'female': 'Fêmea'
    };
    return genderMap[pet.gender] || pet.gender;
  };

  // Get size label
  const getSizeLabel = () => {
    const sizeMap = {
      'SMALL': 'Pequeno',
      'MEDIUM': 'Médio',
      'LARGE': 'Grande',
      'XLARGE': 'Extra Grande',
      'small': 'Pequeno',
      'medium': 'Médio',
      'large': 'Grande',
      'xlarge': 'Extra Grande'
    };
    return sizeMap[pet.size] || pet.size;
  };

  return (
    <div className={styles.petDetailsPage}>
      {/* Hero Section with Photo Gallery */}
      <div className={styles.photoGallerySection}>
        <div className={styles.mainPhotoContainer}>
          <img
            src={currentPhoto}
            alt={`${pet.name} - Foto ${currentPhotoIndex + 1}`}
            className={styles.mainPhoto}
          />
          
          {photos.length > 1 && (
            <>
              <button 
                className={styles.photoNavButton} 
                onClick={goToPreviousPhoto}
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button 
                className={`${styles.photoNavButton} ${styles.next}`}
                onClick={goToNextPhoto}
                aria-label="Próxima foto"
              >
                ›
              </button>
            </>
          )}
          
          {photos.length > 1 && (
            <div className={styles.photoCounter}>
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {photos.length > 1 && (
          <div className={styles.thumbnailGallery}>
            {photos.map((photo, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === currentPhotoIndex ? styles.active : ''}`}
                onClick={() => setCurrentPhotoIndex(index)}
                aria-label={`Ver foto ${index + 1}`}
              >
                <img src={photo} alt={`Miniatura ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Left Column - Pet Info */}
          <div className={styles.petInfo}>
            {/* Header */}
            <div className={styles.petHeader}>
              <div>
                <h1 className={styles.petName}>{pet.name}</h1>
                <p className={styles.petBreed}>{pet.breed}</p>
              </div>
              <div className={styles.statusBadge}>
                {pet.approval_status === 'APPROVED' ? '✓ Disponível' : 'Análise'}
              </div>
            </div>

            {/* Quick Facts */}
            <div className={styles.quickFacts}>
              <div className={styles.factCard}>
                <div className={styles.factLabel}>Idade</div>
                <div className={styles.factValue}>
                  {pet.age_value} {pet.age_value === 1 ? (pet.age_unit === 'years' ? 'ano' : 'mês') : (pet.age_unit === 'years' ? 'anos' : 'meses')}
                </div>
              </div>

              <div className={styles.factCard}>
                <div className={styles.factLabel}>Gênero</div>
                <div className={styles.factValue}>{getGenderLabel()}</div>
              </div>

              <div className={styles.factCard}>
                <div className={styles.factLabel}>Tamanho</div>
                <div className={styles.factValue}>{getSizeLabel()}</div>
              </div>

              <div className={styles.factCard}>
                <div className={styles.factLabel}>Cor</div>
                <div className={styles.factValue}>{pet.color || 'Não especificada'}</div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Sobre {pet.name}</h2>
              <p className={styles.description}>{pet.description}</p>
            </div>

            {/* Health Information */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>📋 Informações de Saúde</h2>
              <div className={styles.healthInfo}>
                <div className={styles.healthItem}>
                  <div className={styles.healthLabel}>Vacinado</div>
                  <div className={styles.healthValue}>
                    {pet.is_vaccinated ? '✓ Sim' : '✗ Não'}
                  </div>
                </div>

                <div className={styles.healthItem}>
                  <div className={styles.healthLabel}>Castrado/Esterilizado</div>
                  <div className={styles.healthValue}>
                    {pet.is_neutered ? '✓ Sim' : '✗ Não'}
                  </div>
                </div>

                <div className={styles.healthItem}>
                  <div className={styles.healthLabel}>Cuidados Especiais</div>
                  <div className={styles.healthValue}>
                    {pet.needs_special_care ? 'Sim' : 'Não'}
                  </div>
                </div>
              </div>
            </div>

            {/* Personality & Compatibility */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>🎯 Personalidade & Compatibilidade</h2>
              
              <div className={styles.compatibilityGrid}>
                <div className={styles.compatItem}>
                  <div className={styles.compatLabel}>Crianças</div>
                  <div className={styles.compatValue}>
                    {pet.good_with_children === true ? '✓ Sim' : pet.good_with_children === false ? '✗ Não' : '? Desconhecido'}
                  </div>
                </div>

                <div className={styles.compatItem}>
                  <div className={styles.compatLabel}>Outros Animais</div>
                  <div className={styles.compatValue}>
                    {pet.good_with_pets === true ? '✓ Sim' : pet.good_with_pets === false ? '✗ Não' : '? Desconhecido'}
                  </div>
                </div>
              </div>
            </div>

            {/* Adoption Information */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>💝 Informações de Adoção</h2>
              
              <div className={styles.adoptionInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Tipo de Adoção:</span>
                  <span className={styles.infoValue}>{pet.adoption_reason || 'Não especificado'}</span>
                </div>

                {pet.location && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Localização:</span>
                    <span className={styles.infoValue}>{pet.location}</span>
                  </div>
                )}

                {pet.owner_name && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Proprietário:</span>
                    <span className={styles.infoValue}>{pet.owner_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Requirements */}
          <div className={styles.sidebar}>
            {/* Contact Card */}
            {(pet.owner_email || pet.owner_phone) && (
              <div className={styles.contactCard}>
                <h3 className={styles.cardTitle}>Informações de Contato</h3>
                
                {pet.owner_phone && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactLabel}>Telefone</div>
                    <a href={`tel:${pet.owner_phone}`} className={styles.contactValue}>
                      {pet.owner_phone}
                    </a>
                  </div>
                )}

                {pet.owner_email && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactLabel}>Email</div>
                    <a href={`mailto:${pet.owner_email}`} className={styles.contactValue}>
                      {pet.owner_email}
                    </a>
                  </div>
                )}

                <button 
                  className={styles.contactButton}
                  onClick={() => setShowContactForm(!showContactForm)}
                >
                  Enviar Mensagem
                </button>
              </div>
            )}

            {/* Adoption Requirements */}
            {pet.adoption_requirements && (
              <div className={styles.requirementsCard}>
                <h3 className={styles.cardTitle}>Requisitos para Adoção</h3>
                <p className={styles.requirementsText}>{pet.adoption_requirements}</p>
              </div>
            )}

            {/* Additional Requirements */}
            <div className={styles.requirementsCard}>
              <h3 className={styles.cardTitle}>Verificações Necessárias</h3>
              <ul className={styles.requirementsList}>
                <li>Documento de identidade</li>
                <li>Comprovante de residência</li>
                <li>Referências pessoais</li>
                <li>Entrevista com o proprietário</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              {pet.approval_status === 'APPROVED' && (
                <button className={styles.primaryButton}>
                  💚 Manifestar Interesse
                </button>
              )}
              
              <button className={styles.secondaryButton}>
                ↗️ Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className={styles.backButtonContainer}>
        <Link href="/pets" className={styles.backButtonLink}>
          ← Voltar para catálogo
        </Link>
      </div>
    </div>
  );
}
