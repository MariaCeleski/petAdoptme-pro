'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './EditProfileForm.module.css';

export default function EditProfileForm({ user, onSuccess }) {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Formato inválido. Use JPEG, PNG ou WebP');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha no upload de imagem');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Avatar upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let avatarUrl = user?.avatar;

      // Upload avatar if selected
      if (selectedFile) {
        avatarUrl = await uploadAvatar();
      }

      // Prepare update data
      const updateData = {
        ...formData,
        avatar: avatarUrl,
      };

      // Call profile update API
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 409) {
          setErrorMessage('Este email já está em uso');
        } else if (error.details) {
          // Show first validation error
          const firstError = Object.values(error.details)[0];
          setErrorMessage(firstError?._errors?.[0] || error.error || 'Erro ao atualizar perfil');
        } else {
          setErrorMessage(error.error || 'Erro ao atualizar perfil');
        }
        return;
      }

      const result = await response.json();

      // Update session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: result.user.name,
          email: result.user.email,
          image: result.user.avatar,
        },
      });

      setSuccessMessage('Perfil atualizado com sucesso!');
      setSelectedFile(null);

      // Call callback if provided
      if (onSuccess) {
        onSuccess(result.user);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className={styles.avatarUpload}>
            <label htmlFor="avatar-input" className={styles.uploadLabel}>
              <span>Alterar Avatar</span>
            </label>
            <input
              type="file"
              id="avatar-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={loading || uploading}
              className={styles.fileInput}
            />
            <p className={styles.uploadInfo}>
              JPEG, PNG ou WebP. Máximo 5MB.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className={styles.fieldGroup}>
          <label htmlFor="name" className={styles.label}>
            Nome *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Seu nome completo"
            disabled={loading}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="seu@email.com"
            disabled={loading}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="phone" className={styles.label}>
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
              disabled={loading}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="location" className={styles.label}>
              Localização
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Cidade, Estado"
              disabled={loading}
              className={styles.input}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={loading || uploading}
            className={styles.submitButton}
          >
            {loading || uploading ? (
              <>
                <span className={styles.spinner}></span>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
