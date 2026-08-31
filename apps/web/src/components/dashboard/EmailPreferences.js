'use client';

import { useState } from 'react';
import styles from './EmailPreferences.module.css';

/**
 * EmailPreferences Component
 * Allows adopters to manage their email notification preferences
 * Requirements: 8.5 (unsubscribe options)
 */
export function EmailPreferences() {
  const [preferences, setPreferences] = useState({
    adoptionUpdates: true,
    newPetsMatching: true,
    platformNews: false,
    weeklyDigest: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaveStatus({ type: 'success', message: 'Preferências salvas com sucesso!' });
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Erro ao salvar preferências' });
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceList = [
    {
      key: 'adoptionUpdates',
      label: 'Atualizações de Adoção',
      description: 'Receba notificações sobre mudanças no status de suas solicitações de adoção'
    },
    {
      key: 'newPetsMatching',
      label: 'Novos Pets Compatíveis',
      description: 'Receba alertas quando novos pets que correspondem às suas preferências forem adicionados'
    },
    {
      key: 'platformNews',
      label: 'Notícias da Plataforma',
      description: 'Receba informações sobre novos recursos e atualizações da PetAdopt'
    },
    {
      key: 'weeklyDigest',
      label: 'Resumo Semanal',
      description: 'Receba um resumo semanal de todas as atividades importantes'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notificações por Email</h2>
        <p className={styles.sectionDescription}>
          Escolha quais notificações você gostaria de receber
        </p>
      </div>

      <div className={styles.preferencesList}>
        {preferenceList.map((pref) => (
          <div key={pref.key} className={styles.preferenceItem}>
            <div className={styles.preferenceContent}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={preferences[pref.key]}
                  onChange={() => handleToggle(pref.key)}
                  className={styles.checkbox}
                />
                <span className={styles.labelText}>{pref.label}</span>
              </label>
              <p className={styles.description}>{pref.description}</p>
            </div>
          </div>
        ))}
      </div>

      {saveStatus && (
        <div className={`${styles.statusMessage} ${styles[`status${saveStatus.type.charAt(0).toUpperCase() + saveStatus.type.slice(1)}`]}`}>
          {saveStatus.message}
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={styles.saveButton}
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </button>
      </div>

      <div className={styles.section} style={{ marginTop: '2rem' }}>
        <h3 className={styles.sectionTitle}>Desinscrição</h3>
        <p className={styles.sectionDescription}>
          Você pode gerenciar sua inscrição a qualquer momento
        </p>
        <p className={styles.unsubscribeText}>
          Todos os emails da PetAdopt incluem um link de "Desinscrever" no rodapé. 
          Clique nele para gerenciar suas preferências de qualquer email recebido.
        </p>
      </div>
    </div>
  );
}
