// components/auth/GuardedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/useAppSelector';

interface GuardedRouteProps {
  children: React.ReactNode;
}

const GuardedRoute: React.FC<GuardedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/auth/login');
    }
  }, [token, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b0016]"></div>
      </div>
    );
  }

  // Show children only if authenticated
  return token ? <>{children}</> : null;
};

export default GuardedRoute;