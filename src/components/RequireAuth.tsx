import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/utils/auth';

const STORAGE_KEY = 'increscendo_user';

export const RequireAuth: React.FC<{ children: JSX.Element; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const userStr = localStorage.getItem(STORAGE_KEY);
  const testRole = localStorage.getItem('testUserRole');

  if (!userStr && !testRole) {
    console.log('[RequireAuth] no local profile found, redirecting to /auth', { pathname: location.pathname });
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const user = userStr ? JSON.parse(userStr) : { role: testRole };

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.warn('[RequireAuth] user role not allowed for this route', { role: user.role, allowedRoles, pathname: location.pathname });
      // Redirect to appropriate home based on role
      const dest = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      return <Navigate to={dest} replace />;
    }
  }

  console.log('[RequireAuth] authorized', { role: user.role, pathname: location.pathname });
  return children;
};

export default RequireAuth;
