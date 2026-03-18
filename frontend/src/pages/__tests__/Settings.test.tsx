import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../Settings';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the settings title', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('renders settings tabs', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('Azure Configuration')).toBeInTheDocument();
      expect(screen.getByText('Terraform Settings')).toBeInTheDocument();
      expect(screen.getByText('UI Preferences')).toBeInTheDocument();
    });
  });

  it('shows Azure tab content by default', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('Azure Settings')).toBeInTheDocument();
      expect(screen.getByText('Subscription ID')).toBeInTheDocument();
      expect(screen.getByText('Tenant ID')).toBeInTheDocument();
    });
  });

  it('can switch to Terraform tab', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Azure Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terraform Settings'));

    await waitFor(() => {
      expect(screen.getByText('Terraform Configuration')).toBeInTheDocument();
      expect(screen.getByText('Terraform Version')).toBeInTheDocument();
      expect(screen.getByText('Output Directory')).toBeInTheDocument();
    });
  });

  it('can switch to UI Preferences tab', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Azure Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('UI Preferences'));

    await waitFor(() => {
      expect(screen.getByText('User Interface Settings')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Auto Save')).toBeInTheDocument();
    });
  });

  it('persists settings to localStorage on save', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click save button
    fireEvent.click(screen.getByText('Save Settings'));

    await waitFor(() => {
      const saved = localStorage.getItem('ianc-settings');
      expect(saved).not.toBeNull();
      const settings = JSON.parse(saved!);
      expect(settings).toHaveProperty('azure');
      expect(settings).toHaveProperty('terraform');
      expect(settings).toHaveProperty('ui');
    });
  });

  it('shows Save Settings and Reset to Defaults buttons', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });
  });
});
