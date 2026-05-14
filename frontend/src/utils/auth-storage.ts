import type { AuthTokens, AuthUser } from '../types/auth';

const ACCESS_TOKEN_KEY = 'clinicpro_access_token';
const REFRESH_TOKEN_KEY = 'clinicpro_refresh_token';
const USER_KEY = 'clinicpro_user';

export const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const savedUser = localStorage.getItem(USER_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredSession = ({ accessToken, refreshToken }: AuthTokens, user: AuthUser) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
