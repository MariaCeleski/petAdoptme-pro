'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './edit.module.css';

/**
 * Edit Pet Page - Owner Dashboard
 * Allows pet owners to edit existing pet information
 * Requirements: 2.5, 2.6
 */
export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    description: '',
    personality: [],
    healthStatus: '',
    isVaccinated: false,
    isNeutered: false,
    microchip: false,
    allergies: '',
    compatibilityChildren: null,
    compatibilityAnimals: null,
    temperament: '',
    acceptOutsideCity: false
  });

  // Fetch pet data on mount
  useEffect(() => {
    if (!params.id || !session?.user?.id) return;

    const fetchPet = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pets/${params.id}`);
        if (!response.ok) {
          throw new Error('Pet not found');
        }

        const data = await response.json();

        if (!data.pet) {
          throw new Error('Pet data is missing');
        }

        // Check ownership
        if (data.pet.owner?.id !== session.user.id) {
          throw new Error('You do not have access to this pet');
        }

        setPet(data.pet);
        setFormData({
          name: data.pet.name || '',
          breed: data.pet.breed || '',
          age: data.pet.age || '',
          color: data.pet.color || '',
          description: data.pet.description || '',
          personality: Array.isArray(data.pet.personality) ? data.pet.personality : [],
          healthStatus: data.pet.healthStatus || '',
          isVaccinated: data.pet.isVaccinated || false,
          isNeutered: data.pet.isNeutered || false,
          microchip: data.pet.microchip || false,
          allergies: data.pet.allergies || '',
          compatibilityChildren: data.pet.compatibilityChildren || null,
          compatibilityAnimals: data.pet.compatibilityAnimals || null,
          temperament: data.pet.temperament || '',
          acceptOutsideCity: data.pet.acceptOutsideCity || false
        });
      } catch (err) {
        console.error('Error fetching pet:', err);
        setError(err.message || 'Failed to load pet');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [params.id, session?.user?.id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSuccess(false);
  };

  const handlePersonalityToggle = (trait) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait]
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update pet');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/owner/pets/${params.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Carregando informações do pet...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !pet) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4v2m0 0v1m0-1h-1m1 0h1" />
          </svg>
          <h2>Erro ao carregar pet</h2>
          <p>{error}</p>
          <Link href="/dashboard/owner" className={styles.backButton}>
            ← Voltar para Meus Pets
          </Link>
        </div>
      </div>
    );
  }

  const traits = ['Dócil', 'Brincalhão', 'Tímido', 'Calmo', 'Independente', 'Afetuoso', 'Inteligente', 'Protetor'];

  return (
    <div className={styles.editPetPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Link href={`/dashboard/owner/pets/${params.id}`} className={styles.backLink}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para {pet?.name}
          </Link>
          <h1 className={styles.title}>Editar {pet?.name}</h1>
          <p className={styles.subtitle}>Atualize as informações do seu pet</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className={styles.errorAlert}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className={styles.successAlert}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Pet atualizado com sucesso! Redirecionando...</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Informações Básicas</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nome do pet"
                disabled
              />
              <p className={styles.hint}>Nome não pode ser alterado</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Raça</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ex: Labrador, Persa"
                disabled
              />
              <p className={styles.hint}>Raça não pode ser alterada</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Idade (anos)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ex: 3"
                min="0"
                max="50"
                disabled
              />
              <p className={styles.hint}>Idade não pode ser alterada</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cor/Aparência</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ex: Branco com manchas"
                disabled
              />
              <p className={styles.hint}>Aparência não pode ser alterada</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Descrição</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Sobre {pet?.name}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Conte uma história sobre o pet..."
              rows="5"
            />
            <p className={styles.hint}>Descreva a personalidade, hábitos e características especiais</p>
          </div>
        </div>

        {/* Personality Traits */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Personalidade</h2>

          <div className={styles.traitsGrid}>
            {traits.map(trait => (
              <label key={trait} className={styles.traitLabel}>
                <input
                  type="checkbox"
                  checked={formData.personality.includes(trait)}
                  onChange={() => handlePersonalityToggle(trait)}
                  className={styles.checkbox}
                />
                <span className={styles.traitName}>{trait}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Health Information */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Saúde</h2>

          <div className={styles.healthGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isVaccinated"
                checked={formData.isVaccinated}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Vacinado</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isNeutered"
                checked={formData.isNeutered}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Castrado/Esterilizado</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="microchip"
                checked={formData.microchip}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Microchip</span>
            </label>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status de Saúde</label>
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ex: Saudável, Repouso necessário"
              />
              <p className={styles.hint}>Informações sobre a saúde geral do pet</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alergias/Restrições</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ex: Alergia a frango"
              />
              <p className={styles.hint}>Alergias alimentares ou medicamentosas</p>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Compatibilidade</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Com Crianças</label>
              <select
                name="compatibilityChildren"
                value={formData.compatibilityChildren || ''}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Selecione...</option>
                <option value="SIM">Sim - Ótimo com crianças</option>
                <option value="NÃO">Não - Não recomendado</option>
                <option value="TALVEZ">Talvez - Com supervisão</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Com Outros Animais</label>
              <select
                name="compatibilityAnimals"
                value={formData.compatibilityAnimals || ''}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Selecione...</option>
                <option value="SIM">Sim - Compatível</option>
                <option value="NÃO">Não - Não compatível</option>
                <option value="TALVEZ">Talvez - Depende</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Temperamento</label>
              <select
                name="temperament"
                value={formData.temperament || ''}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Selecione...</option>
                <option value="DOCIL">Dócil</option>
                <option value="BRINCALHAO">Brincalhão</option>
                <option value="TIMIDO">Tímido</option>
                <option value="CALMO">Calmo</option>
                <option value="AGRESSIVO">Agressivo</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="acceptOutsideCity"
                  checked={formData.acceptOutsideCity}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>Aceita adoção fora da cidade</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href={`/dashboard/owner/pets/${params.id}`} className={styles.cancelButton}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? 'Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
