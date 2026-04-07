import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GlobalError from '@/app/global-error';

describe('app/global-error', () => {
  beforeEach(() => {
    document.title = '';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
    document.title = '';
  });

  it('renders the global document fallback and retries through unstable_retry', () => {
    const error = new Error('Root layout failed');
    const unstableRetry = vi.fn();

    render(<GlobalError error={error} unstable_retry={unstableRetry} />);

    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Application shell')).toBeInTheDocument();
    expect(document.title).toBe('Application error | Paparico Management');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(unstableRetry).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
