/**
 * Tipos comunes compartidos en toda la aplicación backend
 */

export interface IUser {
  id: string;
  nombre_completo: string;
  email: string;
  password_hash: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IDoctor {
  id: string;
  usuario_id?: string;
  nombre_completo: string;
  ci?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  licencia_medica?: string;
  clinica_id?: string;
  horario?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPatient {
  id: string;
  usuario_id?: string;
  nombre_completo?: string;
  ci?: string;
  telefono?: string;
  email?: string;
  fecha_nacimiento?: Date;
  direccion?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICita {
  id: string;
  paciente_id: string;
  medico_id: string;
  clinica_id: string;
  especialidad: string;
  fecha: string;
  hora: string;
  motivo?: string;
  estado: CitaStatus;
  notas_doctor?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'medico',
  RECEPTIONIST = 'recepcionista',
}

export enum CitaStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ABSENT = 'absent',
}

export interface IAuthPayload {
  id: string;
  email: string;
  rol: UserRole;
  iat?: number;
  exp?: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nombre_completo: string;
    email: string;
    rol: UserRole;
  };
}
