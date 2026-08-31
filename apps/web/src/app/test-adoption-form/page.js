'use client';

import { useState } from 'react';
import { AdoptionForm } from '@/components/adoption';

/**
 * Test Page for AdoptionForm Component
 * Allows manual testing of the form with mock submission
 */
export default function TestAdoptionFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✓ Form Data Submitted:', formData);
      setSubmittedData(formData);
      setSuccessMessage('Formulário enviado com sucesso!');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('✗ Submission Error:', err);
      setError(err.message || 'Erro ao enviar o formulário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    console.log('✓ Success callback triggered');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Teste - Formulário de Adoção</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Página de teste para o componente AdoptionForm
        </p>
      </div>

      <AdoptionForm
        petId="clr1234567890abcdefg"
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        isLoading={isLoading}
        error={error}
        successMessage={successMessage}
      />

      {submittedData && (
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0284c7',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Dados Enviados (JSON):</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <h4 style={{ marginTop: 0 }}>Instruções:</h4>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Preencha todos os campos obrigatórios</li>
          <li>Testes de validação são executados automaticamente</li>
          <li>Verifique o console do navegador para detalhes</li>
          <li>Os dados enviados aparecem abaixo após a submissão</li>
          <li>Se a moradia for alugada, será solicitada aprovação do proprietário</li>
          <li>Você pode adicionar/remover animais de estimação atuais</li>
        </ul>
      </div>
    </div>
  );
}
