'use client';

import { Card, Badge } from '@/components/ui';
import { 
  HeartIcon,
  ShieldCheckIcon,
  ActivityIcon,
  InfoIcon,
  PaletteIcon,
  CalendarIcon
} from 'lucide-react';
import styles from './PetInfo.module.css';

/**
 * PetInfo Component
 * Detailed pet information display
 * Requirements: 5.3 (Display all pet characteristics and health information)
 */
export default function PetInfo({ pet }) {
  
  /**
   * Get neutered status display
   */
  const getNeuteredStatus = (isNeutered) => {
    if (isNeutered === true) return { label: 'Castrado', variant: 'success' };
    if (isNeutered === false) return { label: 'Não castrado', variant: 'warning' };
    return { label: 'Não informado', variant: 'secondary' };
  };

  /**
   * Get vaccination status display
   */
  const getVaccinationStatus = (isVaccinated) => {
    if (isVaccinated === true) return { label: 'Vacinado', variant: 'success' };
    if (isVaccinated === false) return { label: 'Não vacinado', variant: 'error' };
    return { label: 'Não informado', variant: 'secondary' };
  };

  /**
   * Get size display
   */
  const getSizeDisplay = (size) => {
    switch (size) {
      case 'SMALL':
        return 'Pequeno porte';
      case 'MEDIUM':
        return 'Médio porte';
      case 'LARGE':
        return 'Grande porte';
      default:
        return size;
    }
  };

  /**
   * Get gender display
   */
  const getGenderDisplay = (gender) => {
    return gender === 'MALE' ? 'Macho' : 'Fêmea';
  };

  /**
   * Parse personality traits
   */
  const getPersonalityTraits = (personality) => {
    if (!personality) return [];
    if (Array.isArray(personality)) return personality;
    try {
      return JSON.parse(personality);
    } catch {
      return typeof personality === 'string' ? [personality] : [];
    }
  };

  const neuteredStatus = getNeuteredStatus(pet.isNeutered);
  const vaccinationStatus = getVaccinationStatus(pet.isVaccinated);
  const personalityTraits = getPersonalityTraits(pet.personality);

  return (
    <div className={styles.petInfo}>
      {/* Description */}
      <Card className={styles.descriptionCard}>
        <Card.Body>
          <div className={styles.sectionHeader}>
            <InfoIcon size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Sobre {pet.name}</h3>
          </div>
          <p className={styles.description}>{pet.description}</p>
        </Card.Body>
      </Card>

      {/* Characteristics */}
      <Card className={styles.characteristicsCard}>
        <Card.Body>
          <div className={styles.sectionHeader}>
            <ActivityIcon size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Características</h3>
          </div>

          <div className={styles.characteristicsGrid}>
            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Espécie:</span>
              <span className={styles.characteristicValue}>
                {pet.species === 'DOG' ? 'Cachorro' : 'Gato'}
              </span>
            </div>

            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Raça:</span>
              <span className={styles.characteristicValue}>{pet.breed}</span>
            </div>

            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Idade:</span>
              <span className={styles.characteristicValue}>
                {pet.age} {pet.age === 1 ? 'ano' : 'anos'}
              </span>
            </div>

            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Porte:</span>
              <span className={styles.characteristicValue}>
                {getSizeDisplay(pet.size)}
              </span>
            </div>

            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Gênero:</span>
              <span className={styles.characteristicValue}>
                {getGenderDisplay(pet.gender)}
              </span>
            </div>

            {pet.color && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Cor:</span>
                <span className={styles.characteristicValue}>{pet.color}</span>
              </div>
            )}

            {pet.location && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Localização:</span>
                <span className={styles.characteristicValue}>{pet.location}</span>
              </div>
            )}

            <div className={styles.characteristic}>
              <span className={styles.characteristicLabel}>Cadastrado em:</span>
              <span className={styles.characteristicValue}>
                {new Date(pet.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Health Status */}
      <Card className={styles.healthCard}>
        <Card.Body>
          <div className={styles.sectionHeader}>
            <ShieldCheckIcon size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Saúde</h3>
          </div>

          <div className={styles.healthGrid}>
            <div className={styles.healthItem}>
              <span className={styles.healthLabel}>Castração:</span>
              <Badge 
                variant={neuteredStatus.variant}
                className={styles.healthBadge}
              >
                {neuteredStatus.label}
              </Badge>
            </div>

            <div className={styles.healthItem}>
              <span className={styles.healthLabel}>Vacinação:</span>
              <Badge 
                variant={vaccinationStatus.variant}
                className={styles.healthBadge}
              >
                {vaccinationStatus.label}
              </Badge>
            </div>
          </div>

          {pet.healthStatus && (
            <div className={styles.healthStatusSection}>
              <h4 className={styles.healthStatusTitle}>Informações de Saúde:</h4>
              <p className={styles.healthStatusText}>{pet.healthStatus}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Personality */}
      {personalityTraits.length > 0 && (
        <Card className={styles.personalityCard}>
          <Card.Body>
            <div className={styles.sectionHeader}>
              <HeartIcon size={20} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Personalidade</h3>
            </div>

            <div className={styles.personalityGrid}>
              {personalityTraits.map((trait, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className={styles.personalityBadge}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Temperament and Behavior - New Fields */}
      <Card className={styles.temperamentCard}>
        <Card.Body>
          <div className={styles.sectionHeader}>
            <PaletteIcon size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Temperamento e Comportamento</h3>
          </div>

          <div className={styles.temperamentGrid}>
            {pet.temperament && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Temperamento:</span>
                <span className={styles.characteristicValue}>
                  {pet.temperament.charAt(0).toUpperCase() + pet.temperament.slice(1)}
                </span>
              </div>
            )}

            {pet.compatibilityChildren && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Compatibilidade com Crianças:</span>
                <Badge 
                  variant={pet.compatibilityChildren === 'sim' ? 'success' : pet.compatibilityChildren === 'nao' ? 'error' : 'warning'}
                  className={styles.compatibilityBadge}
                >
                  {pet.compatibilityChildren === 'sim' ? 'Ótimo com crianças' : 
                   pet.compatibilityChildren === 'nao' ? 'Não recomendado' : 
                   'Com supervisão'}
                </Badge>
              </div>
            )}

            {pet.compatibilityAnimals && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Compatibilidade com Animais:</span>
                <Badge 
                  variant={pet.compatibilityAnimals === 'sim' ? 'success' : pet.compatibilityAnimals === 'nao' ? 'error' : 'warning'}
                  className={styles.compatibilityBadge}
                >
                  {pet.compatibilityAnimals === 'sim' ? 'Compatível' : 
                   pet.compatibilityAnimals === 'nao' ? 'Não compatível' : 
                   'Depende da situação'}
                </Badge>
              </div>
            )}

            {pet.microchip && (
              <div className={styles.characteristic}>
                <span className={styles.characteristicLabel}>Microchip:</span>
                <Badge 
                  variant="success"
                  className={styles.microchipBadge}
                >
                  ✓ Possui microchip
                </Badge>
              </div>
            )}
          </div>

          {pet.allergies && (
            <div className={styles.allergiesSection}>
              <h4 className={styles.allergiesTitle}>Alergias ou Restrições:</h4>
              <p className={styles.allergiesText}>{pet.allergies}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Adoption Information - New Fields */}
      {(pet.adoptionReason || pet.acceptOutsideCity) && (
        <Card className={styles.adoptionCard}>
          <Card.Body>
            <div className={styles.sectionHeader}>
              <CalendarIcon size={20} className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Informações da Adoção</h3>
            </div>

            <div className={styles.adoptionGrid}>
              {pet.adoptionReason && (
                <div className={styles.characteristic}>
                  <span className={styles.characteristicLabel}>Motivo da Adoção:</span>
                  <span className={styles.characteristicValue}>
                    {pet.adoptionReason === 'mudanca' ? 'Mudança/Viagem' :
                     pet.adoptionReason === 'incompatibilidade' ? 'Incompatibilidade' :
                     pet.adoptionReason === 'resgate' ? 'Resgate/Encontrado' :
                     'Outras Circunstâncias'}
                  </span>
                </div>
              )}

              {pet.acceptOutsideCity && (
                <div className={styles.characteristic}>
                  <span className={styles.characteristicLabel}>Adoção Fora da Cidade:</span>
                  <Badge 
                    variant={pet.acceptOutsideCity === 'sim' ? 'success' : 'warning'}
                    className={styles.adoptionBadge}
                  >
                    {pet.acceptOutsideCity === 'sim' ? 'Aceita' : 'Apenas na cidade'}
                  </Badge>
                </div>
              )}
            </div>

            {pet.adoptionReasonDetails && (
              <div className={styles.adoptionDetailsSection}>
                <h4 className={styles.adoptionDetailsTitle}>Detalhes:</h4>
                <p className={styles.adoptionDetailsText}>{pet.adoptionReasonDetails}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}