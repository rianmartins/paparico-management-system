import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductsPage from './page';

vi.mock('@/features/AppSidebar', () => ({
  default: () => <nav>Products navigation</nav>
}));

vi.mock('@/features/Products/ProductList', () => ({
  default: (_props: { onEditProduct: () => void }) => <div>Products list</div>
}));

vi.mock('@/features/Products/ProductsModal', () => ({
  default: () => null
}));

describe('ProductsPage', () => {
  it('renders the create action in the page header outside the content section', () => {
    render(<ProductsPage />);

    const title = screen.getByRole('heading', { level: 1, name: 'Products' });
    const createButton = screen.getByRole('button', { name: 'Create product' });
    const contentSection = screen.getByText('Products list').closest('section');

    expect(title.parentElement).toContainElement(createButton);
    expect(contentSection).not.toContainElement(createButton);
  });
});
