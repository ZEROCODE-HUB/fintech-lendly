import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const STORAGE_KEY = 'increscendo_user';

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const location = useLocation();
  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) {
    console.log('[RequireAuth] no local profile found, redirecting to /auth', { pathname: location.pathname });
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  console.log('[RequireAuth] local profile present, allowing route', { pathname: location.pathname });
  return children;
};

export default RequireAuth;
