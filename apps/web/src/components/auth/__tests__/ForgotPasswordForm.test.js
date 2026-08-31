import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordForm from '../ForgotPasswordForm';

// Mock fetch
global.fetch = jest.fn();

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders form elements correctly', () => {
    render(<ForgotPasswordForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instruções/i })).toBeInTheDocument();
    expect(screen.getByText(/lembrou da senha/i)).toBeInTheDocument();
  });

  it('validates required email field', async () => {
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid email', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email enviado' }),
    });

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
        }),
      });
    });
  });

  it('shows success message after successful submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email enviado' }),
    });

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email enviado!/i)).toBeInTheDocument();
      expect(screen.getByText(/próximos passos/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Erro no servidor', code: 'INTERNAL_ERROR' }),
    });

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro no servidor/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    // Mock a slow response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        }), 100)
      )
    );

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitButton = screen.getByRole('button', { name: /enviar instruções/i });
    fireEvent.click(submitButton);

    // Check that button is disabled and shows loading state
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });
});