/**
 * Tipos comunes compartidos en toda la aplicación backend
 */

export interface IUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IDoctor {
  id: string;
  user_id: string;
  license_number: string;
  specialties: string[];
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPatient {
  id: string;
  user_id: string;
  date_of_birth: Date;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICita {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: Date;
  status: CitaStatus;
  notes: string;
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
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  RECEPTIONIST = 'receptionist',
}

export enum CitaStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface IAuthPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
