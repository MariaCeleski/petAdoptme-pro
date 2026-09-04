'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [data, setData] = useState({
    authToken: null,
    sessionToken: null,
    backendUrl: null,
    apiHealth: null,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const sessionToken = sessionStorage.getItem('authToken');
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Tentar conectar ao backend
        let apiHealth = null;
        try {
          const response = await fetch(`${backendUrl}/api/health`);
          apiHealth = response.ok ? 'OK' : `Erro: ${response.status}`;
        } catch (e) {
          apiHealth = `Erro: ${e.message}`;
        }

        setData({
          authToken: authToken ? authToken.substring(0, 30) + '...' : 'Não encontrado',
          sessionToken: sessionToken ? sessionToken.substring(0, 30) + '...' : 'Não encontrado',
          backendUrl,
          apiHealth,
          error: null
        });
      } catch (error) {
        setData(prev => ({ ...prev, error: error.message }));
      }
    };

    checkAuth();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔍 Debug: Autenticação</h1>
      
      <div style={{ marginTop: '2rem', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        <h2>Status</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: '#ffe5e5', padding: '1rem', borderRadius: '4px' }}>
        <h3>O que fazer:</h3>
        <ol>
          <li>Se authToken = "Não encontrado", significa que o login não salvou o token</li>
          <li>Se apiHealth ≠ "OK", o backend não está rodando</li>
          <li>Teste o login novamente e volte aqui</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a href="/auth/signin" style={{ 
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          ← Voltar ao Login
        </a>
      </div>
    </div>
  );
}
