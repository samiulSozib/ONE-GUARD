// components/auth/GuardedRoute.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getProfile } from '@/store/slices/authSlice';

interface GuardedRouteProps {
  children: React.ReactNode;
}

const GuardedRoute: React.FC<GuardedRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, isLoading, user } = useAppSelector((state) => state.auth);
  const refreshed = useRef(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/auth/login');
    }
  }, [token, isLoading, router]);

  // Refresh permissions after login / page reload.
  useEffect(() => {
    if (!token || refreshed.current) return;
    if (user?.permissions && user.permissions.length > 0) {
      refreshed.current = true;
      return;
    }
    refreshed.current = true;
    void dispatch(getProfile());
  }, [token, user, dispatch]);

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