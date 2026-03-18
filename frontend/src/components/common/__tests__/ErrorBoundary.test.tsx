import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error on demand
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child content rendered successfully</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React error boundary console.error noise in tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content rendered successfully')).toBeInTheDocument();
  });

  it('shows error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows "Try Again" button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('resets error state when "Try Again" is clicked', () => {
    // Use stateful parent so clicking "Try Again" re-renders with updated props
    function Wrapper() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <>
          <button onClick={() => setShouldThrow(false)} data-testid="fix-error">
            Fix Error
          </button>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // First, stop throwing by updating parent state
    act(() => {
      fireEvent.click(screen.getByTestId('fix-error'));
    });

    // Now click "Try Again" which resets ErrorBoundary internal state
    act(() => {
      fireEvent.click(screen.getByText('Try Again'));
    });

    expect(screen.getByText('Child content rendered successfully')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });
});
