/**
 * Authentication Service Tests
 * Tests for password hashing, verification, and validation functions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  validateEmail
} from '../authService.js';

describe('authService', () => {
  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should use default saltRounds of 10', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Hashes should be different due to salt
      expect(hash1).not.toBe(hash2);
    });

    it('should use custom saltRounds', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password, 5);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
    });

    it('should throw error for null password', async () => {
      await expect(hashPassword(null)).rejects.toThrow('Password must be a non-empty string');
    });

    it('should throw error for non-string password', async () => {
      await expect(hashPassword(123)).rejects.toThrow('Password must be a non-empty string');
    });
  });

  describe('verifyPassword', () => {
    let hashedPassword;

    beforeAll(async () => {
      hashedPassword = await hashPassword('TestPassword123!');
    });

    it('should return true for matching passwords', async () => {
      const result = await verifyPassword('TestPassword123!', hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const result = await verifyPassword('WrongPassword123!', hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw error for empty plain password', async () => {
      await expect(verifyPassword('', hashedPassword)).rejects.toThrow('Plain password must be a non-empty string');
    });

    it('should throw error for null plain password', async () => {
      await expect(verifyPassword(null, hashedPassword)).rejects.toThrow('Plain password must be a non-empty string');
    });

    it('should throw error for non-string plain password', async () => {
      await expect(verifyPassword(123, hashedPassword)).rejects.toThrow('Plain password must be a non-empty string');
    });

    it('should throw error for empty hashed password', async () => {
      await expect(verifyPassword('TestPassword123!', '')).rejects.toThrow('Hashed password must be a non-empty string');
    });

    it('should throw error for null hashed password', async () => {
      await expect(verifyPassword('TestPassword123!', null)).rejects.toThrow('Hashed password must be a non-empty string');
    });

    it('should be case-sensitive', async () => {
      const result = await verifyPassword('testpassword123!', hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return isValid true for strong password', () => {
      const result = validatePasswordStrength('StrongPass123!@#');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBeGreaterThan(0);
    });

    it('should return isValid false for empty password', () => {
      const result = validatePasswordStrength('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha é obrigatória');
      expect(result.strength).toBe(0);
    });

    it('should require at least 8 characters', () => {
      const result = validatePasswordStrength('Pass1');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos 8 caracteres');
    });

    it('should reject passwords over 100 characters', () => {
      const longPassword = 'A'.repeat(101) + '1a!';
      const result = validatePasswordStrength(longPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha muito longa (máximo 100 caracteres)');
    });

    it('should require at least one letter', () => {
      const result = validatePasswordStrength('12345678');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra');
    });

    it('should require at least one number', () => {
      const result = validatePasswordStrength('Password');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um número');
    });

    it('should calculate strength correctly', () => {
      const weak = validatePasswordStrength('Pass12');
      const medium = validatePasswordStrength('Password12');
      const strong = validatePasswordStrength('P@ssw0rd123!ABC');
      
      expect(weak.strength).toBeLessThan(medium.strength);
      expect(medium.strength).toBeLessThan(strong.strength);
    });

    it('should cap strength at 4', () => {
      const result = validatePasswordStrength('VeryLongP@ssw0rd123!ABC#$%^&*()');
      
      expect(result.strength).toBeLessThanOrEqual(4);
    });

    it('should return error for null password', () => {
      const result = validatePasswordStrength(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha é obrigatória');
    });

    it('should return error for non-string password', () => {
      const result = validatePasswordStrength(123);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ser um texto');
    });

    it('should allow special characters', () => {
      const result = validatePasswordStrength('Pass123!@#$%^&*()');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateEmail', () => {
    it('should return isValid true for valid email', () => {
      const result = validateEmail('user@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return isValid false for empty email', () => {
      const result = validateEmail('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email é obrigatório');
    });

    it('should reject email without @', () => {
      const result = validateEmail('userexample.com');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Formato de email inválido');
    });

    it('should reject email without domain', () => {
      const result = validateEmail('user@');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Formato de email inválido');
    });

    it('should reject email without TLD', () => {
      const result = validateEmail('user@example');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Formato de email inválido');
    });

    it('should accept email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject email over 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email muito longo (máximo 254 caracteres)');
    });

    it('should return error for null email', () => {
      const result = validateEmail(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email é obrigatório');
    });

    it('should return error for non-string email', () => {
      const result = validateEmail(123);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email deve ser um texto');
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.co.uk',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject email with spaces', () => {
      const result = validateEmail('user @example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Formato de email inválido');
    });
  });
});
