import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductsPage from './page';

vi.mock('@/features/AppSidebar', () => ({
  default: () => <nav>Products navigation</nav>
}));

vi.mock('@/features/Products/ProductCreateAction', () => ({
  default: () => <button type="button">Create product</button>
}));

vi.mock('@/features/Products/ProductList', () => ({
  default: () => <div>Products list</div>
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
