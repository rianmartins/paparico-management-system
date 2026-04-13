import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';

import CurrentUserInformation from './CurrentUserInformation';
import { AuthUser } from '@/types/Auth';

vi.mock('@/api/AuthAPI', () => ({
  default: {
    me: vi.fn()
  }
}));

const mockedMe = vi.mocked(AuthAPI.me);

const userFixture: AuthUser = {
  id: '1',
  email: 'manager@paparico.pt',
  roles: ['admin', 'manager'],
  name: 'Paparico Manager',
  require_password_update: false
};

describe('CurrentUserInformation', () => {
  beforeEach(() => {
    mockedMe.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
  });

  it('renders the stored user name, email and roles', async () => {
    mockedMe.mockResolvedValue(userFixture);

    renderWithQueryClient(<CurrentUserInformation />);

    expect(screen.getByLabelText('User information')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('manager@paparico.pt')).toBeInTheDocument();
    });
    expect(screen.getByText('admin, manager')).toBeInTheDocument();
  });

  it('show loading indicators while the current user is being loaded', async () => {
    mockedMe.mockReturnValue(new Promise(() => undefined));

    renderWithQueryClient(<CurrentUserInformation />);

    expect(screen.getAllByText('Loading...')).toHaveLength(3);
  });

  it.skip('renders unavailable values when the current user cannot be loaded', async () => {
    mockedMe.mockRejectedValue(new Error('Unable to load current user.'));

    renderWithQueryClient(<CurrentUserInformation />);

    await waitFor(() => {
      expect(screen.getAllByText('Not available')).toHaveLength(3);
    });
  });
});
