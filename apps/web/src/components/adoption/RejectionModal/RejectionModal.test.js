import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RejectionModal } from './RejectionModal';

// Mock components
jest.mock('@/components/ui', () => ({
  Modal: ({ isOpen, onClose, title, children }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  Button: ({ children, onClick, disabled, loading }) => (
    <button onClick={onClick} disabled={disabled}>
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

describe('RejectionModal Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText(/Rejeitar Solicitação de Adoção/)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <RejectionModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should display pet and adopter names in message', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João Silva"
        />
      );

      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
      expect(screen.getByText(/Rex/)).toBeInTheDocument();
    });

    it('should render rejection reason select dropdown', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByDisplayValue(/Selecione um motivo/)).toBeInTheDocument();
    });

    it('should render all rejection reason options', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(
        screen.getByText('Situação de moradia incompatível')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Experiência insuficiente com animais')
      ).toBeInTheDocument();
      expect(screen.getByText('Preocupações sobre cuidado')).toBeInTheDocument();
      expect(screen.getByText('Falta de tempo para dedicar')).toBeInTheDocument();
      expect(screen.getByText('Outro motivo')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Rejeitar Adoção')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when no reason is selected', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Por favor, selecione um motivo/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when other reason is selected but no text provided', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      // Wait for textarea to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Explique por que/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Por favor, descreva o motivo/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when custom reason is too short', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      // Wait for textarea to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Explique por que/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Explique por que/i);
      fireEvent.change(textarea, { target: { value: 'Too short' } });

      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/deve ter pelo menos 10 caracteres/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear error message when user fixes validation', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'incompatible_living' } });

      // Try to submit without validation error
      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      // Should succeed this time
      expect(mockOnSubmit).toHaveBeenCalledWith('incompatible_living');
    });
  });

  describe('User Interactions', () => {
    it('should submit with selected preset reason', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'insufficient_experience' } });

      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('insufficient_experience');
    });

    it('should submit with custom reason text', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      // Wait for textarea to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Explique por que/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Explique por que/i);
      fireEvent.change(textarea, {
        target: { value: 'The adopter has a very specific need for a large dog' },
      });

      const submitButton = screen.getByText('Rejeitar Adoção');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        'The adopter has a very specific need for a large dog'
      );
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when modal close button is clicked', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show textarea only when other reason is selected', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(
        screen.queryByPlaceholderText(/Explique por que/i)
      ).not.toBeInTheDocument();

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Explique por que/i)
        ).toBeInTheDocument();
      });

      // Switch to another preset reason
      fireEvent.change(select, { target: { value: 'incompatible_living' } });

      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(/Explique por que/i)
        ).not.toBeInTheDocument();
      });
    });

    it('should clear form when modal is closed and reopened', async () => {
      const { rerender } = render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      // Wait for textarea to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Explique por que/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Explique por que/i);
      fireEvent.change(textarea, { target: { value: 'Test text' } });

      // Close modal
      rerender(
        <RejectionModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      // Reopen modal
      rerender(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const newSelect = screen.getByDisplayValue(/Selecione um motivo/);
      expect(newSelect).toHaveValue('');
    });
  });

  describe('Textarea Character Limit', () => {
    it('should display character count when textarea is visible', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      await waitFor(() => {
        expect(screen.getByText('0/500')).toBeInTheDocument();
      });
    });

    it('should update character count as user types', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Explique por que/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Explique por que/i);
      fireEvent.change(textarea, { target: { value: 'Hello World' } });

      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    it('should limit textarea to 500 characters', async () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      fireEvent.change(select, { target: { value: 'other' } });

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Explique por que/i);
        expect(textarea).toHaveAttribute('maxLength', '500');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when isLoading is true', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
          isLoading={true}
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      expect(cancelButton).toBeDisabled();
    });

    it('should disable select when isLoading is true', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          petName="Rex"
          adopterName="João"
          isLoading={true}
        />
      );

      const select = screen.getByDisplayValue(/Selecione um motivo/);
      expect(select).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should render with default pet and adopter names if not provided', () => {
      render(
        <RejectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(/Adotante/)).toBeInTheDocument();
      expect(screen.getByText(/Pet/)).toBeInTheDocument();
    });
  });
});
