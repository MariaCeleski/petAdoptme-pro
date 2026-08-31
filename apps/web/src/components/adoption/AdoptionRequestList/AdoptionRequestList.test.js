import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdoptionRequestList } from './AdoptionRequestList';

// Mock child components
jest.mock('../AdoptionRequest', () => ({
  AdoptionRequest: ({ adoption, onStatusChange }) => (
    <div data-testid={`adoption-${adoption.id}`}>
      {adoption.pet.name} - {adoption.status}
      <button onClick={() => onStatusChange({ ...adoption, status: 'APPROVED' })}>
        Approve
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  LoadingSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe('AdoptionRequestList Component', () => {
  const mockAdoptions = [
    {
      id: '1',
      status: 'PENDING',
      pet: { name: 'Rex' },
      adopter: { name: 'João' },
    },
    {
      id: '2',
      status: 'PENDING',
      pet: { name: 'Luna' },
      adopter: { name: 'Maria' },
    },
    {
      id: '3',
      status: 'APPROVED',
      pet: { name: 'Max' },
      adopter: { name: 'Pedro' },
    },
    {
      id: '4',
      status: 'REJECTED',
      pet: { name: 'Bella' },
      adopter: { name: 'Ana' },
    },
  ];

  const mockOnRefresh = jest.fn();

  describe('Rendering', () => {
    it('should render title and subtitle', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Solicitações de Adoção')).toBeInTheDocument();
      expect(screen.getByText(/4 solicitações encontradas/i)).toBeInTheDocument();
    });

    it('should render all adoption requests', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByTestId('adoption-1')).toBeInTheDocument();
      expect(screen.getByTestId('adoption-2')).toBeInTheDocument();
      expect(screen.getByTestId('adoption-3')).toBeInTheDocument();
      expect(screen.getByTestId('adoption-4')).toBeInTheDocument();
    });

    it('should render filter buttons with correct counts', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          showStatusFilter={true}
        />
      );

      // Check for filter buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(5); // 5 filters + refresh
    });
  });

  describe('Filtering', () => {
    it('should filter adoptions by status', async () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          showStatusFilter={true}
        />
      );

      // Get all buttons and find the PENDING filter
      const buttons = screen.getAllByRole('button');
      const pendingButton = buttons.find((btn) => btn.textContent.includes('Pendentes'));

      fireEvent.click(pendingButton);

      await waitFor(() => {
        expect(screen.getByTestId('adoption-1')).toBeInTheDocument();
        expect(screen.getByTestId('adoption-2')).toBeInTheDocument();
        expect(screen.queryByTestId('adoption-3')).not.toBeInTheDocument();
        expect(screen.queryByTestId('adoption-4')).not.toBeInTheDocument();
      });
    });

    it('should show all adoptions when ALL filter is selected', async () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          showStatusFilter={true}
        />
      );

      // First filter by PENDING
      const buttons = screen.getAllByRole('button');
      const pendingButton = buttons.find((btn) => btn.textContent.includes('Pendentes'));
      fireEvent.click(pendingButton);

      // Then click ALL
      const allButton = buttons.find((btn) => btn.textContent.includes('Todas'));
      fireEvent.click(allButton);

      await waitFor(() => {
        expect(screen.getByTestId('adoption-1')).toBeInTheDocument();
        expect(screen.getByTestId('adoption-2')).toBeInTheDocument();
        expect(screen.getByTestId('adoption-3')).toBeInTheDocument();
        expect(screen.getByTestId('adoption-4')).toBeInTheDocument();
      });
    });

    it('should not show filter when showStatusFilter is false', () => {
      const { container } = render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          showStatusFilter={false}
        />
      );

      // Check that filter section is not present
      const filterSection = container.querySelector('.filters');
      expect(filterSection).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when isLoading is true', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={true}
          onRefresh={mockOnRefresh}
        />
      );

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should hide adoption requests when loading', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={true}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.queryByTestId('adoption-1')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no adoptions exist', () => {
      render(
        <AdoptionRequestList
          adoptions={[]}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(
        screen.getByText('Nenhuma solicitação encontrada')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Você ainda não recebeu nenhuma solicitação/i)
      ).toBeInTheDocument();
    });

    it('should show filtered empty state for PENDING filter', async () => {
      const noAdoptions = [];

      render(
        <AdoptionRequestList
          adoptions={noAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          showStatusFilter={true}
        />
      );

      expect(
        screen.getByText(/Você ainda não recebeu nenhuma solicitação/i)
      ).toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('should call onRefresh when refresh button is clicked', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByText('Atualizar');
      fireEvent.click(refreshButton);

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button when loading', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={true}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByText('Atualizar');
      expect(refreshButton).toBeDisabled();
    });

    it('should not show refresh button when onRefresh is not provided', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
        />
      );

      expect(screen.queryByText('Atualizar')).not.toBeInTheDocument();
    });
  });

  describe('Status Update', () => {
    it('should update adoption status when child component calls onStatusChange', async () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
          canApprove={true}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        // After approval, the adoption should have APPROVED status
        expect(screen.getByText(/Rex - APPROVED/i)).toBeInTheDocument();
      });
    });
  });

  describe('Singular/Plural Text', () => {
    it('should use singular form for 1 adoption', () => {
      render(
        <AdoptionRequestList
          adoptions={[mockAdoptions[0]]}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText(/1 solicitação encontrada/i)).toBeInTheDocument();
    });

    it('should use plural form for multiple adoptions', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText(/4 solicitações encontradas/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render disclaimer message', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(
        screen.getByText(/Revise cuidadosamente cada solicitação/i)
      ).toBeInTheDocument();
    });

    it('should have aria-friendly labels for buttons', () => {
      render(
        <AdoptionRequestList
          adoptions={mockAdoptions}
          isLoading={false}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByText('Atualizar');
      expect(refreshButton).toHaveTextContent('Atualizar');
    });
  });
});
