import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Button from '@/components/Button';

import styles from './Button.module.css';

describe('Button', () => {
  it('renders a button with the primary variant by default', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain(styles.Button);
    expect(button.className).toContain(styles.primary);
  });

  it('renders the secondary variant when requested', () => {
    render(<Button variant="secondary">Cancel</Button>);

    const button = screen.getByRole('button', { name: 'Cancel' });

    expect(button.className).toContain(styles.secondary);
  });

  it('forwards native button props and handles clicks', () => {
    const handleClick = vi.fn();

    render(
      <Button aria-label="Create product" onClick={handleClick}>
        Create
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Create product' });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects the disabled state', () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled action
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Disabled action' });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
