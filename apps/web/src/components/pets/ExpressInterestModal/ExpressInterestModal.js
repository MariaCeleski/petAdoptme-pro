'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Card, Input, Select } from '@/components/ui';
import { 
  HeartIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon
} from 'lucide-react';
import styles from './ExpressInterestModal.module.css';

/**
 * ExpressInterestModal Component
 * Modal para manifestar interesse em adotar um pet
 * Requirements: 5.5, 5.6, 6.1, 6.2
 */
export default function ExpressInterestModal({
  isOpen,
  onClose,
  pet,
  adoptionForm,
  onSubmit,
  isLoading = false,
  error = null,
  successMessage = null
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    housingSituation: 'apartment', // apartment, house, farm
    rentalStatus: 'own', // own, rent
    landlordAllowsPets: null,
    ownedPets: '',
    petExperience: 'some', // none, some, extensive
    adoptionMotivation: '',
    adoptionReasons: [], // companionship, family, health, other
    workSchedule: 'home', // home, part-time, full-time
    references: '',
    termsAccepted: false
  });

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  /**
   * Handle adoption reasons change
   */
  const handleAdoptionReasonsChange = useCallback((reason) => {
    setFormData(prev => ({
      ...prev,
      adoptionReasons: prev.adoptionReasons.includes(reason)
        ? prev.adoptionReasons.filter(r => r !== reason)
        : [...prev.adoptionReasons, reason]
    }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Por favor, preencha os campos obrigatórios (nome, e-mail, telefone)');
      return;
    }

    if (!formData.termsAccepted) {
      alert('Por favor, aceite os termos e condições');
      return;
    }

    // Submit adoption request
    onSubmit?.({
      petId: pet.id,
      ...formData
    });
  }, [formData, pet?.id, onSubmit]);

  if (!pet) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <HeartIcon size={24} className={styles.headerIcon} />
            <div>
              <h2 className={styles.modalTitle}>Manifestar Interesse</h2>
              <p className={styles.modalSubtitle}>
                Formulário de adoção para <strong>{pet.name}</strong>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={onClose}
            className={styles.closeButton}
          >
            <XIcon size={20} />
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <CheckCircleIcon size={20} className={styles.successIcon} />
            <div>
              <h4>Sucesso!</h4>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircleIcon size={20} className={styles.errorIcon} />
            <div>
              <h4>Erro</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Pet Summary */}
          <Card className={styles.petSummary}>
            <Card.Body>
              <div className={styles.petSummaryContent}>
                {pet.images && pet.images[0] && (
                  <img 
                    src={pet.images[0]} 
                    alt={pet.name}
                    className={styles.petImage}
                  />
                )}
                <div className={styles.petInfo}>
                  <h4>{pet.name}</h4>
                  <p>{pet.breed} • {pet.age} anos • {pet.size}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Personal Information Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
            
            <div className={styles.formGrid}>
              <Input
                label="Nome Completo *"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Seu nome"
              />
              
              <Input
                label="E-mail *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
              
              <Input
                label="Telefone *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div className={styles.formGrid}>
              <Input
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número"
              />
              
              <Input
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Sua cidade"
              />
              
              <Input
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="UF"
                maxLength="2"
              />
              
              <Input
                label="CEP"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="XXXXX-XXX"
              />
            </div>
          </div>

          {/* Housing Information Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Situação de Moradia</h3>
            
            <div className={styles.formGrid}>
              <Select
                label="Tipo de Moradia"
                name="housingSituation"
                value={formData.housingSituation}
                onChange={handleChange}
                options={[
                  { value: 'apartment', label: 'Apartamento' },
                  { value: 'house', label: 'Casa' },
                  { value: 'farm', label: 'Sítio/Fazenda' }
                ]}
              />
              
              <Select
                label="Situação de Propriedade"
                name="rentalStatus"
                value={formData.rentalStatus}
                onChange={handleChange}
                options={[
                  { value: 'own', label: 'Próprio' },
                  { value: 'rent', label: 'Alugado' }
                ]}
              />
            </div>

            {formData.rentalStatus === 'rent' && (
              <div className={styles.formGrid}>
                <Select
                  label="Proprietário permite animais de estimação?"
                  name="landlordAllowsPets"
                  value={formData.landlordAllowsPets === null ? '' : formData.landlordAllowsPets}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    landlordAllowsPets: value === '' ? null : value === 'true'
                  }))}
                  options={[
                    { value: '', label: 'Selecione uma opção' },
                    { value: 'true', label: 'Sim' },
                    { value: 'false', label: 'Não' }
                  ]}
                />
              </div>
            )}
          </div>

          {/* Pet Experience Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Experiência com Pets</h3>
            
            <Input
              label="Você possui outros animais? Se sim, descreva"
              name="ownedPets"
              value={formData.ownedPets}
              onChange={handleChange}
              placeholder="Ex: 1 cachorro e 2 gatos"
            />

            <Select
              label="Nível de Experiência com Animais"
              name="petExperience"
              value={formData.petExperience}
              onChange={handleChange}
              options={[
                { value: 'none', label: 'Nenhuma experiência' },
                { value: 'some', label: 'Alguma experiência' },
                { value: 'extensive', label: 'Experiência extensiva' }
              ]}
            />

            <div className={styles.workScheduleGroup}>
              <label className={styles.groupLabel}>Horário de Trabalho</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="workSchedule"
                    value="home"
                    checked={formData.workSchedule === 'home'}
                    onChange={handleChange}
                  />
                  <span>Trabalho em casa</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="workSchedule"
                    value="part-time"
                    checked={formData.workSchedule === 'part-time'}
                    onChange={handleChange}
                  />
                  <span>Período parcial</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="workSchedule"
                    value="full-time"
                    checked={formData.workSchedule === 'full-time'}
                    onChange={handleChange}
                  />
                  <span>Período integral</span>
                </label>
              </div>
            </div>
          </div>

          {/* Adoption Motivation Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Motivação para Adoção</h3>
            
            <div className={styles.reasonsGroup}>
              <label className={styles.groupLabel}>Por que você quer adotar?</label>
              <div className={styles.checkboxGrid}>
                {[
                  { id: 'companionship', label: 'Companhia' },
                  { id: 'family', label: 'Para minha família' },
                  { id: 'health', label: 'Benefícios à saúde' },
                  { id: 'other', label: 'Outro motivo' }
                ].map(reason => (
                  <label key={reason.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.adoptionReasons.includes(reason.id)}
                      onChange={() => handleAdoptionReasonsChange(reason.id)}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.textareaGroup}>
              <label className={styles.textareaLabel}>Conte-nos sobre sua motivação para adotar</label>
              <textarea
                name="adoptionMotivation"
                value={formData.adoptionMotivation}
                onChange={handleChange}
                placeholder="Por que você quer adotar este pet?"
                rows={4}
                className={styles.textarea}
              />
            </div>
          </div>

          {/* References Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Referências</h3>
            
            <div className={styles.textareaGroup}>
              <label className={styles.textareaLabel}>Referências (veterinário, amigos, etc.)</label>
              <textarea
                name="references"
                value={formData.references}
                onChange={handleChange}
                placeholder="Forneca informações de contato de referencias"
                rows={3}
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className={styles.termsSection}>
            <label className={styles.termsLabel}>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
              />
              <span>
                Eu compreendo que esta é uma solicitação de adoção e que o proprietário do pet 
                pode me contar mais sobre {pet.name} antes de aprovar a adoção. *
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}