export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  require_password_update?: boolean;
  name: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  requirePasswordUpdate: boolean;
};

export type LoginResponsePayload = {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type RequiredPasswordUpdateFormValues = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};
