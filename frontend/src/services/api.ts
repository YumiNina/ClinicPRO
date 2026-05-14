import { getStoredRefreshToken } from '../utils/auth-storage';
import { apiClient } from './api-client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (typeof options.headers === 'object' && options.headers !== null) {
    Object.assign(headers, options.headers);
  }
  try {
    const response = await apiClient.request<ApiResponse<T>>({
      url: endpoint,
      method: options.method || 'GET',
      headers,
      data: options.body,
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const authService = {
  login: async (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: async (nombre_completo: string, email: string, password: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre_completo,
        email,
        password,
        rol: 'recepcionista',
      }),
    }),

  logout: async () =>
    apiCall('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: getStoredRefreshToken(),
      }),
    }),

  getProfile: async () => apiCall('/auth/me'),

  recoverPassword: async (email: string) =>
    apiCall('/auth/recover-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

export const appointmentService = {
  getAppointments: async () => apiCall('/appointments'),

  bookAppointment: async (data: object) =>
    apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelAppointment: async (id: string) =>
    apiCall(`/appointments/${id}`, {
      method: 'DELETE',
    }),
};

export const doctorService = {
  getAgenda: async () => apiCall('/doctor/agenda'),

  getPatientHistory: async (patientId: string) => apiCall(`/doctor/patients/${patientId}/history`),
};

export const adminService = {
  getDashboard: async () => apiCall('/admin/dashboard'),

  getAllAppointments: async () => apiCall('/admin/appointments'),

  registerDoctor: async (data: object) =>
    apiCall('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerClinic: async (data: object) =>
    apiCall('/admin/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default apiCall;
