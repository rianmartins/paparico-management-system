import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductCreateAction from './ProductCreateAction';

vi.mock('./ProductsModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div aria-label="Create product" role="dialog">
        <button onClick={onClose} type="button">
          Close modal
        </button>
      </div>
    ) : null
}));

describe('ProductCreateAction', () => {
  it('opens and closes the create product modal', () => {
    render(<ProductCreateAction />);

    expect(screen.queryByRole('dialog', { name: 'Create product' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(screen.getByRole('dialog', { name: 'Create product' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(screen.queryByRole('dialog', { name: 'Create product' })).not.toBeInTheDocument();
  });
});
