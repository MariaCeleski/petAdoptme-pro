import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdoptionRequest } from './AdoptionRequest';

// Mock fetch globally
global.fetch = jest.fn();

// Mock child components
jest.mock('@/components/ui', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, loading, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  ),
  Badge: ({ children, color }) => <span data-testid="badge" data-color={color}>{children}</span>,
  OptimizedImage: ({ src, alt }) => <img src={src} alt={alt} />,
}));

jest.mock('../ApprovalModal', () => ({
  ApprovalModal: ({ isOpen, title }) => isOpen ? <div data-testid="approval-modal">{title}</div> : null,
}));

jest.mock('../RejectionModal', () => ({
  RejectionModal: ({ isOpen, title }) => isOpen ? <div data-testid="rejection-modal">{title}</div> : null,
}));

describe('AdoptionRequest Component', () => {
  const mockAdoption = {
    id: '123',
    status: 'PENDING',
    createdAt: new Date('2024-01-15'),
    pet: {
      id: 'pet-1',
      name: 'Rex',
      species: 'DOG',
      breed: 'Labrador',
      age: '2 anos',
      size: 'LARGE',
      gender: 'MALE',
      description: 'Friendly and energetic dog',
      images: ['https://example.com/dog.jpg'],
    },
    adopter: {
      id: 'adopter-1',
      name: 'João Silva',
      email: 'joao@example.com',
    },
    adopterInfo: {
      personalInfo: {
        fullName: 'João Silva',
        phone: '11999999999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
      },
      livingSituation: {
        housingType: 'house',
        hasYard: true,
        ownRent: 'own',
      },
      experience: {
        hadPetsBefore: true,
        currentPets: [
          {
            species: 'Dog',
            breed: 'Poodle',
            age: '3 anos',
          }
        ],
      },
      motivation: {
        whyAdopt: 'Queremos expandir nossa família com um cachorro maior',
        expectedCommitment: 'Estamos comprometidos com 10+ anos de cuidado',
        availableTime: '8 horas por dia após o trabalho',
      },
    },
  };

  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Rendering', () => {
    it('should render adoption request with pet information', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('Rex')).toBeInTheDocument();
      expect(screen.getByText('Labrador')).toBeInTheDocument();
      expect(screen.getByText('2 anos')).toBeInTheDocument();
    });

    it('should render adopter information', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@example.com')).toBeInTheDocument();
      expect(screen.getByText('11999999999')).toBeInTheDocument();
    });

    it('should render correct status badge', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('Pendente');
      expect(badge).toHaveAttribute('data-color', 'warning');
    });

    it('should render living situation details', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('Casa')).toBeInTheDocument();
      expect(screen.getByText('Sim')).toBeInTheDocument();
      expect(screen.getByText('Próprio')).toBeInTheDocument();
    });

    it('should render motivation details', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(
        screen.getByText('Queremos expandir nossa família com um cachorro maior')
      ).toBeInTheDocument();
    });

    it('should format date correctly', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText(/15 de janeiro/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show approve and reject buttons when canApprove is true and status is PENDING', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('Aprovar')).toBeInTheDocument();
      expect(screen.getByText('Rejeitar')).toBeInTheDocument();
    });

    it('should not show action buttons when canApprove is false', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={false}
        />
      );

      expect(screen.queryByText('Aprovar')).not.toBeInTheDocument();
      expect(screen.queryByText('Rejeitar')).not.toBeInTheDocument();
    });

    it('should not show action buttons when status is not PENDING', () => {
      const approvedAdoption = {
        ...mockAdoption,
        status: 'APPROVED',
      };

      render(
        <AdoptionRequest
          adoption={approvedAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.queryByText('Aprovar')).not.toBeInTheDocument();
      expect(screen.queryByText('Rejeitar')).not.toBeInTheDocument();
    });

    it('should open approval modal when approve button is clicked', async () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      const approveButton = screen.getByText('Aprovar');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByTestId('approval-modal')).toBeInTheDocument();
      });
    });

    it('should open rejection modal when reject button is clicked', async () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      const rejectButton = screen.getByText('Rejeitar');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('rejection-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Status Variants', () => {
    it('should display correct badge for APPROVED status', () => {
      const approvedAdoption = {
        ...mockAdoption,
        status: 'APPROVED',
      };

      render(
        <AdoptionRequest
          adoption={approvedAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('Aprovada');
      expect(badge).toHaveAttribute('data-color', 'success');
    });

    it('should display correct badge for REJECTED status', () => {
      const rejectedAdoption = {
        ...mockAdoption,
        status: 'REJECTED',
      };

      render(
        <AdoptionRequest
          adoption={rejectedAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('Rejeitada');
      expect(badge).toHaveAttribute('data-color', 'error');
    });
  });

  describe('Error States', () => {
    it('should disable buttons when isLoading is true', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
          isLoading={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalAdoption = {
        ...mockAdoption,
        adopterInfo: {
          personalInfo: {
            fullName: 'Test User',
          },
        },
      };

      const { container } = render(
        <AdoptionRequest
          adoption={minimalAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Pet Species Display', () => {
    it('should display "Cachorro" for DOG species', () => {
      render(
        <AdoptionRequest
          adoption={mockAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('Cachorro')).toBeInTheDocument();
    });

    it('should display "Gato" for CAT species', () => {
      const catAdoption = {
        ...mockAdoption,
        pet: {
          ...mockAdoption.pet,
          species: 'CAT',
        },
      };

      render(
        <AdoptionRequest
          adoption={catAdoption}
          onStatusChange={mockOnStatusChange}
          canApprove={true}
        />
      );

      expect(screen.getByText('Gato')).toBeInTheDocument();
    });
  });

  describe('Pet Size Display', () => {
    it('should display correct size labels', () => {
      const cases = [
        { size: 'SMALL', label: 'Pequeno' },
        { size: 'MEDIUM', label: 'Médio' },
        { size: 'LARGE', label: 'Grande' },
      ];

      for (const { size, label } of cases) {
        const adoption = {
          ...mockAdoption,
          pet: {
            ...mockAdoption.pet,
            size,
          },
        };

        const { unmount } = render(
          <AdoptionRequest
            adoption={adoption}
            onStatusChange={mockOnStatusChange}
            canApprove={true}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      }
    });
  });
});
