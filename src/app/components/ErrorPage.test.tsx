import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/errors';
import ErrorPage from '@/app/components/ErrorPage';

describe('ErrorPage', () => {
  it('renders branded safe diagnostics and retries through the provided action', () => {
    const onRetry = vi.fn();

    render(
      <ErrorPage
        context={{ label: 'Route', value: '/products' }}
        error={
          new ApiError({
            status: 500,
            code: 'HTTP_500',
            message: 'The server could not process the request.'
          })
        }
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Paparico Management')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'We could not load this page' })).toBeInTheDocument();
    expect(
      screen.getByText('The backend failed while preparing this page. Try again in a moment.')
    ).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText('/products')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('HTTP_500')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders fallback diagnostics copy when no details are available', () => {
    render(<ErrorPage error={null} onRetry={() => undefined} />);

    expect(screen.getByText('No extra diagnostic details were available for this error.')).toBeInTheDocument();
  });
});
