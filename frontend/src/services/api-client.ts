import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URLS } from '../config/api-config';
import type { AuthTokens } from '../types/auth';
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredSession,
} from '../utils/auth-storage';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let onSessionRefreshed: ((tokens: AuthTokens) => void) | null = null;
let onSessionExpired: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  baseURL: API_URLS.auth,
});

export const citasClient = axios.create({
  baseURL: API_URLS.citas,
});

export const historialClient = axios.create({
  baseURL: API_URLS.historial,
});

export const setAuthInterceptorsHandlers = ({
  onRefresh,
  onLogout,
}: {
  onRefresh: (tokens: AuthTokens) => void;
  onLogout: () => void;
}) => {
  onSessionRefreshed = onRefresh;
  onSessionExpired = onLogout;
};

const attachAccessToken = (config: InternalAxiosRequestConfig) => {
  const accessToken = getStoredAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

const refreshAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();
  const user = getStoredUser();

  if (!refreshToken || !user) return null;

  const { data } = await axios.post(`${API_URLS.auth}/auth/refresh`, {
    refreshToken,
  });

  const tokens: AuthTokens = {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  };

  setStoredSession(tokens, user);
  onSessionRefreshed?.(tokens);

  return tokens.accessToken;
};

const handleAuthError = async (error: AxiosError) => {
  const originalRequest = error.config as RetryableRequestConfig | undefined;

  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      clearStoredSession();
      onSessionExpired?.();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return axios(originalRequest as AxiosRequestConfig);
  } catch (refreshError) {
    clearStoredSession();
    onSessionExpired?.();
    return Promise.reject(refreshError);
  }
};

[apiClient, citasClient, historialClient].forEach((client) => {
  client.interceptors.request.use(attachAccessToken);
  client.interceptors.response.use((response) => response, handleAuthError);
});
