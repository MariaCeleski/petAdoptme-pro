/**
 * Security Headers Configuration
 * 
 * Implementa headers de segurança recomendados para proteção contra ataques comuns
 * Requisitos: 12.3, 12.5
 */

/**
 * Headers de segurança padrão conforme OWASP
 */
export const SECURITY_HEADERS = {
  // Força uso de HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Previne clickjacking
  'X-Frame-Options': 'DENY',
  
  // Previne MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Ativa proteção contra XSS no navegador (legado, mas ainda suportado)
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy - restritiva mas funcional
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Controla informações de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permitir CORS para APIs públicas (restritivo)
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://petadopt.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  
  // Desabilita caching de conteúdo sensível
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  
  // Remove headers informativos
  'Server': 'Powered by Next.js',
  
  // Desabilita Feature-Policy para features específicas
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
};

/**
 * Aplicar security headers a uma resposta Next.js
 */
export function applySecurityHeaders(response) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Obter todos os security headers como objeto
 */
export function getSecurityHeadersObject() {
  return { ...SECURITY_HEADERS };
}

/**
 * Headers específicos para APIs
 */
export const API_SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

/**
 * Aplicar security headers para API
 */
export function applyApiSecurityHeaders(response) {
  Object.entries(API_SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Headers para LGPD compliance
 */
export const LGPD_HEADERS = {
  // Indica processamento de dados pessoais
  'X-Data-Processing': 'LGPD',
  
  // Link para política de privacidade
  'X-Privacy-Policy': process.env.NEXT_PUBLIC_APP_URL + '/privacy' || 'https://petadopt.com/privacy',
  
  // Indica se cookies são usados
  'X-Cookies-Used': 'true',
};

/**
 * Gerar CSP nonce para scripts inline seguros
 */
export function generateCSPNonce() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Atualizar CSP com nonce
 */
export function updateCSPWithNonce(nonce) {
  const csp = SECURITY_HEADERS['Content-Security-Policy'];
  const updatedCSP = csp + `; script-src 'nonce-${nonce}'`;
  return {
    ...SECURITY_HEADERS,
    'Content-Security-Policy': updatedCSP,
  };
}
