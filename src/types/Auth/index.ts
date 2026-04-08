export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponsePayload = {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};
