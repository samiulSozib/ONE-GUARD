"use client";

import { useHasPermission } from "@/hooks/usePermission";

type Props = {
  permission?: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function Can({ permission, fallback = null, children }: Props) {
  const allowed = useHasPermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
