/**
 * Authentication Controller
 * Handles user registration, login, and password management
 * Uses bcryptjs for secure password hashing
 */

import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update } from '../services/supabaseClient.js';
import { userLoginSchema, userRegisterSchema, passwordResetSchema } from '@petadopt/shared';

/**
 * Hash password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new ApiError('Failed to hash password', 500, 'HASH_ERROR');
  }
}

/**
 * Compare plain password with hash
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePasswords(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * POST /api/auth/register
 * Register a new user with secure password hashing
 */
export async function register(req, res, next) {
  try {
    const { email, password, name, userType } = await userRegisterSchema.parseAsync(req.body);

    // Check if user already exists
    const existingUser = await select('users', { email });
    if (existingUser && existingUser.length > 0) {
      throw new ApiError(
        'Email já registrado',
        409,
        'EMAIL_EXISTS'
      );
    }

    // Hash password with bcryptjs (10 rounds)
    const hashedPassword = await hashPassword(password);

    // Create user with hashed password
    const newUser = await insert('users', {
      email,
      password: hashedPassword,
      name,
      user_type: userType,
      email_verified: false,
      created_at: new Date().toISOString(),
    });

    if (!newUser || newUser.length === 0) {
      throw new ApiError(
        'Falha ao criar usuário',
        500,
        'USER_CREATION_FAILED'
      );
    }

    const user = newUser[0];

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, user.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Login user with email and password (bcrypt comparison)
 */
export async function login(req, res, next) {
  try {
    const { email, password } = await userLoginSchema.parseAsync(req.body);

    // Find user by email
    const users = await select('users', { email });
    if (!users || users.length === 0) {
      throw new ApiError(
        'Email ou senha inválida',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const user = users[0];

    // Compare password using bcryptjs
    const validPassword = await comparePasswords(password, user.password);

    if (!validPassword) {
      throw new ApiError(
        'Email ou senha inválida',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // TODO: Generate real JWT token
    // const token = generateToken({
    //   userId: user.id,
    //   email: user.email,
    //   role: user.user_type
    // });

    const token = 'mock-token-jwt'; // Placeholder para JWT real

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Logout user (typically just clears client-side token)
 */
export async function logout(req, res, next) {
  try {
    res.status(200).json({
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(
        'Token de verificação obrigatório',
        400,
        'MISSING_TOKEN'
      );
    }

    // TODO: Verify token from database
    // const verification = await select('verification_tokens', { token });

    res.status(200).json({
      message: 'Email verificado com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/password-reset
 * Initiate password reset
 */
export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    // Find user by email
    const users = await select('users', { email });
    if (!users || users.length === 0) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        message: 'Se uma conta existe, um link de reset foi enviado',
      });
    }

    // TODO: Generate reset token and send email
    // const resetToken = generateResetToken();
    // await insert('password_reset_tokens', { user_id: users[0].id, token: resetToken });
    // await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: 'Se uma conta existe, um link de reset foi enviado',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/password-reset/:token
 * Complete password reset with new password (bcrypt hashed)
 */
export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { newPassword } = await passwordResetSchema.parseAsync(req.body);

    // TODO: Validate reset token
    // const resetToken = await select('password_reset_tokens', { token });

    if (!token) {
      throw new ApiError(
        'Token de reset inválido ou expirado',
        400,
        'INVALID_TOKEN'
      );
    }

    // TODO: Update user password
    // Hash the new password
    // const hashedPassword = await hashPassword(newPassword);
    // await update('users', { password: hashedPassword }, { id: resetToken.user_id });
    // await remove('password_reset_tokens', { token });

    res.status(200).json({
      message: 'Senha resetada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(
        'Autenticação obrigatória',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Fetch full user data from database
    const users = await select('users', { id: req.user.userId });
    if (!users || users.length === 0) {
      throw new ApiError(
        'Usuário não encontrado',
        404,
        'USER_NOT_FOUND'
      );
    }

    const user = users[0];

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/auth/change-password
 * Change password for authenticated user
 * Requires old password verification + new password hashing
 */
export async function changePassword(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(
        'Autenticação obrigatória',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError(
        'Senha antiga e nova obrigatórias',
        400,
        'MISSING_PASSWORDS'
      );
    }

    // Get user from database
    const users = await select('users', { id: req.user.userId });
    if (!users || users.length === 0) {
      throw new ApiError(
        'Usuário não encontrado',
        404,
        'USER_NOT_FOUND'
      );
    }

    const user = users[0];

    // Verify old password
    const validOldPassword = await comparePasswords(oldPassword, user.password);
    if (!validOldPassword) {
      throw new ApiError(
        'Senha antiga incorreta',
        401,
        'INVALID_OLD_PASSWORD'
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in database
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
