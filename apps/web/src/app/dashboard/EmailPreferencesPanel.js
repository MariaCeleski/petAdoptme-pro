'use client';

/**
 * Email Preferences Management Panel
 * 
 * Allows users to manage their email notification preferences
 * Requirements: 8.4 (email template customization), 8.5 (unsubscribe option)
 */

import { useState, useEffect } from 'react';
import styles from './EmailPreferencesPanel.module.css';

export default function EmailPreferencesPanel() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }
      
      const data = await response.json();
      setPreferences(data.preferences);
      setError(null);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Não foi possível carregar suas preferências de email. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (preferenceKey) => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedPreferences = {
        ...preferences,
        [preferenceKey]: !preferences[preferenceKey]
      };
      
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            adoptionNotifications: updatedPreferences.adoptionNotifications,
            statusChangeNotifications: updatedPreferences.statusChangeNotifications,
            petMatchingAlerts: updatedPreferences.petMatchingAlerts,
            newsletter: updatedPreferences.newsletter
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      const data = await response.json();
      setPreferences(data.preferences);
      setMessage('Suas preferências foram atualizadas com sucesso!');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Erro ao atualizar preferências. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleResubscribe = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/email/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            adoptionNotifications: true,
            statusChangeNotifications: true,
            petMatchingAlerts: true,
            newsletter: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to resubscribe');
      }
      
      const data = await response.json();
      setPreferences(data.preferences);
      setMessage('Você foi reativado em todas as notificações!');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error resubscribing:', err);
      setError('Erro ao se reativar. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando suas preferências de email...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Não foi possível carregar suas preferências.</div>
        <button onClick={loadPreferences} className={styles.retryButton}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Preferências de Email</h2>
      <p className={styles.description}>
        Controle quais tipos de notificações você deseja receber por email.
      </p>

      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {preferences.unsubscribedAll && (
        <div className={styles.unsubscribedWarning}>
          <h3>⚠️ Você está desinscrição de todos os emails</h3>
          <p>Você cancelou a inscrição de todas as notificações de email.</p>
          <button 
            onClick={handleResubscribe}
            disabled={saving}
            className={styles.resubscribeButton}
          >
            {saving ? 'Ativando...' : 'Reativar Todas as Notificações'}
          </button>
        </div>
      )}

      <div className={styles.preferencesGrid}>
        <div className={styles.preferenceItem}>
          <label className={styles.preferenceLabel}>
            <input
              type="checkbox"
              checked={preferences.adoptionNotifications}
              onChange={() => handleToggle('adoptionNotifications')}
              disabled={saving || preferences.unsubscribedAll}
              className={styles.checkbox}
            />
            <span className={styles.labelText}>
              <strong>Notificações de Solicitação de Adoção</strong>
              <br />
              <small>Receba alertas quando houver nova solicitação de adoção para seus pets</small>
            </span>
          </label>
        </div>

        <div className={styles.preferenceItem}>
          <label className={styles.preferenceLabel}>
            <input
              type="checkbox"
              checked={preferences.statusChangeNotifications}
              onChange={() => handleToggle('statusChangeNotifications')}
              disabled={saving || preferences.unsubscribedAll}
              className={styles.checkbox}
            />
            <span className={styles.labelText}>
              <strong>Atualizações de Status de Adoção</strong>
              <br />
              <small>Receba notificações sobre mudanças no status de suas solicitações de adoção</small>
            </span>
          </label>
        </div>

        <div className={styles.preferenceItem}>
          <label className={styles.preferenceLabel}>
            <input
              type="checkbox"
              checked={preferences.petMatchingAlerts}
              onChange={() => handleToggle('petMatchingAlerts')}
              disabled={saving || preferences.unsubscribedAll}
              className={styles.checkbox}
            />
            <span className={styles.labelText}>
              <strong>Alertas de Pets Compatíveis</strong>
              <br />
              <small>Receba alertas quando novos pets que combinam com suas preferências estiverem disponíveis</small>
            </span>
          </label>
        </div>

        <div className={styles.preferenceItem}>
          <label className={styles.preferenceLabel}>
            <input
              type="checkbox"
              checked={preferences.newsletter}
              onChange={() => handleToggle('newsletter')}
              disabled={saving || preferences.unsubscribedAll}
              className={styles.checkbox}
            />
            <span className={styles.labelText}>
              <strong>Newsletter e Comunicações Gerais</strong>
              <br />
              <small>Receba atualizações, histórias de sucesso e notícias sobre o PetAdopt</small>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3>Cancelar Inscrição de Todos os Emails</h3>
        <p>
          Se preferir não receber nenhum email do PetAdopt, você pode cancelar completamente sua inscrição. 
          Você sempre pode reativar suas preferências acessando esta página novamente.
        </p>
        <p>
          <a href={`/api/email/unsubscribe?token=${preferences.unsubscribeToken}`} 
             className={styles.unsubscribeLink}
             onClick={(e) => {
               if (!confirm('Tem certeza que deseja se desinscrever de todos os emails? Você poderá reativar a qualquer momento.')) {
                 e.preventDefault();
               }
             }}>
            Desinscrever de Todos os Emails
          </a>
        </p>
      </div>

      <div className={styles.infoBox}>
        <h3>Como funcionam as preferências?</h3>
        <ul>
          <li><strong>Ativadas:</strong> Você receberá este tipo de notificação por email</li>
          <li><strong>Desativadas:</strong> Você não receberá este tipo de notificação</li>
          <li><strong>Desinscrição Completa:</strong> Nenhum email será enviado até você reativar</li>
        </ul>
      </div>
    </div>
  );
}
