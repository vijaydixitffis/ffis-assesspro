
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Protected route: Auth state", { user, isLoading, path: location.pathname });
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    // Show minimal loading state while checking authentication
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ffis-teal border-t-transparent"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    console.log("User not authenticated, redirecting to login", { from: location });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    console.log(`User role ${user.role} doesn't match required role ${requiredRole}`, { from: location });
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  console.log("User authenticated and authorized, rendering protected content", { user });
  return <>{children}</>;
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Public route: Auth state", { user, isLoading, path: location.pathname });
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ffis-teal border-t-transparent"></div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    console.log("User already authenticated, redirecting to dashboard", { user });
    return <Navigate to="/dashboard" replace />;
  }

  console.log("User not authenticated, rendering public content");
  return <>{children}</>;
}
