/**
 * Email Unsubscribe API Route
 * 
 * Handles one-click unsubscribe from emails
 * Requirements: 8.5 (include unsubscribe option in all emails)
 * 
 * GET /api/email/unsubscribe?token=<token>
 * - Unsubscribe user from all emails using unsubscribe token
 * - Renders a confirmation page
 */

import { unsubscribeFromAll } from '@/lib/email/preferences';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Cancelar Inscrição - PetAdopt</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Erro ao Cancelar Inscrição</h1>
            <p class="error">Token inválido ou ausente.</p>
            <p><a href="${process.env.APP_URL || 'http://localhost:3000'}">Voltar para PetAdopt</a></p>
          </div>
        </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
    
    // Unsubscribe from all emails
    const preferences = await unsubscribeFromAll(token);
    
    console.log(`[EMAIL-UNSUBSCRIBE] User ${preferences.userId} unsubscribed from all emails`);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Inscrição Cancelada - PetAdopt</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          .success { color: #27ae60; }
          .info { color: #666; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✓ Inscrição Cancelada</h1>
          <p class="success">Você foi cancelado com sucesso de todos os emails de notificação.</p>
          <p class="info">Você não receberá mais:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Notificações de solicitações de adoção</li>
            <li>Atualizações de status de adoção</li>
            <li>Alertas de pets compatíveis</li>
            <li>Newsletter e comunicações gerais</li>
          </ul>
          <p class="info">Você pode reativar suas preferências de email a qualquer momento no seu dashboard.</p>
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard">Ir para Dashboard</a></p>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  } catch (error) {
    console.error('[EMAIL-UNSUBSCRIBE] Error:', error);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Erro - PetAdopt</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Erro ao Processar Solicitação</h1>
          <p class="error">${error.message}</p>
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}">Voltar para PetAdopt</a></p>
        </div>
      </body>
      </html>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}
