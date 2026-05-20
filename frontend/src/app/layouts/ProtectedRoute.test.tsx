import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import type { AuthUser } from '../../types/auth';
import { RoleProtectedRoute } from './ProtectedRoute';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const makeUser = (rol: AuthUser['rol']): AuthUser => ({
  id: 'user-1',
  nombre_completo: 'Usuario Prueba',
  email: `${rol}@clinicpro.test`,
  rol,
});

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <h1>Panel administrador</h1>
            </RoleProtectedRoute>
          }
        />
        <Route path="/doctor" element={<h1>Panel medico</h1>} />
        <Route path="/" element={<h1>Login Clinic Pro</h1>} />
      </Routes>
    </MemoryRouter>,
  );

describe('RoleProtectedRoute integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders protected content for an authenticated user with an allowed role', () => {
    mockedUseAuth.mockReturnValue({
      user: makeUser('admin'),
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: /panel administrador/i })).toBeInTheDocument();
  });

  it('redirects authenticated users away from routes that do not match their role', () => {
    mockedUseAuth.mockReturnValue({
      user: makeUser('medico'),
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: /panel medico/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: /login clinic pro/i })).toBeInTheDocument();
  });
});
