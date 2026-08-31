import nodemailer from 'nodemailer';

/**
 * Email Service with Resend and Retry Logic
 * 
 * Supports:
 * - Resend API (primary)
 * - SendGrid (fallback)
 * - SMTP (fallback)
 * - Automatic retry up to 3 times on failure (Requirement 8.7)
 * - Email delivery status validation (Requirement 8.6)
 * - Professional HTML templates with unsubscribe option (Requirement 8.5)
 * - Email logging and monitoring
 */

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second initial delay, exponential backoff

// Email service client initialization
let emailClient = null;

function initializeEmailClient() {
  // Priority: Resend > SendGrid > SMTP
  if (process.env.RESEND_API_KEY) {
    return { type: 'resend' };
  } else if (process.env.SENDGRID_API_KEY) {
    return {
      type: 'sendgrid',
      transporter: nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      })
    };
  } else if (process.env.SMTP_HOST) {
    return {
      type: 'smtp',
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    };
  }
  
  return { type: 'development' };
}

emailClient = initializeEmailClient();

/**
 * Retry logic with exponential backoff
 * Implements Requirement 8.7: retry failed email deliveries automatically and immediately up to 3 times
 */
async function withRetry(fn, context = 'email operation') {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fn(attempt);
      
      if (attempt > 1) {
        console.log(`[EMAIL] ${context} succeeded on attempt ${attempt}/${MAX_RETRIES}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      console.warn(
        `[EMAIL] ${context} failed on attempt ${attempt}/${MAX_RETRIES}:`,
        error.message
      );
      
      // Don't retry on client errors (4xx)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(
    `[EMAIL] ${context} failed after ${MAX_RETRIES} attempts:`,
    lastError.message
  );
  throw lastError;
}

/**
 * Send email via Resend API
 */
async function sendViaResend(emailData) {
  const { to, subject, html } = emailData;
  
  return withRetry(async () => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@petadopt.com',
        to,
        subject,
        html,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      const err = new Error(`Resend API error: ${error.message || 'Unknown error'}`);
      err.statusCode = response.status;
      throw err;
    }
    
    const data = await response.json();
    return {
      messageId: data.id,
      status: 'delivered',
      provider: 'resend',
      timestamp: new Date().toISOString()
    };
  }, `Send email to ${to} via Resend`);
}

/**
 * Send email via nodemailer (SendGrid, SMTP, etc)
 */
async function sendViaNodemailer(emailData, transporter) {
  const { to, subject, html } = emailData;
  
  return withRetry(async () => {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@petadopt.com',
      to,
      subject,
      html,
    });
    
    return {
      messageId: result.messageId,
      status: 'delivered',
      provider: emailClient.type,
      timestamp: new Date().toISOString()
    };
  }, `Send email to ${to} via ${emailClient.type}`);
}

/**
 * Generic send email function
 * Requirements: 8.1, 8.2, 8.6, 8.7
 */
export async function sendEmail(emailData) {
  const { to, subject, html } = emailData;
  
  try {
    // Validate email format
    if (!to || !isValidEmail(to)) {
      throw new Error(`Invalid recipient email: ${to}`);
    }
    
    if (!subject || !html) {
      throw new Error('Email subject and HTML content are required');
    }
    
    // Log email sending attempt
    console.log(`[EMAIL] Sending email to ${to} (${emailClient.type})`);
    
    let result;
    
    if (emailClient.type === 'resend') {
      result = await sendViaResend(emailData);
    } else if (emailClient.type === 'sendgrid' || emailClient.type === 'smtp') {
      result = await sendViaNodemailer(emailData, emailClient.transporter);
    } else {
      // Development mode
      console.log(`[EMAIL-DEV] Would send email to ${to}\nSubject: ${subject}\nContent preview: ${html.substring(0, 100)}...`);
      result = {
        messageId: `dev-${Date.now()}`,
        status: 'dev-mode',
        provider: 'development',
        timestamp: new Date().toISOString()
      };
    }
    
    // Log successful send
    console.log(`[EMAIL] Successfully sent to ${to} (MessageID: ${result.messageId})`);
    
    return result;
  } catch (error) {
    console.error(`[EMAIL] Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Build professional HTML template with styling
 */
function buildEmailTemplate(content, options = {}) {
  const { 
    title = 'PetAdopt',
    unsubscribeUrl = null,
  } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #FF8C42 0%, #4A90E2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .content h2 {
          color: #FF8C42;
          font-size: 22px;
          margin-top: 0;
        }
        .content p {
          margin: 15px 0;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #FF8C42;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #E67E2F;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .footer p {
          margin: 5px 0;
        }
        .divider {
          border-top: 2px solid #FF8C42;
          margin: 20px 0;
        }
        .pet-info {
          background-color: #f5f9ff;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #4A90E2;
        }
        .pet-info strong {
          color: #4A90E2;
        }
        @media (max-width: 600px) {
          .container {
            border-radius: 0;
          }
          .header {
            padding: 20px;
          }
          .header h1 {
            font-size: 22px;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            font-size: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🐾 PetAdopt</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; 2024 PetAdopt - Conectando pets com famílias amorosas</p>
          ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Cancelar inscrição</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email Templates
 * Each template returns { subject, html } with professional HTML formatting
 * Requirement 8.5: Include unsubscribe option in all emails
 */

export function getWelcomeEmailTemplate(userName, unsubscribeUrl) {
  const content = `
    <h2>Bem-vindo ao PetAdopt, ${userName}! 🎉</h2>
    <p>Obrigado por se juntar à nossa comunidade de pessoas que amam animais!</p>
    <p>Você agora pode:</p>
    <ul>
      <li>Navegar por centenas de pets disponíveis para adoção</li>
      <li>Manifestar interesse nos seus favoritos</li>
      <li>Receber notificações sobre pets que combinam com suas preferências</li>
      <li>Acompanhar seu processo de adoção em tempo real</li>
    </ul>
    <p><a href="${process.env.APP_URL}/pets" class="button">Explorar Pets Disponíveis</a></p>
    <p>Qualquer dúvida? Estamos aqui para ajudar!</p>
  `;
  
  return {
    subject: 'Bem-vindo ao PetAdopt! 🐾',
    html: buildEmailTemplate(content, { unsubscribeUrl })
  };
}

export function getAdoptionRequestEmailTemplate(ownerName, petName, adopterName, adoptionId, unsubscribeUrl) {
  const content = `
    <h2>Nova Solicitação de Adoção! 📨</h2>
    <p>Olá ${ownerName},</p>
    <p><strong>${adopterName}</strong> manifestou interesse em adotar seu pet!</p>
    <div class="pet-info">
      <strong>Pet:</strong> ${petName}
    </div>
    <p>Acesse sua dashboard para revisar as informações da pessoa interessada e tomar uma decisão:</p>
    <p><a href="${process.env.APP_URL}/dashboard/adoptions/${adoptionId}" class="button">Revisar Solicitação</a></p>
    <p>Você pode aprovar, rejeitar ou manter a solicitação como pendente enquanto avalia outras opções.</p>
  `;
  
  return {
    subject: `Nova solicitação de adoção para ${petName}! 📨`,
    html: buildEmailTemplate(content, { unsubscribeUrl })
  };
}

export function getAdoptionApprovedEmailTemplate(userName, petName, petAge, petBreed, ownerName, ownerPhone, unsubscribeUrl) {
  const content = `
    <h2>Parabéns, ${userName}! 🎉 Sua Adoção foi Aprovada!</h2>
    <p>Ótimas notícias! Sua solicitação para adotar foi aprovada!</p>
    <div class="pet-info">
      <strong>Pet:</strong> ${petName}<br>
      <strong>Idade:</strong> ${petAge}<br>
      <strong>Raça:</strong> ${petBreed}
    </div>
    <p><strong>Próximos Passos:</strong></p>
    <ol>
      <li>${ownerName} (proprietário do pet) entrará em contato com você em breve</li>
      <li>Vocês finalizarão os detalhes da entrega e assinatura de documentos</li>
      <li>Prepare-se para dar as boas-vindas ao seu novo membro da família! 🐾</li>
    </ol>
    <p><strong>Telefone do proprietário:</strong> ${ownerPhone}</p>
    <p>Parabéns por dar um novo lar a um animal que precisa! Esta é uma decisão especial.</p>
    <p><a href="${process.env.APP_URL}/dashboard" class="button">Ir para Dashboard</a></p>
  `;
  
  return {
    subject: `Sua adoção foi aprovada! Bem-vindo, ${petName}! 🎉`,
    html: buildEmailTemplate(content, { unsubscribeUrl })
  };
}

export function getAdoptionRejectedEmailTemplate(userName, petName, rejectionReason, unsubscribeUrl) {
  const content = `
    <h2>Sobre Sua Solicitação de Adoção</h2>
    <p>Olá ${userName},</p>
    <p>Obrigado por se interessar em adotar <strong>${petName}</strong>!</p>
    <p>Infelizmente, o proprietário não conseguiu aprovar sua solicitação desta vez.</p>
    ${rejectionReason ? `
      <div class="pet-info">
        <strong>Motivo:</strong> ${rejectionReason}
      </div>
    ` : ''}
    <p>Não desista! Há muitos outros pets incríveis esperando por uma família amorosa como a sua.</p>
    <p><a href="${process.env.APP_URL}/pets" class="button">Explorar Outros Pets</a></p>
    <p>Se tiver dúvidas ou gostaria de feedback, entre em contato com o proprietário ou com o suporte do PetAdopt.</p>
  `;
  
  return {
    subject: `Sobre sua solicitação para adotar ${petName}`,
    html: buildEmailTemplate(content, { unsubscribeUrl })
  };
}

export function getPetMatchingEmailTemplate(userName, petName, petSpecies, petBreed, petAge, petImage, unsubscribeUrl) {
  const content = `
    <h2>Encontramos um Pet que Pode Interessar! 🐾</h2>
    <p>Olá ${userName},</p>
    <p>Com base nas suas preferências de busca, encontramos um novo pet que pode combinar com você!</p>
    <div class="pet-info">
      <strong>Pet:</strong> ${petName}<br>
      <strong>Espécie:</strong> ${petSpecies === 'DOG' ? 'Cachorro' : 'Gato'}<br>
      <strong>Raça:</strong> ${petBreed}<br>
      <strong>Idade:</strong> ${petAge}
    </div>
    ${petImage ? `<p style="text-align: center;"><img src="${petImage}" alt="${petName}" style="max-width: 300px; border-radius: 8px;"></p>` : ''}
    <p>Quer conhecer melhor este pet? Clique no botão abaixo!</p>
    <p><a href="${process.env.APP_URL}/pets" class="button">Ver Detalhes do Pet</a></p>
    <p>Você pode gerenciar suas preferências e desativar estas notificações na sua dashboard a qualquer momento.</p>
  `;
  
  return {
    subject: `Encontramos um pet perfeito para você! 🐾`,
    html: buildEmailTemplate(content, { unsubscribeUrl })
  };
}

/**
 * High-level email sending functions
 * These handle building templates and calling sendEmail with retry logic
 */

export async function sendWelcomeEmail(email, userName, unsubscribeUrl = null) {
  // Note: Welcome email is sent regardless of preferences (first contact)
  const template = getWelcomeEmailTemplate(userName, unsubscribeUrl);
  
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html
  });
}

export async function sendAdoptionRequestEmail(ownerEmail, { 
  ownerName, 
  petName, 
  adopterName, 
  adoptionId,
  unsubscribeUrl = null 
}) {
  const template = getAdoptionRequestEmailTemplate(
    ownerName, 
    petName, 
    adopterName, 
    adoptionId, 
    unsubscribeUrl
  );
  
  return sendEmail({
    to: ownerEmail,
    subject: template.subject,
    html: template.html
  });
}

export async function sendAdoptionApprovedEmail(adopterEmail, { 
  adopterName,
  petName, 
  petAge,
  petBreed,
  ownerName,
  ownerPhone,
  unsubscribeUrl = null 
}) {
  const template = getAdoptionApprovedEmailTemplate(
    adopterName, 
    petName, 
    petAge,
    petBreed,
    ownerName,
    ownerPhone,
    unsubscribeUrl
  );
  
  return sendEmail({
    to: adopterEmail,
    subject: template.subject,
    html: template.html
  });
}

export async function sendAdoptionRejectedEmail(adopterEmail, { 
  adopterName,
  petName, 
  rejectionReason = null,
  unsubscribeUrl = null 
}) {
  const template = getAdoptionRejectedEmailTemplate(
    adopterName, 
    petName, 
    rejectionReason, 
    unsubscribeUrl
  );
  
  return sendEmail({
    to: adopterEmail,
    subject: template.subject,
    html: template.html
  });
}

export async function sendPetMatchingEmail(adopterEmail, { 
  adopterName,
  petName, 
  petSpecies,
  petBreed,
  petAge,
  petImage = null,
  unsubscribeUrl = null 
}) {
  const template = getPetMatchingEmailTemplate(
    adopterName, 
    petName, 
    petSpecies,
    petBreed,
    petAge,
    petImage,
    unsubscribeUrl
  );
  
  return sendEmail({
    to: adopterEmail,
    subject: template.subject,
    html: template.html
  });
}

/**
 * Backward compatibility - map old function names to new ones
 */
export async function sendAdoptionStatusEmail(adopterEmail, { petName, status, reason, adopterName = 'Adotante', ownerName = '', ownerPhone = '', petAge = '', petBreed = '' }) {
  if (status === 'APPROVED') {
    return sendAdoptionApprovedEmail(adopterEmail, {
      adopterName,
      petName,
      petAge,
      petBreed,
      ownerName,
      ownerPhone
    });
  } else if (status === 'REJECTED') {
    return sendAdoptionRejectedEmail(adopterEmail, {
      adopterName,
      petName,
      rejectionReason: reason
    });
  }
}

/**
 * Preference-aware email sending functions
 * These check user preferences before sending
 * Requirements: 8.4, 8.5
 */

export async function sendAdoptionRequestEmailWithPreferences(ownerEmail, userId, emailData, unsubscribeUrl = null) {
  // Import here to avoid circular dependencies
  const { shouldSendNotification, NOTIFICATION_TYPES } = await import('./email/preferences.js');
  
  if (!await shouldSendNotification(userId, NOTIFICATION_TYPES.ADOPTION_REQUEST)) {
    console.log(`[EMAIL-PREFERENCES] Adoption request email skipped for user ${userId} - preferences disabled`);
    return { skipped: true, reason: 'User preferences' };
  }
  
  return sendAdoptionRequestEmail(ownerEmail, { ...emailData, unsubscribeUrl });
}

export async function sendAdoptionApprovedEmailWithPreferences(adopterEmail, userId, emailData, unsubscribeUrl = null) {
  // Import here to avoid circular dependencies
  const { shouldSendNotification, NOTIFICATION_TYPES } = await import('./email/preferences.js');
  
  if (!await shouldSendNotification(userId, NOTIFICATION_TYPES.STATUS_CHANGE)) {
    console.log(`[EMAIL-PREFERENCES] Adoption approved email skipped for user ${userId} - preferences disabled`);
    return { skipped: true, reason: 'User preferences' };
  }
  
  return sendAdoptionApprovedEmail(adopterEmail, { ...emailData, unsubscribeUrl });
}

export async function sendAdoptionRejectedEmailWithPreferences(adopterEmail, userId, emailData, unsubscribeUrl = null) {
  // Import here to avoid circular dependencies
  const { shouldSendNotification, NOTIFICATION_TYPES } = await import('./email/preferences.js');
  
  if (!await shouldSendNotification(userId, NOTIFICATION_TYPES.STATUS_CHANGE)) {
    console.log(`[EMAIL-PREFERENCES] Adoption rejected email skipped for user ${userId} - preferences disabled`);
    return { skipped: true, reason: 'User preferences' };
  }
  
  return sendAdoptionRejectedEmail(adopterEmail, { ...emailData, unsubscribeUrl });
}

export async function sendPetMatchingEmailWithPreferences(adopterEmail, userId, emailData, unsubscribeUrl = null) {
  // Import here to avoid circular dependencies
  const { shouldSendNotification, NOTIFICATION_TYPES } = await import('./email/preferences.js');
  
  if (!await shouldSendNotification(userId, NOTIFICATION_TYPES.PET_MATCHING)) {
    console.log(`[EMAIL-PREFERENCES] Pet matching email skipped for user ${userId} - preferences disabled`);
    return { skipped: true, reason: 'User preferences' };
  }
  
  return sendPetMatchingEmail(adopterEmail, { ...emailData, unsubscribeUrl });
}
