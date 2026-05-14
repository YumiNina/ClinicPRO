import {
  createContext,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { apiClient, setAuthInterceptorsHandlers } from '../services/api-client';
import type { AuthTokens, AuthUser } from '../types/auth';
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredSession,
} from '../utils/auth-storage';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (
    accessToken: string,
    refreshToken: string,
    userData: AuthUser
  ) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredAccessToken()
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    getStoredRefreshToken()
  );

  const login = (
    newAccessToken: string,
    newRefreshToken: string,
    userData: AuthUser
  ) => {
    setStoredSession(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      userData
    );

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', {
          refreshToken,
        });
      }
    } catch {
      // Aunque falle el backend, limpiamos sesión local
    } finally {
      clearStoredSession();

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    setAuthInterceptorsHandlers({
      onRefresh: (tokens: AuthTokens) => {
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
      },
      onLogout: () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      },
    });
  }, []);

  useEffect(() => {
    if (!accessToken || !user) {
      clearStoredSession();
    }
  }, [accessToken, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        isAuthenticated: !!user && !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
