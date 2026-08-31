import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalModal } from './ApprovalModal';

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

describe('ApprovalModal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText(/Confirmar Aprovação de Adoção/)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <ApprovalModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should display pet and adopter names in message', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João Silva"
        />
      );

      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
      expect(screen.getByText(/Rex/)).toBeInTheDocument();
    });

    it('should render confirmation message', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(
        screen.getByText(/Você está prestes a aprovar/i)
      ).toBeInTheDocument();
    });

    it('should render optional notes textarea', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(
        screen.getByPlaceholderText(/Combinamos uma data/i)
      ).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Aprovar Adoção')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm with confirmation data when approve button is clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const approveButton = screen.getByText('Aprovar Adoção');
      fireEvent.click(approveButton);

      expect(mockOnConfirm).toHaveBeenCalledWith({
        confirmationText: null,
      });
    });

    it('should call onConfirm with notes when notes are provided', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const textarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      fireEvent.change(textarea, {
        target: { value: 'Vamos buscar no fim de semana' },
      });

      const approveButton = screen.getByText('Aprovar Adoção');
      fireEvent.click(approveButton);

      expect(mockOnConfirm).toHaveBeenCalledWith({
        confirmationText: 'Vamos buscar no fim de semana',
      });
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
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
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should clear notes when modal is closed and reopened', () => {
      const { rerender } = render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const textarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      fireEvent.change(textarea, {
        target: { value: 'Test notes' },
      });

      expect(textarea).toHaveValue('Test notes');

      // Close modal
      rerender(
        <ApprovalModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      // Reopen modal
      rerender(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const newTextarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      expect(newTextarea).toHaveValue('');
    });
  });

  describe('Textarea Character Limit', () => {
    it('should display character count', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('should update character count as user types', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const textarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      fireEvent.change(textarea, {
        target: { value: 'Hello World' },
      });

      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    it('should limit textarea to 500 characters', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const textarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when isLoading is true', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
          isLoading={true}
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      const approveButton = screen.getByText('Aprovar Adoção');

      expect(cancelButton).toBeDisabled();
      // Loading button shows different text but should also be disabled
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable textarea when isLoading is true', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
          isLoading={true}
        />
      );

      const textarea = screen.getByPlaceholderText(/Combinamos uma data/i);
      expect(textarea).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should render with default pet and adopter names if not provided', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/Adotante/)).toBeInTheDocument();
      expect(screen.getByText(/Pet/)).toBeInTheDocument();
    });

    it('should handle empty confirmation text correctly', () => {
      render(
        <ApprovalModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          petName="Rex"
          adopterName="João"
        />
      );

      const approveButton = screen.getByText('Aprovar Adoção');
      fireEvent.click(approveButton);

      expect(mockOnConfirm).toHaveBeenCalledWith({
        confirmationText: null,
      });
    });
  });
});
