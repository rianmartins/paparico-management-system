import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AppError from '@/app/error';

const usePathnameMock = vi.fn();
const resetMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock()
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryErrorResetBoundary: () => ({
    reset: resetMock
  })
}));

describe('app/error', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/products');
    resetMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
  });

  it('renders the route diagnostics and resets query errors before retrying', () => {
    const error = new Error('Unexpected client crash');
    const unstableRetry = vi.fn();

    render(<AppError error={error} unstable_retry={unstableRetry} />);

    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText('/products')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(unstableRetry).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
