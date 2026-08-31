/**
 * Authentication Controller
 * Handles user registration, login, and password management
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select } from '../services/supabaseClient.js';
import { generateToken, verifyToken, refreshToken } from '../middleware/auth.js';
import { userLoginSchema, userRegisterSchema, passwordResetSchema } from '@petadopt/shared';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req, res, next) {
  try {
    const { email, password, name, userType } = await userRegisterSchema.parseAsync(req.body);

    // Check if user already exists
    const existingUser = await select('users', { email });
    if (existingUser && existingUser.length > 0) {
      throw new ApiError(
        'Email already registered',
        409,
        'EMAIL_EXISTS'
      );
    }

    // In production, use bcrypt to hash password
    // For now, we'll store it as-is (NOT SECURE - implement bcrypt in next step)
    // TODO: const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;

    // Create user
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
        'Failed to create user',
        500,
        'USER_CREATION_FAILED'
      );
    }

    const user = newUser[0];

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.user_type,
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, user.id);

    res.status(201).json({
      message: 'User created successfully',
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
 * POST /api/auth/login
 * Login user with email and password
 */
export async function login(req, res, next) {
  try {
    const { email, password } = await userLoginSchema.parseAsync(req.body);

    // Find user by email
    const users = await select('users', { email });
    if (!users || users.length === 0) {
      throw new ApiError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const user = users[0];

    // In production, use bcrypt to compare passwords
    // TODO: const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = password === user.password; // NOT SECURE - temporary

    if (!validPassword) {
      throw new ApiError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.user_type,
    });

    res.status(200).json({
      message: 'Login successful',
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
      message: 'Logout successful',
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
        'Verification token required',
        400,
        'MISSING_TOKEN'
      );
    }

    // TODO: Verify token from database
    // const verification = await select('verification_tokens', { token });

    res.status(200).json({
      message: 'Email verified successfully',
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
        message: 'If an account exists, a reset link has been sent',
      });
    }

    // TODO: Generate reset token and send email
    // const resetToken = generateToken();
    // await insert('password_reset_tokens', { user_id: users[0].id, token: resetToken });
    // await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: 'If an account exists, a reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/password-reset/:token
 * Complete password reset
 */
export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { newPassword } = await passwordResetSchema.parseAsync(req.body);

    // TODO: Validate reset token
    // const resetToken = await select('password_reset_tokens', { token });

    if (!token) {
      throw new ApiError(
        'Invalid or expired reset token',
        400,
        'INVALID_TOKEN'
      );
    }

    // TODO: Update user password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await update('users', { password: hashedPassword }, { id: resetToken.user_id });
    // await remove('password_reset_tokens', { token });

    res.status(200).json({
      message: 'Password reset successfully',
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
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Fetch full user data from database
    const users = await select('users', { id: req.user.userId });
    if (!users || users.length === 0) {
      throw new ApiError(
        'User not found',
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
 * POST /api/auth/refresh
 * Refresh JWT token
 */
export async function refreshAccessToken(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Generate new token
    const newToken = generateToken({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
}
