/**
 * GET /api/notifications/unsubscribe
 * 
 * Handle email unsubscribe links
 * Requirements: 8.5 (unsubscribe option in all emails)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Process unsubscribe request
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const unsubscribeToken = searchParams.get('token');
    const action = searchParams.get('action') || 'all'; // 'all', 'matching', 'status', 'adoption'
    
    if (!unsubscribeToken) {
      return NextResponse.json({
        error: 'Unsubscribe token is required',
        code: 'MISSING_TOKEN'
      }, { status: 400 });
    }
    
    // Find email preference by unsubscribe token
    const emailPreference = await prisma.emailPreference.findUnique({
      where: { unsubscribeToken }
    });
    
    if (!emailPreference) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Unsubscribe</h1>
            <p class="error">Invalid or expired unsubscribe token. Please contact support.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    // Update email preferences
    let updateData = {};
    
    if (action === 'all' || action === 'unsubscribeAll') {
      updateData = { unsubscribedAll: true };
    } else if (action === 'matching') {
      updateData = { petMatchingAlerts: false };
    } else if (action === 'status') {
      updateData = { statusChangeNotifications: false };
    } else if (action === 'adoption') {
      updateData = { adoptionNotifications: false };
    }
    
    const updatedPreference = await prisma.emailPreference.update({
      where: { unsubscribeToken },
      data: updateData
    });
    
    console.log(`[UNSUBSCRIBE] User ${emailPreference.userId} unsubscribed from: ${action}`);
    
    // Return HTML confirmation page
    const actionLabel = {
      'all': 'todas as notificações',
      'unsubscribeAll': 'todas as notificações',
      'matching': 'notificações de pets compatíveis',
      'status': 'notificações de mudança de status',
      'adoption': 'notificações de solicitação de adoção'
    }[action] || 'notificações';
    
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #FF8C42 0%, #4A90E2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 {
            color: #FF8C42;
            margin-top: 0;
          }
          .success-icon {
            font-size: 48px;
            margin: 20px 0;
          }
          p {
            color: #666;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background: #FF8C42;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .button:hover {
            background: #E67E2F;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Inscrição Cancelada</h1>
          <div class="success-icon">✓</div>
          <p>Você foi desinscrito com sucesso de <strong>${actionLabel}</strong>.</p>
          <p>Se deseja gerenciar suas preferências de email, acesse sua dashboard no PetAdopt.</p>
          <a href="${process.env.APP_URL}/dashboard" class="button">Ir para Dashboard</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Erro</h1>
          <p class="error">Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.</p>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}
