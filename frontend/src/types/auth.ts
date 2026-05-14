export type UserRole = 'admin' | 'medico' | 'recepcionista';

export interface AuthUser {
  id: string;
  nombre_completo: string;
  email: string;
  rol: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
