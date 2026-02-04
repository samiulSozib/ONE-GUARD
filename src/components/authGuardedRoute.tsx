import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useAppSelector';

interface GuardedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const GuardedRoute: React.FC<GuardedRouteProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!token || !user) {
        router.push('/auth/login');
        return;
      }

      // Check role-based access
      if (requiredRole && requiredRole.length > 0) {
        if (!user.role || !requiredRole.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [user, token, isLoading, router, requiredRole]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show children only if authenticated (and authorized if role specified)
  if (token && user) {
    if (requiredRole && requiredRole.length > 0) {
      if (user.role && requiredRole.includes(user.role)) {
        return <>{children}</>;
      }
      return null;
    }
    return <>{children}</>;
  }

  return null;
};

export default GuardedRoute;