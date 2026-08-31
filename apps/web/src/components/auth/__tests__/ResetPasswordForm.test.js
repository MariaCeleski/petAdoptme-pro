import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ResetPasswordForm from '../ResetPasswordForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockPush.mockClear();
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it('validates token on component mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, email: 'user@example.com' }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password?token=valid-token&email=user%40example.com');
    });
  });

  it('shows error for invalid token', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Token inválido' }),
    });

    render(<ResetPasswordForm token="invalid-token" email="user@example.com" />);

    await waitFor(() => {
      expect(screen.getByText(/link inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during token validation', () => {
    // Mock a slow response
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<ResetPasswordForm token="token" email="user@example.com" />);

    expect(screen.getByText(/validando link/i)).toBeInTheDocument();
  });

  it('renders form after successful token validation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar nova senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });
      
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar nova senha/i);
      
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'differentpassword' } });
      
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      fireEvent.change(passwordInput, { target: { value: 'weakpass' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/fraca/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    // Mock token validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    // Mock password reset
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Senha redefinida' }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(async () => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar nova senha/i);
      
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'validpassword123' } });
      
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          email: 'user@example.com',
          password: 'validpassword123',
        }),
      });
    });
  });

  it('shows success message and redirects after password reset', async () => {
    // Mock token validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    // Mock password reset
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Senha redefinida' }),
    });

    jest.useFakeTimers();

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(async () => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const confirmInput = screen.getByLabelText(/confirmar nova senha/i);
      
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'validpassword123' } });
      
      const submitButton = screen.getByRole('button', { name: /redefinir senha/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/senha redefinida!/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin?message=password-reset-success');
    });

    jest.useRealTimers();
  });

  it('toggles password visibility', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(<ResetPasswordForm token="valid-token" email="user@example.com" />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/nova senha/i);
      const toggleButton = passwordInput.parentElement.querySelector('button');
      
      expect(passwordInput.type).toBe('password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });
  });
});