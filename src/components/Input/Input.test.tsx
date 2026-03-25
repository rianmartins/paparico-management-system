import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Input from '@/components/Input';

import styles from './Input.module.css';

describe('Input', () => {
  it('renders as a native input and forwards standard props', () => {
    render(<Input name="query" placeholder="Search products" />);

    const input = screen.getByRole('textbox');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'query');
    expect(input).toHaveAttribute('placeholder', 'Search products');
    expect(input).toHaveAttribute('type', 'text');
    expect(input.className).toContain(styles.Input);
  });

  it('renders a label and associates it with the input', () => {
    render(<Input label="Search" />);

    const input = screen.getByRole('textbox', { name: 'Search' });

    expect(screen.getByText('Search')).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Required field." label="Name" />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true');
  });
});
