import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Select from '@/components/Select';

import styles from './Select.module.css';

const options = [
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' }
];

describe('Select', () => {
  it('renders a native select and forwards standard props', () => {
    render(<Select label="Role" name="role" options={options} />);

    const select = screen.getByRole('combobox', { name: 'Role' });

    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('name', 'role');
    expect(select.className).toContain(styles.Select);
    expect(screen.getByRole('option', { name: 'Manager' })).toBeInTheDocument();
  });

  it('renders hint and error messages accessibly', () => {
    render(<Select error="Select a role." hint="Choose the user role." label="Role" options={options} />);

    const select = screen.getByRole('combobox', { name: 'Role' });
    const describedBy = select.getAttribute('aria-describedby') ?? '';

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toContain(`${select.getAttribute('id')}-hint`);
    expect(describedBy).toContain(`${select.getAttribute('id')}-error`);
    expect(screen.getByText('Choose the user role.')).toBeInTheDocument();
    expect(screen.getByText('Select a role.')).toBeInTheDocument();
  });
});
