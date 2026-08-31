'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { shelterSchema } from '@/lib/validation/schemas.js';
import { useImageUpload } from '@/hooks/useImageUpload.js';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import OptimizedImage from '@/components/ui/OptimizedImage/OptimizedImage';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './ShelterForm.module.css';

/**
 * ShelterForm Component
 * 
 * Formulário para criar ou editar perfil de abrigo
 * Valida informações obrigatórias e permite upload de logo e fotos
 * 
 * Props:
 * - shelter: Objeto com dados do abrigo para edição (opcional)
 * - onSuccess: Callback executado após sucesso (opcional)
 * 
 * Validates Requirements: 11.1, 11.2, 11.4
 */
export default function ShelterForm({ shelter = null, onSuccess = null }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: shelter?.name || '',
    address: shelter?.address || '',
    city: shelter?.city || '',
    state: shelter?.state || '',
    zipCode: shelter?.zipCode || '',
    phone: shelter?.phone || '',
    email: shelter?.email || '',
    website: shelter?.website || '',
    description: shelter?.description || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(shelter?.logo || null);
  const [photosPreview, setPhotosPreview] = useState(shelter?.images ? JSON.parse(shelter.images) : []);
  const logoInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const { uploadImages, isUploading: isUploadingImages, error: uploadError } = useImageUpload();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingSkeleton height={400} />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'Arquivo muito grande. Máximo 5MB'
        }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          logo: 'Formato inválido. Use JPEG, PNG ou WebP'
        }));
        return;
      }
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({
        ...prev,
        logo: ''
      }));
    }
  };

  const handlePhotosChange = (e) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = [];
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({
            ...prev,
            photos: 'Um ou mais arquivos são muito grandes. Máximo 5MB por arquivo'
          }));
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setErrors(prev => ({
            ...prev,
            photos: 'Um ou mais arquivos possuem formato inválido. Use JPEG, PNG ou WebP'
          }));
          return;
        }
        newPhotos.push(file);
      }

      // Create previews
      Promise.all(newPhotos.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      })).then(previews => {
        setPhotosPreview(prev => [...prev, ...previews].slice(0, 10));
      });

      if (newPhotos.length > 0) {
        setErrors(prev => ({
          ...prev,
          photos: ''
        }));
      }
    }
  };

  const removePhoto = (index) => {
    setPhotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);
    setErrors({});

    try {
      // Validate form data
      const validation = shelterSchema.safeParse(formData);
      if (!validation.success) {
        const newErrors = {};
        validation.error.errors.forEach(err => {
          const path = err.path[0];
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Upload images if needed
      let logoUrl = logoPreview;
      let photoUrls = photosPreview;

      // Upload logo if it's a data URL (new upload)
      if (logoPreview?.startsWith('data:')) {
        const logoFile = logoInputRef.current?.files?.[0];
        if (logoFile) {
          const uploadedLogos = await uploadImages([logoFile], 'shelter-logos');
          if (uploadedLogos.length > 0) {
            logoUrl = uploadedLogos[0];
          }
        }
      }

      // Upload photos if any are data URLs (new uploads)
      const newPhotoFiles = [];
      for (let i = 0; i < photosPreview.length; i++) {
        if (photosPreview[i].startsWith('data:')) {
          const file = photosInputRef.current?.files?.[i];
          if (file) {
            newPhotoFiles.push(file);
          }
        }
      }
      
      if (newPhotoFiles.length > 0) {
        const uploadedPhotos = await uploadImages(newPhotoFiles, 'shelter-photos');
        // Replace data URLs with uploaded URLs
        photoUrls = photosPreview.map((photo, idx) => {
          if (photo.startsWith('data:')) {
            const uploadIdx = Array.from(photosInputRef.current?.files || [])
              .findIndex(f => f === newPhotoFiles[newPhotoFiles.length - 1]);
            return uploadedPhotos[uploadIdx] || photo;
          }
          return photo;
        });
      }

      // Prepare submission data
      const submissionData = {
        ...validation.data,
        logo: logoUrl || null,
        images: photoUrls,
      };

      // Submit form
      const url = shelter ? `/api/shelters/${shelter.id}` : '/api/shelters';
      const method = shelter ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Erro ao salvar abrigo. Tente novamente.');
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push('/dashboard/shelter');
      }
    } catch (err) {
      setSubmitError(err.message || 'Erro ao salvar abrigo. Tente novamente.');
      console.error('Erro ao salvar abrigo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>
        {shelter ? 'Editar Perfil do Abrigo' : 'Criar Perfil do Abrigo'}
      </h2>

      {submitError && (
        <div className={styles.errorMessage}>
          {submitError}
        </div>
      )}

      {uploadError && (
        <div className={styles.errorMessage}>
          {uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Logo Upload */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Logo do Abrigo</h3>
          <div className={styles.uploadContainer}>
            {logoPreview && (
              <div className={styles.previewContainer}>
                <OptimizedImage
                  src={logoPreview}
                  alt="Logo preview"
                  width={150}
                  height={150}
                  className={styles.logoPreview}
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className={styles.removeButton}
                  aria-label="Remover logo"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoChange}
              disabled={isUploadingImages}
              className={styles.hiddenInput}
              aria-label="Enviar logo do abrigo"
            />
            <Button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingImages}
              className={styles.uploadButton}
            >
              {isUploadingImages ? 'Enviando...' : 'Enviar Logo'}
            </Button>
            {errors.logo && <span className={styles.error}>{errors.logo}</span>}
          </div>
        </div>

        {/* Photos Upload */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Fotos do Abrigo ({photosPreview.length}/10)</h3>
          <div className={styles.photosGrid}>
            {photosPreview.map((photo, idx) => (
              <div key={idx} className={styles.photoContainer}>
                <OptimizedImage
                  src={photo}
                  alt={`Foto ${idx + 1}`}
                  width={120}
                  height={120}
                  className={styles.photoPreview}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className={styles.removeButton}
                  aria-label={`Remover foto ${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {photosPreview.length < 10 && (
            <>
              <input
                ref={photosInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotosChange}
                disabled={isUploadingImages}
                className={styles.hiddenInput}
                aria-label="Enviar fotos do abrigo"
              />
              <Button
                type="button"
                onClick={() => photosInputRef.current?.click()}
                disabled={isUploadingImages}
                className={styles.uploadButton}
              >
                {isUploadingImages ? 'Enviando...' : `Adicionar Fotos (${10 - photosPreview.length} restantes)`}
              </Button>
            </>
          )}
          
          {errors.photos && <span className={styles.error}>{errors.photos}</span>}
        </div>

        {/* Required Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações Obrigatórias</h3>
          
          <Input
            label="Nome do Abrigo"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
            maxLength={100}
            aria-required="true"
          />

          <div className={styles.formRow}>
            <Input
              label="Telefone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
              placeholder="(11) 99999-9999"
              aria-required="true"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              aria-required="true"
            />
          </div>

          <Input
            label="Endereço"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
            required
            maxLength={200}
            aria-required="true"
          />

          <div className={styles.formRow}>
            <Input
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              error={errors.city}
              required
              maxLength={50}
              aria-required="true"
            />
            <Input
              label="Estado"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              error={errors.state}
              required
              maxLength={50}
              aria-required="true"
            />
            <Input
              label="CEP"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              error={errors.zipCode}
              required
              placeholder="00000-000"
              aria-required="true"
            />
          </div>
        </div>

        {/* Optional Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações Adicionais</h3>
          
          <Input
            label="Site (opcional)"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            error={errors.website}
            placeholder="https://example.com"
          />

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Descrição (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              maxLength={2000}
              placeholder="Conte-nos sobre seu abrigo, sua missão e histórico..."
              rows={6}
            />
            <span className={styles.charCount}>{formData.description.length}/2000</span>
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.buttonContainer}>
          <Button
            type="submit"
            disabled={isLoading || isUploadingImages}
            className={styles.submitButton}
          >
            {isLoading || isUploadingImages ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
