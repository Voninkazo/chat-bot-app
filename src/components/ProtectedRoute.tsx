import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from './Loading';
import userStore from '../stores/userStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = userStore();
  const location = useLocation();
  console.log('location:', location);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};