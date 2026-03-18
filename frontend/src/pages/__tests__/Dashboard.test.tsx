import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  it('renders the dashboard title', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows the welcome message', () => {
    renderDashboard();
    expect(
      screen.getByText(/Welcome to TerraformUI/)
    ).toBeInTheDocument();
  });

  it('shows statistics cards', () => {
    renderDashboard();
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Resources Configured')).toBeInTheDocument();
    expect(screen.getByText('Templates Available')).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    renderDashboard();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('New Resource Configuration')).toBeInTheDocument();
    expect(screen.getByText('View Projects')).toBeInTheDocument();
  });

  it('shows getting started section', () => {
    renderDashboard();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText(/Design Resources/)).toBeInTheDocument();
    expect(screen.getByText(/Generate Terraform/)).toBeInTheDocument();
    expect(screen.getByText(/Deploy/)).toBeInTheDocument();
  });
});
