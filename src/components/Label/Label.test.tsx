import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Label from '@/components/Label';

import styles from './Label.module.css';

describe('Label', () => {
  it('renders its content', () => {
    render(<Label>Email</Label>);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('forwards native label props', () => {
    render(
      <Label htmlFor="email" id="email-label">
        Email
      </Label>
    );

    const label = screen.getByText('Email');

    expect(label).toHaveAttribute('for', 'email');
    expect(label).toHaveAttribute('id', 'email-label');
  });

  it('applies custom class names', () => {
    render(<Label className="customLabel">Email</Label>);

    const label = screen.getByText('Email');

    expect(label.className).toContain(styles.Label);
    expect(label.className).toContain('customLabel');
  });
});
