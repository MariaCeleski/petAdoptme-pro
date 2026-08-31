'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Card, Select, Badge, Modal } from '@/components/ui';
import { PlusIcon, XIcon, ImageIcon, TrashIcon, EditIcon } from 'lucide-react';
import { petSchema } from '@/lib/validation/schemas';
import { uploadImages } from '@/lib/upload/client';
import styles from './PetForm.module.css';
import { clsx } from 'clsx';

export default function PetForm({ 
  pet, 
  onSubmit, 
  onCancel,
  isLoading = false,
  mode = 'create' // 'create' or 'edit'
}) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    species: pet?.species || 'DOG',
    breed: pet?.breed || '',
    age: pet?.age || '',
    size: pet?.size || 'MEDIUM',
    gender: pet?.gender || 'MALE',
    color: pet?.color || '',
    description: pet?.description || '',
    isNeutered: pet?.isNeutered || false,
    isVaccinated: pet?.isVaccinated || false,
    healthStatus: pet?.healthStatus || '',
    personality: pet?.personality || [],
    location: pet?.location || '',
    images: pet?.images || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [newPersonalityTrait, setNewPersonalityTrait] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Predefined personality traits for suggestions
  const personalityTraits = [
    'Brincalhão', 'Carinhoso', 'Calmo', 'Energético', 'Dócil', 'Protetor',
    'Sociável', 'Independente', 'Obediente', 'Inteligente', 'Amigável',
    'Corajoso', 'Tímido', 'Curioso', 'Leal', 'Paciente'
  ];

  const speciesOptions = [
    { value: 'DOG', label: 'Cão' },
    { value: 'CAT', label: 'Gato' }
  ];

  const sizeOptions = [
    { value: 'SMALL', label: 'Pequeno (até 10kg)' },
    { value: 'MEDIUM', label: 'Médio (10-25kg)' },
    { value: 'LARGE', label: 'Grande (acima de 25kg)' }
  ];

  const genderOptions = [
    { value: 'MALE', label: 'Macho' },
    { value: 'FEMALE', label: 'Fêmea' }
  ];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.getElementById('description');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [formData.description]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const maxImages = 10;
    const currentImages = formData.images.length;
    const availableSlots = maxImages - currentImages;

    if (availableSlots <= 0) {
      setErrors(prev => ({ 
        ...prev, 
        images: 'Máximo de 10 imagens por pet' 
      }));
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setIsUploadingImages(true);
    setErrors(prev => ({ ...prev, images: null }));

    try {
      const uploadResult = await uploadImages(filesToUpload, {
        type: 'pet',
        petId: pet?.id,
        maxFiles: filesToUpload.length
      });

      if (uploadResult.success && uploadResult.uploads) {
        const newImageUrls = uploadResult.uploads.map(upload => upload.urls.main);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImageUrls]
        }));
      } else if (uploadResult.errors?.length > 0) {
        setErrors(prev => ({
          ...prev,
          images: uploadResult.errors.map(e => e.error).join(', ')
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        images: 'Erro ao fazer upload das imagens. Tente novamente.'
      }));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
    setShowImageModal(false);
  };

  const handleReorderImages = (fromIndex, toIndex) => {
    const newImages = [...formData.images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addPersonalityTrait = (trait) => {
    const trimmedTrait = trait.trim();
    if (!trimmedTrait) return;
    
    if (formData.personality.includes(trimmedTrait)) {
      setErrors(prev => ({ 
        ...prev, 
        personality: 'Traço já adicionado' 
      }));
      return;
    }

    if (formData.personality.length >= 10) {
      setErrors(prev => ({ 
        ...prev, 
        personality: 'Máximo 10 traços de personalidade' 
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      personality: [...prev.personality, trimmedTrait]
    }));
    
    setNewPersonalityTrait('');
    setErrors(prev => ({ ...prev, personality: null }));
  };

  const removePersonalityTrait = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    try {
      const validatedData = petSchema.parse(formData);
      setErrors({});
      return { isValid: true, data: validatedData };
    } catch (error) {
      const formErrors = {};
      error.errors?.forEach(err => {
        const field = err.path[0];
        formErrors[field] = err.message;
      });
      setErrors(formErrors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return { isValid: false, data: null };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(validation.data);
    } catch (error) {
      console.error('Submit error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Erro ao salvar pet. Tente novamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting || isUploadingImages;

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.petForm}>
        <div className={styles.formContent}>
          {/* Basic Information */}
          <Card className={styles.formSection}>
            <Card.Header>
              <Card.Title as="h3">Informações Básicas</Card.Title>
              <Card.Description>
                Dados obrigatórios sobre o pet
              </Card.Description>
            </Card.Header>
            
            <Card.Body className={styles.formGrid}>
              <Input
                id="name"
                label="Nome do Pet"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
                disabled={isFormDisabled}
                placeholder="Ex: Buddy, Luna, Max..."
              />

              <Select
                id="species"
                label="Espécie"
                value={formData.species}
                onChange={(value) => handleInputChange('species', value)}
                options={speciesOptions}
                error={errors.species}
                required
                disabled={isFormDisabled}
              />

              <Input
                id="breed"
                label="Raça"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                error={errors.breed}
                required
                disabled={isFormDisabled}
                placeholder="Ex: Labrador, Vira-lata, Persa..."
              />

              <Input
                id="age"
                label="Idade"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                error={errors.age}
                required
                disabled={isFormDisabled}
                placeholder="Ex: 2 anos, 6 meses, Filhote..."
                helperText="Pode ser aproximada: '2 anos', '6 meses', 'Filhote', etc."
              />

              <Select
                id="size"
                label="Porte"
                value={formData.size}
                onChange={(value) => handleInputChange('size', value)}
                options={sizeOptions}
                error={errors.size}
                required
                disabled={isFormDisabled}
              />

              <Select
                id="gender"
                label="Sexo"
                value={formData.gender}
                onChange={(value) => handleInputChange('gender', value)}
                options={genderOptions}
                error={errors.gender}
                required
                disabled={isFormDisabled}
              />

              <Input
                id="color"
                label="Cor"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                error={errors.color}
                required
                disabled={isFormDisabled}
                placeholder="Ex: Preto, Branco e marrom, Rajado..."
              />

              <Input
                id="location"
                label="Localização"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={errors.location}
                disabled={isFormDisabled}
                placeholder="Ex: São Paulo, SP"
                helperText="Cidade e estado onde o pet se encontra"
              />
            </Card.Body>
          </Card>

          {/* Description */}
          <Card className={styles.formSection}>
            <Card.Header>
              <Card.Title as="h3">Descrição</Card.Title>
              <Card.Description>
                Conte mais sobre a personalidade e comportamento do pet
              </Card.Description>
            </Card.Header>
            
            <Card.Body>
              <div className={styles.textareaGroup}>
                <label htmlFor="description" className={styles.label}>
                  Descrição do Pet <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={clsx(styles.textarea, {
                    [styles.error]: errors.description
                  })}
                  placeholder="Descreva o comportamento, preferências, histórico médico, necessidades especiais..."
                  disabled={isFormDisabled}
                  required
                  rows={4}
                />
                {errors.description && (
                  <span className={styles.errorMessage}>{errors.description}</span>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Health Information */}
          <Card className={styles.formSection}>
            <Card.Header>
              <Card.Title as="h3">Informações de Saúde</Card.Title>
              <Card.Description>
                Status de saúde e cuidados veterinários
              </Card.Description>
            </Card.Header>
            
            <Card.Body className={styles.healthSection}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isNeutered}
                    onChange={(e) => handleInputChange('isNeutered', e.target.checked)}
                    disabled={isFormDisabled}
                  />
                  <span className={styles.checkboxLabel}>Castrado/Esterilizado</span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isVaccinated}
                    onChange={(e) => handleInputChange('isVaccinated', e.target.checked)}
                    disabled={isFormDisabled}
                  />
                  <span className={styles.checkboxLabel}>Vacinado</span>
                </label>
              </div>

              <div className={styles.textareaGroup}>
                <label htmlFor="healthStatus" className={styles.label}>
                  Informações Médicas Adicionais
                </label>
                <textarea
                  id="healthStatus"
                  value={formData.healthStatus}
                  onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                  className={styles.textarea}
                  placeholder="Tratamentos em andamento, medicações, necessidades especiais..."
                  disabled={isFormDisabled}
                  rows={3}
                />
                {errors.healthStatus && (
                  <span className={styles.errorMessage}>{errors.healthStatus}</span>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Personality Traits */}
          <Card className={styles.formSection}>
            <Card.Header>
              <Card.Title as="h3">Personalidade</Card.Title>
              <Card.Description>
                Adicione até 10 traços que descrevem o pet
              </Card.Description>
            </Card.Header>
            
            <Card.Body>
              <div className={styles.personalitySection}>
                <div className={styles.personalityInput}>
                  <Input
                    value={newPersonalityTrait}
                    onChange={(e) => setNewPersonalityTrait(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPersonalityTrait(newPersonalityTrait);
                      }
                    }}
                    placeholder="Digite um traço de personalidade..."
                    disabled={isFormDisabled}
                    error={errors.personality}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="medium"
                    onClick={() => addPersonalityTrait(newPersonalityTrait)}
                    disabled={isFormDisabled || !newPersonalityTrait.trim()}
                  >
                    <PlusIcon size={16} />
                    Adicionar
                  </Button>
                </div>

                {/* Predefined traits */}
                <div className={styles.suggestedTraits}>
                  <span className={styles.suggestedLabel}>Sugestões:</span>
                  <div className={styles.traitsBadges}>
                    {personalityTraits
                      .filter(trait => !formData.personality.includes(trait))
                      .slice(0, 8)
                      .map((trait) => (
                        <Badge
                          key={trait}
                          variant="secondary"
                          className={styles.suggestedBadge}
                          onClick={() => addPersonalityTrait(trait)}
                        >
                          {trait}
                          <PlusIcon size={12} />
                        </Badge>
                      ))
                    }
                  </div>
                </div>

                {/* Current traits */}
                {formData.personality.length > 0 && (
                  <div className={styles.currentTraits}>
                    <span className={styles.currentLabel}>
                      Traços adicionados ({formData.personality.length}/10):
                    </span>
                    <div className={styles.traitsBadges}>
                      {formData.personality.map((trait, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className={styles.currentBadge}
                        >
                          {trait}
                          <button
                            type="button"
                            onClick={() => removePersonalityTrait(index)}
                            disabled={isFormDisabled}
                            className={styles.removeBadge}
                            aria-label={`Remover traço ${trait}`}
                          >
                            <XIcon size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Images */}
          <Card className={styles.formSection}>
            <Card.Header>
              <Card.Title as="h3">Fotos do Pet</Card.Title>
              <Card.Description>
                Adicione até 10 fotos para mostrar o pet (primeira foto será a principal)
              </Card.Description>
            </Card.Header>
            
            <Card.Body>
              <div className={styles.imagesSection}>
                {/* Upload Area */}
                <div 
                  className={clsx(styles.uploadArea, {
                    [styles.disabled]: isFormDisabled
                  })}
                  onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                >
                  <ImageIcon size={32} />
                  <span>
                    {isUploadingImages 
                      ? 'Fazendo upload...' 
                      : 'Clique para adicionar fotos'
                    }
                  </span>
                  <span className={styles.uploadHint}>
                    JPG, PNG ou WebP até 5MB cada
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className={styles.hiddenInput}
                  disabled={isFormDisabled}
                />

                {errors.images && (
                  <span className={styles.errorMessage}>{errors.images}</span>
                )}

                {/* Images Grid */}
                {formData.images.length > 0 && (
                  <div className={styles.imagesGrid}>
                    {formData.images.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className={clsx(styles.imageItem, {
                          [styles.primaryImage]: index === 0
                        })}
                      >
                        <img
                          src={imageUrl}
                          alt={`${formData.name || 'Pet'} - Foto ${index + 1}`}
                          className={styles.imagePreview}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageModal(true);
                          }}
                        />
                        
                        {index === 0 && (
                          <Badge variant="primary" className={styles.primaryBadge}>
                            Principal
                          </Badge>
                        )}
                        
                        <div className={styles.imageActions}>
                          <button
                            type="button"
                            className={styles.imageAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(index);
                              setShowImageModal(true);
                            }}
                            aria-label="Ver imagem"
                            disabled={isFormDisabled}
                          >
                            <EditIcon size={14} />
                          </button>
                          
                          <button
                            type="button"
                            className={styles.imageAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            aria-label="Remover imagem"
                            disabled={isFormDisabled}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Form Errors */}
          {errors.submit && (
            <Card variant="error" className={styles.errorCard}>
              <Card.Body>
                <p className={styles.submitError}>{errors.submit}</p>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={onCancel}
            disabled={isFormDisabled}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isFormDisabled}
            loading={isSubmitting}
          >
            {mode === 'edit' ? 'Atualizar Pet' : 'Cadastrar Pet'}
          </Button>
        </div>
      </form>

      {/* Image Modal */}
      <Modal 
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={`Foto ${(selectedImageIndex ?? 0) + 1} de ${formData.images.length}`}
        size="large"
      >
        {selectedImageIndex !== null && formData.images[selectedImageIndex] && (
          <div className={styles.imageModal}>
            <img
              src={formData.images[selectedImageIndex]}
              alt={`${formData.name || 'Pet'} - Foto ${selectedImageIndex + 1}`}
              className={styles.modalImage}
            />
            
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => handleRemoveImage(selectedImageIndex)}
                disabled={isFormDisabled}
              >
                <TrashIcon size={16} />
                Remover Foto
              </Button>
              
              {selectedImageIndex > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => handleReorderImages(selectedImageIndex, 0)}
                  disabled={isFormDisabled}
                >
                  Tornar Principal
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}