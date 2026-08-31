import { render, screen } from '@testing-library/react';
import DashboardStats from '../DashboardStats';

describe('DashboardStats Component', () => {
  const mockStats = {
    totalPets: 5,
    adoptedCount: 2,
    pendingRequests: 1,
    successRate: 40
  };

  test('renders all stat cards with correct data', () => {
    render(<DashboardStats stats={mockStats} />);

    // Check total pets
    expect(screen.getByText('Total de Pets')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Check adopted count
    expect(screen.getByText('Adotados')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check pending requests
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check success rate
    expect(screen.getByText('Taxa de Sucesso')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  test('displays descriptive text for each stat', () => {
    render(<DashboardStats stats={mockStats} />);

    expect(screen.getByText('Pets cadastrados na plataforma')).toBeInTheDocument();
    expect(screen.getByText('Pets já adotados')).toBeInTheDocument();
    expect(screen.getByText('Solicitações em análise')).toBeInTheDocument();
    expect(screen.getByText('Taxa de adoção dos seus pets')).toBeInTheDocument();
  });

  test('handles zero values correctly', () => {
    const zeroStats = {
      totalPets: 0,
      adoptedCount: 0,
      pendingRequests: 0,
      successRate: 0
    };

    render(<DashboardStats stats={zeroStats} />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
