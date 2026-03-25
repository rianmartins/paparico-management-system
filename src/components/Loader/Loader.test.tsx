import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loader from '@/components/Loader';

import styles from './Loader.module.css';

describe('Loader', () => {
  it('renders an accessible status element with the default label', () => {
    render(<Loader />);

    const loader = screen.getByRole('status');

    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-live', 'polite');
    expect(loader).toHaveTextContent('Loading...');
    expect(loader.className).toContain(styles.Loader);
    expect(loader.className).toContain(styles.md);
  });

  it('renders a custom label and size class', () => {
    render(<Loader label="Fetching products" size="lg" />);

    const loader = screen.getByRole('status');

    expect(loader).toHaveTextContent('Fetching products');
    expect(loader.className).toContain(styles.lg);
  });

  it('forwards native div props', () => {
    render(<Loader data-testid="products-loader" id="products-loader" />);

    const loader = screen.getByTestId('products-loader');

    expect(loader).toHaveAttribute('id', 'products-loader');
  });
});
