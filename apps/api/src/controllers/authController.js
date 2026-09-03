/**
 * Authentication Controller - FASE 5.4 Email Integration
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update } from '../services/supabaseClient.js';
import { generateToken } from '../middleware/auth.js';
import { userLoginSchema, userRegisterSchema, passwordResetSchema } from '@petadopt/shared';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  validateEmail,
} from '../services/authService.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

function generateVerificationToken(userId) {
  return `verify_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function register(req, res, next) {
  try {
    // Validate request body against schema
    const { email, password, name, type } = await userRegisterSchema.parseAsync(req.body);

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        error: 'Email validation failed',
        code: 'INVALID_EMAIL',
        errors: emailValidation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password validation failed',
        code: 'INVALID_PASSWORD',
        errors: passwordValidation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if email already exists
    const existingUser = await select('users', { email });
    if (existingUser && existingUser.length > 0) {
      throw new ApiError('Email já registrado', 409, 'EMAIL_EXISTS');
    }

    // Hash password using backend utility
    const hashedPassword = await hashPassword(password);

    // Create user in database (let Supabase generate the ID)
    const newUser = await insert('users', {
      email,
      password: hashedPassword,
      name,
      type,
      created_at: new Date().toISOString(),
    });

    if (!newUser || newUser.length === 0) {
      throw new ApiError('Falha ao criar usuário', 500, 'USER_CREATION_FAILED');
    }

    const user = newUser[0];

    // Send verification email
    try {
      const verificationToken = generateVerificationToken(user.id);

      await insert('email_verification_tokens', {
        user_id: user.id,
        token: verificationToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });

      await sendVerificationEmail(user.email, user.id, verificationToken);
    } catch (emailError) {
      console.warn('⚠️ Failed to send verification email:', emailError);
    }

    // Return user data WITHOUT password hash
    res.status(201).json({
      message: 'Usuário criado com sucesso. Verifique seu email para ativar sua conta.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.type,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = await userLoginSchema.parseAsync(req.body);

    const users = await select('users', { email });
    if (!users || users.length === 0) {
      throw new ApiError('Email ou senha inválida', 401, 'INVALID_CREDENTIALS');
    }

    const user = users[0];
    const validPassword = await verifyPassword(password, user.password);

    if (!validPassword) {
      throw new ApiError('Email ou senha inválida', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.type,
    });

    // Return user data WITHOUT password hash
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.type,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    res.status(200).json({
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      throw new ApiError('Token e ID de usuário obrigatórios', 400, 'MISSING_PARAMS');
    }

    const verificationTokens = await select('email_verification_tokens', {
      token,
      user_id: userId,
    });

    if (!verificationTokens || verificationTokens.length === 0) {
      throw new ApiError('Token de verificação inválido', 400, 'INVALID_TOKEN');
    }

    const tokenRecord = verificationTokens[0];

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new ApiError('Token de verificação expirado', 400, 'EXPIRED_TOKEN');
    }

    await update('users', {
      updated_at: new Date().toISOString(),
    }, { id: userId });

    res.status(200).json({
      message: 'Email verificado com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    const users = await select('users', { email });
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: 'Se uma conta existe com este email, um link de reset foi enviado',
      });
    }

    const user = users[0];
    const resetToken = `reset_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await insert('password_reset_tokens', {
        user_id: user.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });

      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      throw new ApiError('Falha ao enviar email de reset', 500, 'EMAIL_SEND_ERROR');
    }

    res.status(200).json({
      message: 'Se uma conta existe com este email, um link de reset foi enviado',
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { newPassword } = await passwordResetSchema.parseAsync(req.body);

    if (!token) {
      throw new ApiError('Token de reset obrigatório', 400, 'MISSING_TOKEN');
    }

    // Validate password strength before processing
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password validation failed',
        code: 'INVALID_PASSWORD',
        errors: passwordValidation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const resetTokens = await select('password_reset_tokens', { token });

    if (!resetTokens || resetTokens.length === 0) {
      throw new ApiError('Token de reset inválido', 400, 'INVALID_TOKEN');
    }

    const tokenRecord = resetTokens[0];

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new ApiError('Token de reset expirado', 400, 'EXPIRED_TOKEN');
    }

    const hashedPassword = await hashPassword(newPassword);

    await update('users', {
      password: hashedPassword,
      updated_at: new Date().toISOString(),
    }, { id: tokenRecord.user_id });

    res.status(200).json({
      message: 'Senha resetada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError('Autenticação obrigatória', 401, 'NOT_AUTHENTICATED');
    }

    const users = await select('users', { id: req.user.userId });
    if (!users || users.length === 0) {
      throw new ApiError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const user = users[0];

    // Return user data WITHOUT password hash
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.type,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError('Autenticação obrigatória', 401, 'NOT_AUTHENTICATED');
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError('Senha antiga e nova obrigatórias', 400, 'MISSING_PASSWORDS');
    }

    const users = await select('users', { id: req.user.userId });
    if (!users || users.length === 0) {
      throw new ApiError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const user = users[0];

    const validOldPassword = await verifyPassword(oldPassword, user.password);
    if (!validOldPassword) {
      throw new ApiError('Senha antiga incorreta', 401, 'INVALID_OLD_PASSWORD');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await update('users', {
      password: hashedNewPassword,
      updated_at: new Date().toISOString(),
    }, { id: user.id });

    res.status(200).json({
      message: 'Senha alterada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  changePassword,
};
