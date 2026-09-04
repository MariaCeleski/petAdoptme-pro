/**
 * Email Service
 * Handles all email communications using Resend
 * Supports verification emails, password resets, and adoption notifications
 */

import { Resend } from 'resend';

let resend = null;

function initializeResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email service will fail.');
      return null;
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Send email verification link
 * @param {string} email - User email
 * @param {string} userId - User ID
 * @param {string} verificationToken - Unique token for verification
 */
export async function sendVerificationEmail(email, userId, verificationToken) {
  try {
    const resendClient = initializeResend();
    if (!resendClient) {
      console.warn('⚠️  Email service not configured. Skipping verification email.');
      return { id: 'mock', from: 'noreply@petadopt.com', to: email };
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&userId=${userId}`;
    
    const response = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '🐾 PetAdopt - Verifique seu email',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">🐾 Bem-vindo ao PetAdopt!</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Obrigado por se registrar. Para completar seu cadastro e começar a adotar um pet, 
              verifique seu endereço de email clicando no botão abaixo.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verificar Email
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              Ou copie e cole este link no seu navegador:<br/>
              <code style="background: #f0f0f0; padding: 5px;">${verificationUrl}</code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Se você não criou esta conta, ignore este email.
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email de verificação enviado para:', email);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar email de verificação:', error);
    throw new Error(`Falha ao enviar email de verificação: ${error.message}`);
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Token for password reset
 */
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    const resendClient = initializeResend();
    if (!resendClient) {
      console.warn('⚠️  Email service not configured. Skipping password reset email.');
      return { id: 'mock', from: 'noreply@petadopt.com', to: email };
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const response = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '🔐 PetAdopt - Redefinir sua senha',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">🔐 Redefinir Senha</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Recebemos uma solicitação para redefinir sua senha do PetAdopt. 
              Clique no botão abaixo para criar uma nova senha.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              Este link expira em 24 horas.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Se você não solicitou uma redefinição de senha, ignore este email.
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email de reset de senha enviado para:', email);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar email de reset de senha:', error);
    throw new Error(`Falha ao enviar email de reset: ${error.message}`);
  }
}

/**
 * Send adoption approved notification
 * @param {string} adopteeEmail - Adopter's email
 * @param {string} adopterName - Adopter's name
 * @param {string} petName - Pet's name
 * @param {string} adoptionId - Adoption ID
 */
export async function sendAdoptionApprovedEmail(adopteeEmail, adopterName, petName, adoptionId) {
  try {
    const resendClient = initializeResend();
    if (!resendClient) {
      console.warn('⚠️  Email service not configured. Skipping adoption approval email.');
      return { id: 'mock', from: 'noreply@petadopt.com', to: adopteeEmail };
    }

    const adoptionUrl = `${process.env.FRONTEND_URL}/adoption/${adoptionId}`;
    
    const response = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: adopteeEmail,
      subject: `🎉 Parabéns! ${petName} é seu agora!`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">🎉 Adoção Aprovada!</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Olá ${adopterName},<br/><br/>
              A sua adoção de <strong>${petName}</strong> foi aprovada! 🐾<br/>
              Prepare-se para receber o seu novo companheiro de vida.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${adoptionUrl}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Ver Detalhes da Adoção
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Próximos passos:<br/>
              1. Aguarde contato do abrigo<br/>
              2. Agende uma data para buscar ${petName}<br/>
              3. Finalize a documentação de adoção
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Bem-vindo à família PetAdopt! 🏠
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email de adoção aprovada enviado para:', adopteeEmail);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar email de adoção aprovada:', error);
    throw new Error(`Falha ao enviar email de aprovação: ${error.message}`);
  }
}

/**
 * Send adoption rejected notification
 * @param {string} adopteeEmail - Adopter's email
 * @param {string} adopterName - Adopter's name
 * @param {string} petName - Pet's name
 * @param {string} reason - Reason for rejection
 */
export async function sendAdoptionRejectedEmail(adopteeEmail, adopterName, petName, reason = '') {
  try {
    const resendClient = initializeResend();
    if (!resendClient) {
      console.warn('⚠️  Email service not configured. Skipping adoption rejection email.');
      return { id: 'mock', from: 'noreply@petadopt.com', to: adopteeEmail };
    }

    const response = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: adopteeEmail,
      subject: `ℹ️ PetAdopt - Atualização sobre sua adoção de ${petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">ℹ️ Atualização sobre sua Adoção</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Olá ${adopterName},<br/><br/>
              Informamos que a sua solicitação de adoção de <strong>${petName}</strong> não foi aprovada neste momento.
            </p>
            
            ${reason ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #856404; margin: 0;"><strong>Motivo:</strong><br/>${reason}</p>
              </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Não desista! Existem muitos outros pets incríveis aguardando um lar amoroso. 
              Visite nosso site para explorar outras opções de adoção.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/pets" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Explorar Outros Pets
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Se tiver dúvidas, entre em contato conosco.
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email de adoção rejeitada enviado para:', adopteeEmail);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar email de adoção rejeitada:', error);
    throw new Error(`Falha ao enviar email de rejeição: ${error.message}`);
  }
}

/**
 * Send adoption status update
 * @param {string} email - Recipient email
 * @param {string} petName - Pet name
 * @param {string} status - Current adoption status
 */
export async function sendAdoptionStatusUpdateEmail(email, petName, status) {
  try {
    const resendClient = initializeResend();
    if (!resendClient) {
      console.warn('⚠️  Email service not configured. Skipping adoption status email.');
      return { id: 'mock', from: 'noreply@petadopt.com', to: email };
    }

    const statusMessages = {
      pending: 'Sua solicitação está sendo analisada',
      under_review: 'Sua solicitação está sendo revisada por nosso time',
      approved: 'Sua solicitação foi aprovada!',
      rejected: 'Sua solicitação não foi aprovada',
      completed: 'A adoção foi finalizada com sucesso',
    };
    
    const response = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `📋 PetAdopt - Atualização: ${petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; text-align: center;">📋 Atualização de Status</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              O status da sua solicitação de adoção foi atualizado:<br/>
              <strong>${statusMessages[status] || 'Status atualizado'}</strong>
            </p>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #1565c0; margin: 0;">
                <strong>Pet:</strong> ${petName}<br/>
                <strong>Status Atual:</strong> ${status.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Obrigado por adotar com responsabilidade! 🐾
            </p>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Email de atualização de status enviado para:', email);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar email de atualização:', error);
    throw new Error(`Falha ao enviar email de atualização: ${error.message}`);
  }
}

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdoptionApprovedEmail,
  sendAdoptionRejectedEmail,
  sendAdoptionStatusUpdateEmail,
};
