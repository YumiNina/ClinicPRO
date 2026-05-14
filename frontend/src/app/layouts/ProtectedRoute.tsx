import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';
import { getDefaultPathForRole } from '../../utils/roles';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !accessToken || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export const RoleProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) => {
  const { accessToken, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !accessToken || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={getDefaultPathForRole(user.rol)} replace />;
  }

  return children;
};
