import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Toast from '@/components/Toast';

import styles from './Toast.module.css';

describe('Toast', () => {
  it('renders title, description, and variant class', () => {
    render(<Toast description="The product was saved." id="toast-1" title="Success" variant="success" />);

    const toast = screen.getByRole('status');

    expect(toast.className).toContain(styles.Toast);
    expect(toast.className).toContain(styles.success);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('The product was saved.')).toBeInTheDocument();
  });

  it('renders an alert role for warning and error toasts', () => {
    render(<Toast description="Stock is low." id="toast-2" variant="warning" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('can hide the dismiss button', () => {
    render(<Toast description="Saved." dismissible={false} id="toast-3" variant="info" />);

    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).not.toBeInTheDocument();
  });

  it('calls onClose when the dismiss button is pressed', () => {
    const handleClose = vi.fn();

    render(<Toast description="Saved." id="toast-4" onClose={handleClose} variant="info" />);

    screen.getByRole('button', { name: 'Dismiss notification' }).click();

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
