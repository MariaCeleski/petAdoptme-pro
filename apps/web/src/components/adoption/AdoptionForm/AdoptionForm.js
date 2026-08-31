'use client';

import { useState, useCallback, useReducer } from 'react';
import { Button, Input, Select, Card } from '@/components/ui';
import { 
  HeartIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon
} from 'lucide-react';
import { adoptionSchema } from '@/lib/validation/schemas.js';
import styles from './AdoptionForm.module.css';

/**
 * AdoptionForm Component
 * Formulário completo de adoção com validação
 * Requirements: 6.1, 6.2
 * 
 * Coleta:
 * - Informações pessoais do adotante
 * - Situação de moradia
 * - Experiência com pets
 * - Motivação para adoção
 */

// Form state reducer
const initialState = {
  personalInfo: {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  livingSituation: {
    housingType: 'apartment',
    hasYard: false,
    ownRent: 'own',
    landlordApproval: null,
  },
  experience: {
    hadPetsBefore: false,
    currentPets: [],
    veterinarianInfo: '',
  },
  motivation: {
    whyAdopt: '',
    expectedCommitment: '',
    availableTime: '',
  },
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload }
      };
    case 'SET_LIVING_SITUATION':
      return {
        ...state,
        livingSituation: { ...state.livingSituation, ...action.payload }
      };
    case 'SET_EXPERIENCE':
      return {
        ...state,
        experience: { ...state.experience, ...action.payload }
      };
    case 'SET_MOTIVATION':
      return {
        ...state,
        motivation: { ...state.motivation, ...action.payload }
      };
    case 'ADD_CURRENT_PET':
      return {
        ...state,
        experience: {
          ...state.experience,
          currentPets: [...state.experience.currentPets, action.payload]
        }
      };
    case 'REMOVE_CURRENT_PET':
      return {
        ...state,
        experience: {
          ...state.experience,
          currentPets: state.experience.currentPets.filter((_, idx) => idx !== action.payload)
        }
      };
    case 'UPDATE_CURRENT_PET':
      const updatedPets = [...state.experience.currentPets];
      updatedPets[action.payload.index] = { ...updatedPets[action.payload.index], ...action.payload.data };
      return {
        ...state,
        experience: { ...state.experience, currentPets: updatedPets }
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function AdoptionForm({
  petId,
  onSubmit,
  isLoading = false,
  error = null,
  successMessage = null,
  onSuccess = null,
  className = '',
}) {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPetInput, setCurrentPetInput] = useState({
    species: '',
    breed: '',
    age: '',
  });
  const [showCurrentPetForm, setShowCurrentPetForm] = useState(false);

  /**
   * Validate form data using Zod schema
   */
  const validateForm = useCallback(() => {
    const formData = {
      petId,
      adopterInfo: formState,
    };

    const result = adoptionSchema.safeParse(formData);
    
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  }, [formState, petId]);

  /**
   * Handle personal info changes
   */
  const handlePersonalInfoChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_PERSONAL_INFO',
      payload: { [name]: value }
    });
  }, []);

  /**
   * Handle living situation changes
   */
  const handleLivingSituationChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    dispatch({
      type: 'SET_LIVING_SITUATION',
      payload: {
        [name]: type === 'checkbox' ? checked : value
      }
    });
  }, []);

  /**
   * Handle living situation select changes
   */
  const handleLivingSituationSelectChange = useCallback((name, value) => {
    dispatch({
      type: 'SET_LIVING_SITUATION',
      payload: { [name]: value }
    });
  }, []);

  /**
   * Handle experience changes
   */
  const handleExperienceChange = useCallback((e) => {
    const { name, type, checked, value } = e.target;
    dispatch({
      type: 'SET_EXPERIENCE',
      payload: {
        [name]: type === 'checkbox' ? checked : value
      }
    });
  }, []);

  /**
   * Handle motivation changes
   */
  const handleMotivationChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_MOTIVATION',
      payload: { [name]: value }
    });
  }, []);

  /**
   * Handle adding current pet
   */
  const handleAddCurrentPet = useCallback(() => {
    if (!currentPetInput.species || !currentPetInput.breed || !currentPetInput.age) {
      return;
    }

    dispatch({
      type: 'ADD_CURRENT_PET',
      payload: { ...currentPetInput }
    });

    setCurrentPetInput({ species: '', breed: '', age: '' });
    setShowCurrentPetForm(false);
  }, [currentPetInput]);

  /**
   * Handle removing current pet
   */
  const handleRemoveCurrentPet = useCallback((index) => {
    dispatch({
      type: 'REMOVE_CURRENT_PET',
      payload: index
    });
  }, []);

  /**
   * Handle updating current pet
   */
  const handleUpdateCurrentPet = useCallback((index, field, value) => {
    dispatch({
      type: 'UPDATE_CURRENT_PET',
      payload: {
        index,
        data: { [field]: value }
      }
    });
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const formData = {
        petId,
        adopterInfo: formState,
      };

      await onSubmit?.(formData);
      onSuccess?.();
    } catch (err) {
      console.error('Form submission error:', err);
    }
  }, [formState, petId, validateForm, onSubmit, onSuccess]);

  /**
   * Get error for a field
   */
  const getError = useCallback((fieldPath) => {
    return validationErrors[fieldPath] || '';
  }, [validationErrors]);

  return (
    <form onSubmit={handleSubmit} className={`${styles.adoptionForm} ${className}`}>
      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <AlertCircleIcon size={20} className={styles.errorIcon} />
          <div className={styles.alertContent}>
            <h4>Erro ao processar formulário</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className={styles.successAlert}>
          <CheckCircleIcon size={20} className={styles.successIcon} />
          <div className={styles.alertContent}>
            <h4>Sucesso!</h4>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <Card className={styles.formSection}>
        <Card.Header>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>1</span>
            Informações Pessoais
          </h3>
        </Card.Header>
        <Card.Body className={styles.sectionBody}>
          <div className={styles.formGrid}>
            <Input
              label="Nome Completo"
              name="fullName"
              value={formState.personalInfo.fullName}
              onChange={handlePersonalInfoChange}
              placeholder="Seu nome e sobrenome"
              required
              error={getError('adopterInfo.personalInfo.fullName')}
            />

            <Input
              label="Telefone"
              name="phone"
              type="tel"
              value={formState.personalInfo.phone}
              onChange={handlePersonalInfoChange}
              placeholder="(XX) XXXXX-XXXX"
              required
              error={getError('adopterInfo.personalInfo.phone')}
            />
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Endereço"
              name="address"
              value={formState.personalInfo.address}
              onChange={handlePersonalInfoChange}
              placeholder="Rua, número e complemento"
              required
              error={getError('adopterInfo.personalInfo.address')}
            />
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Cidade"
              name="city"
              value={formState.personalInfo.city}
              onChange={handlePersonalInfoChange}
              placeholder="Sua cidade"
              required
              error={getError('adopterInfo.personalInfo.city')}
            />

            <Input
              label="Estado"
              name="state"
              value={formState.personalInfo.state}
              onChange={handlePersonalInfoChange}
              placeholder="UF"
              maxLength="50"
              required
              error={getError('adopterInfo.personalInfo.state')}
            />

            <Input
              label="CEP"
              name="zipCode"
              value={formState.personalInfo.zipCode}
              onChange={handlePersonalInfoChange}
              placeholder="XXXXX-XXX"
              required
              error={getError('adopterInfo.personalInfo.zipCode')}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Section 2: Living Situation */}
      <Card className={styles.formSection}>
        <Card.Header>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>2</span>
            Situação de Moradia
          </h3>
        </Card.Header>
        <Card.Body className={styles.sectionBody}>
          <div className={styles.formGrid}>
            <Select
              label="Tipo de Moradia"
              value={formState.livingSituation.housingType}
              onChange={(value) => handleLivingSituationSelectChange('housingType', value)}
              options={[
                { value: 'apartment', label: 'Apartamento' },
                { value: 'house', label: 'Casa' },
                { value: 'farm', label: 'Sítio/Fazenda' },
                { value: 'other', label: 'Outro' }
              ]}
              required
              error={getError('adopterInfo.livingSituation.housingType')}
            />

            <Select
              label="Situação da Moradia"
              value={formState.livingSituation.ownRent}
              onChange={(value) => handleLivingSituationSelectChange('ownRent', value)}
              options={[
                { value: 'own', label: 'Próprio' },
                { value: 'rent', label: 'Alugado' }
              ]}
              required
              error={getError('adopterInfo.livingSituation.ownRent')}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="hasYard"
                checked={formState.livingSituation.hasYard}
                onChange={handleLivingSituationChange}
              />
              <span>Possuo quintal/espaço externo</span>
            </label>
          </div>

          {/* Landlord approval - only show if renting */}
          {formState.livingSituation.ownRent === 'rent' && (
            <div className={styles.formGrid}>
              <Select
                label="Proprietário permite animais de estimação?"
                value={formState.livingSituation.landlordApproval === null ? '' : String(formState.livingSituation.landlordApproval)}
                onChange={(value) => handleLivingSituationSelectChange(
                  'landlordApproval',
                  value === '' ? null : value === 'true'
                )}
                options={[
                  { value: '', label: 'Selecione uma opção' },
                  { value: 'true', label: 'Sim' },
                  { value: 'false', label: 'Não' }
                ]}
                required
                error={getError('adopterInfo.livingSituation.landlordApproval')}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Section 3: Pet Experience */}
      <Card className={styles.formSection}>
        <Card.Header>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>3</span>
            Experiência com Animais
          </h3>
        </Card.Header>
        <Card.Body className={styles.sectionBody}>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="hadPetsBefore"
                checked={formState.experience.hadPetsBefore}
                onChange={handleExperienceChange}
              />
              <span>Já tive animais de estimação antes</span>
            </label>
          </div>

          {/* Current Pets List */}
          {formState.experience.currentPets.length > 0 && (
            <div className={styles.currentPetsList}>
              <h4 className={styles.subheading}>Meus animais atuais:</h4>
              {formState.experience.currentPets.map((pet, index) => (
                <Card key={index} className={styles.petCard}>
                  <Card.Body className={styles.petCardBody}>
                    <div className={styles.petInfo}>
                      <div className={styles.petDetails}>
                        <p className={styles.petDetail}>
                          <span className={styles.label}>Espécie:</span> {pet.species}
                        </p>
                        <p className={styles.petDetail}>
                          <span className={styles.label}>Raça:</span> {pet.breed}
                        </p>
                        <p className={styles.petDetail}>
                          <span className={styles.label}>Idade:</span> {pet.age}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleRemoveCurrentPet(index)}
                      className={styles.removeButton}
                    >
                      Remover
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Add Current Pet Form */}
          {!showCurrentPetForm && (
            <Button
              variant="outline"
              onClick={() => setShowCurrentPetForm(true)}
              className={styles.addPetButton}
            >
              + Adicionar animal atual
            </Button>
          )}

          {showCurrentPetForm && (
            <Card className={styles.petInputCard}>
              <Card.Body className={styles.petInputBody}>
                <Input
                  label="Espécie"
                  type="text"
                  placeholder="Ex: Cachorro, Gato, Pássaro"
                  value={currentPetInput.species}
                  onChange={(e) => setCurrentPetInput({ ...currentPetInput, species: e.target.value })}
                />
                <Input
                  label="Raça"
                  type="text"
                  placeholder="Ex: Poodle, Siamês"
                  value={currentPetInput.breed}
                  onChange={(e) => setCurrentPetInput({ ...currentPetInput, breed: e.target.value })}
                />
                <Input
                  label="Idade"
                  type="text"
                  placeholder="Ex: 3 anos, 6 meses"
                  value={currentPetInput.age}
                  onChange={(e) => setCurrentPetInput({ ...currentPetInput, age: e.target.value })}
                />
                <div className={styles.petInputActions}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setShowCurrentPetForm(false);
                      setCurrentPetInput({ species: '', breed: '', age: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddCurrentPet}
                  >
                    Adicionar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          <div className={styles.formGrid}>
            <Input
              label="Informações do Veterinário (opcional)"
              name="veterinarianInfo"
              value={formState.experience.veterinarianInfo}
              onChange={handleExperienceChange}
              placeholder="Nome, telefone ou email do seu veterinário"
              helperText="Isso nos ajuda a verificar o cuidado anterior com pets"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Section 4: Motivation & Commitment */}
      <Card className={styles.formSection}>
        <Card.Header>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>4</span>
            Motivação e Comprometimento
          </h3>
        </Card.Header>
        <Card.Body className={styles.sectionBody}>
          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>
              Por que você quer adotar um pet? <span className={styles.required}>*</span>
            </label>
            <textarea
              name="whyAdopt"
              value={formState.motivation.whyAdopt}
              onChange={handleMotivationChange}
              placeholder="Conte-nos sobre suas razões para adotar..."
              rows={4}
              className={styles.textarea}
              required
            />
            {getError('adopterInfo.motivation.whyAdopt') && (
              <span className={styles.fieldError}>
                {getError('adopterInfo.motivation.whyAdopt')}
              </span>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>
              Qual é seu comprometimento esperado com o pet? <span className={styles.required}>*</span>
            </label>
            <textarea
              name="expectedCommitment"
              value={formState.motivation.expectedCommitment}
              onChange={handleMotivationChange}
              placeholder="Descreva como você planeja cuidar do pet (alimentação, exercício, veterinário, etc.)..."
              rows={4}
              className={styles.textarea}
              required
            />
            {getError('adopterInfo.motivation.expectedCommitment') && (
              <span className={styles.fieldError}>
                {getError('adopterInfo.motivation.expectedCommitment')}
              </span>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>
              Quanto tempo você tem disponível para o pet? <span className={styles.required}>*</span>
            </label>
            <textarea
              name="availableTime"
              value={formState.motivation.availableTime}
              onChange={handleMotivationChange}
              placeholder="Descreva seu horário de trabalho e quanto tempo pode dedicar ao pet..."
              rows={3}
              className={styles.textarea}
              required
            />
            {getError('adopterInfo.motivation.availableTime') && (
              <span className={styles.fieldError}>
                {getError('adopterInfo.motivation.availableTime')}
              </span>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Form Actions */}
      <div className={styles.formActions}>
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <LoaderIcon size={18} className={styles.loadingIcon} />
              Enviando...
            </>
          ) : (
            <>
              <HeartIcon size={18} />
              Enviar Solicitação de Adoção
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
