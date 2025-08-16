import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};
