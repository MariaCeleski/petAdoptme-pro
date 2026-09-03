/**
 * Auth Token Manager
 * Centraliza o gerenciamento de tokens JWT
 * Funciona apenas no navegador (client-side)
 */

const TOKEN_KEY = 'authToken';

export function saveToken(token) {
  if (!token) return false;
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    return false;
  }
}

export function getToken() {
  try {
    // Usar localStorage ou sessionStorage
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao remover token:', error);
    return false;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decodificar payload (sem usar Buffer)
    // Função helper para decodificar base64
    const base64Decode = (str) => {
      try {
        return decodeURIComponent(
          atob(str)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (e) {
        return null;
      }
    };
    
    const payload = JSON.parse(base64Decode(parts[1]));
    
    // Verificar expiração
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
}

export function getTokenExpiration(token) {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decodificar payload (sem usar Buffer)
    const base64Decode = (str) => {
      try {
        return decodeURIComponent(
          atob(str)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (e) {
        return null;
      }
    };
    
    const payload = JSON.parse(base64Decode(parts[1]));
    
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    console.error('Erro ao obter expiração:', error);
    return null;
  }
}
