"use client";

import { useAppSelector } from "@/hooks/useAppSelector";

export function usePermissions(): string[] {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return [];
  if (user.is_super_admin || user.role === "super_admin") {
    return user.permissions?.length ? user.permissions : ["*"];
  }
  // Legacy localStorage sessions may not have permissions yet (until /auth/me).
  if (user.permissions === undefined && user.role === "admin") {
    return ["*"];
  }
  return user.permissions || [];
}

export function useHasPermission(permission?: string | string[]): boolean {
  const user = useAppSelector((s) => s.auth.user);
  const owned = usePermissions();

  if (!permission) return true;
  if (!user) return false;
  if (
    user.is_super_admin ||
    user.role === "super_admin" ||
    owned.includes("*")
  ) {
    return true;
  }

  const needed = Array.isArray(permission) ? permission : [permission];
  return needed.some((key) => owned.includes(key));
}

export function useCanAny(...permissions: string[]): boolean {
  return useHasPermission(permissions);
}
