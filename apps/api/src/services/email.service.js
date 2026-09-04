/**
 * Email Service - Send notifications via Resend
 * Phase 2: Email notifications
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@petadopt.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send verification email
 * @param {string} email - User email
 * @param {string} userId - User ID
 * @param {string} token - Verification token
 */
export async function sendVerificationEmail(email, userId, token) {
  try {
    const verificationLink = `${FRONTEND_URL}/auth/verify?token=${token}&userId=${userId}`;
    
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✅ Confirme seu email no PetAdopt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Bem-vindo ao PetAdopt! 🐾</h1>
          
          <p>Obrigado por se cadastrar! Para ativar sua conta, clique no botão abaixo:</p>
          
          <a href="${verificationLink}" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Confirmar Email
          </a>
          
          <p style="font-size: 14px; color: #666;">
            Ou copie este link: <br>
            <code>${verificationLink}</code>
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este link expira em 24 horas. Se você não solicitou este email, ignore-o.
          </p>
        </div>
      `
    });
    
    console.log(`✅ Verification email sent to ${email}`, response.id);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 */
export async function sendPasswordResetEmail(email, token) {
  try {
    const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${token}`;
    
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Recuperar sua senha no PetAdopt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Recuperar Senha</h1>
          
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
          
          <a href="${resetLink}" 
             style="display: inline-block; background: #ff9800; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Redefinir Senha
          </a>
          
          <p style="font-size: 14px; color: #666;">
            Ou copie este link: <br>
            <code>${resetLink}</code>
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.
          </p>
        </div>
      `
    });
    
    console.log(`✅ Password reset email sent to ${email}`, response.id);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send pet registration confirmation email
 * @param {Object} pet - Pet object
 * @param {Object} owner - Owner object with email
 */
export async function sendPetRegistrationConfirmation(pet, owner) {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: owner.email,
      subject: `✅ Seu pet ${pet.name} foi cadastrado no PetAdopt!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Bem-vindo ao PetAdopt! 🐾</h1>
          
          <p>Seu pet <strong>${pet.name}</strong> foi cadastrado com sucesso!</p>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
            <h3>Status do Cadastro</h3>
            <p><strong>Status:</strong> <span style="color: #ff9800;">Pendente de Aprovação</span></p>
            <p>Sua solicitação foi recebida e está sendo revisada por nosso time.</p>
            <p><strong>Tempo estimado:</strong> Até 24 horas</p>
          </div>
          
          <p>Você receberá um email assim que ${pet.name} for aprovado!</p>
          
          <a href="${FRONTEND_URL}/pets/${pet.id}" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Detalhes do ${pet.name}
          </a>
          
          <hr style="margin-top: 30px; color: #ddd;">
          <p style="font-size: 12px; color: #999;">
            Este é um email automático. Por favor, não responda diretamente.
          </p>
        </div>
      `
    });
    
    console.log(`✅ Confirmation email sent to ${owner.email}`, response.id);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    throw error;
  }
}

/**
 * Send pet approval email
 * @param {Object} pet - Pet object
 */
export async function sendApprovalEmail(pet) {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: pet.owner_email,
      subject: `🎉 ${pet.name} foi aprovado no PetAdopt!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Parabéns! 🎉</h1>
          
          <p>Seu pet <strong>${pet.name}</strong> foi aprovado e está agora <span style="color: #4caf50;">disponível para adoção</span>!</p>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50;">
            <h3>O que acontece agora?</h3>
            <ul>
              <li>Interessados podem encontrar ${pet.name} no catálogo</li>
              <li>Você receberá notificações quando houver solicitações de adoção</li>
              <li>Pode gerenciar tudo pelo seu dashboard</li>
            </ul>
          </div>
          
          <a href="${FRONTEND_URL}/pets/${pet.id}" 
             style="display: inline-block; background: #4caf50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver ${pet.name} no Catálogo
          </a>
          
          <p style="margin-top: 30px; font-size: 14px;">
            Obrigado por ajudar a encontrar um novo lar para ${pet.name}! ❤️
          </p>
        </div>
      `
    });
    
    console.log(`✅ Approval email sent to ${pet.owner_email}`, response.id);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
    throw error;
  }
}

/**
 * Send pet rejection email
 * @param {Object} pet - Pet object
 * @param {String} reason - Reason for rejection
 */
export async function sendRejectionEmail(pet, reason) {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: pet.owner_email,
      subject: `ℹ️ ${pet.name} precisa de revisão`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Precisamos de sua atenção</h1>
          
          <p>Obrigado por cadastrar <strong>${pet.name}</strong> no PetAdopt!</p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ff9800;">
            <h3>Motivo da Solicitação de Revisão</h3>
            <p>${reason}</p>
          </div>
          
          <h3>O que fazer agora?</h3>
          <ol>
            <li>Revise os dados de ${pet.name}</li>
            <li>Faça as correções necessárias</li>
            <li>Resubmeta o formulário</li>
          </ol>
          
          <a href="${FRONTEND_URL}/tutores/${pet.id}/editar" 
             style="display: inline-block; background: #ff9800; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Editar ${pet.name}
          </a>
          
          <p style="margin-top: 30px; font-size: 14px;">
            Se tiver dúvidas, entre em contato conosco.
          </p>
        </div>
      `
    });
    
    console.log(`✅ Rejection email sent to ${pet.owner_email}`, response.id);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
    throw error;
  }
}

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPetRegistrationConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
};
