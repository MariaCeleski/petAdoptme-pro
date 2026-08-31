import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { validateEmail } from '@/lib/auth-utils';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    }
  }
}));

jest.mock('@/lib/auth-utils', () => ({
  validateEmail: jest.fn(),
}));

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: jest.fn(() => ({
      toString: jest.fn(() => 'mocked-token')
    }))
  }
});

describe('/api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
  });

  it('validates required email field', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email é obrigatório');
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('validates email format', async () => {
    validateEmail.mockReturnValue({
      isValid: false,
      errors: ['Formato de email inválido']
    });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Formato de email inválido');
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(validateEmail).toHaveBeenCalledWith('invalid-email');
  });

  it('returns success message even for non-existent email', async () => {
    validateEmail.mockReturnValue({ isValid: true, errors: [] });
    prisma.user.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('Se este email estiver cadastrado');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('creates reset token for existing user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User'
    };

    validateEmail.mockReturnValue({ isValid: true, errors: [] });
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('Se este email estiver cadastrado');
    
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' }
    });
    
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: expect.objectContaining({
        resetToken: 'mocked-token',
        resetTokenExpiry: expect.any(Date)
      })
    });
  });

  it('handles database errors gracefully', async () => {
    validateEmail.mockReturnValue({ isValid: true, errors: [] });
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erro interno do servidor');
    expect(data.code).toBe('INTERNAL_ERROR');
  });

  it('logs reset token in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const mockUser = { id: 'user-123', email: 'user@example.com' };
    
    validateEmail.mockReturnValue({ isValid: true, errors: [] });
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(request);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Password reset token for user@example.com: mocked-token')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Reset link: http://localhost:3000/auth/reset-password?token=mocked-token')
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('sets correct token expiry time', async () => {
    const mockUser = { id: 'user-123', email: 'user@example.com' };
    
    validateEmail.mockReturnValue({ isValid: true, errors: [] });
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const beforeTime = new Date();
    beforeTime.setHours(beforeTime.getHours() + 1);

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(request);

    const afterTime = new Date();
    afterTime.setHours(afterTime.getHours() + 1);

    const updateCall = prisma.user.update.mock.calls[0][0];
    const expiryTime = updateCall.data.resetTokenExpiry;

    expect(expiryTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000);
    expect(expiryTime.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
  });
});