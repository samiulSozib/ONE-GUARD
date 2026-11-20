import type { ApiResponse } from "@/app/types/api.types";
import type {
  RbacPermissionCatalog,
  RbacRole,
  RbacUser,
} from "@/app/types/rbac.types";
import api, { handleApiResponse } from "./api.service";

const RBAC_URL = "/admin/rbac";

export const rbacService = {
  getPermissions: (): Promise<RbacPermissionCatalog> =>
    handleApiResponse(
      api.get<ApiResponse<RbacPermissionCatalog>>(`${RBAC_URL}/permissions`)
    ),

  getRoles: (): Promise<{ items: RbacRole[] }> =>
    handleApiResponse(api.get<ApiResponse<{ items: RbacRole[] }>>(`${RBAC_URL}/roles`)),

  getRole: (id: number): Promise<RbacRole> =>
    handleApiResponse(api.get<ApiResponse<RbacRole>>(`${RBAC_URL}/roles/${id}`)),

  createRole: (data: {
    name: string;
    description?: string;
    permission_keys?: string[];
  }): Promise<RbacRole> =>
    handleApiResponse(api.post<ApiResponse<RbacRole>>(`${RBAC_URL}/roles`, data)),

  updateRole: (
    id: number,
    data: {
      name?: string;
      description?: string;
      permission_keys?: string[];
    }
  ): Promise<RbacRole> =>
    handleApiResponse(
      api.put<ApiResponse<RbacRole>>(`${RBAC_URL}/roles/${id}`, data)
    ),

  deleteRole: (id: number): Promise<{ message: string }> =>
    handleApiResponse(
      api.delete<ApiResponse<{ message: string }>>(`${RBAC_URL}/roles/${id}`)
    ),

  getUsers: (): Promise<{ items: RbacUser[] }> =>
    handleApiResponse(api.get<ApiResponse<{ items: RbacUser[] }>>(`${RBAC_URL}/users`)),

  createUser: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    is_active?: boolean;
    role_ids: number[];
  }): Promise<{ message: string; user: RbacUser }> =>
    handleApiResponse(
      api.post<ApiResponse<{ message: string; user: RbacUser }>>(
        `${RBAC_URL}/users`,
        data
      )
    ),

  updateUser: (
    userId: number,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
      is_active?: boolean;
      role_ids?: number[];
    }
  ): Promise<{ message: string; user: RbacUser }> =>
    handleApiResponse(
      api.put<ApiResponse<{ message: string; user: RbacUser }>>(
        `${RBAC_URL}/users/${userId}`,
        data
      )
    ),

  syncUserRoles: (
    userId: number,
    roleIds: number[]
  ): Promise<{ message: string }> =>
    handleApiResponse(
      api.put<ApiResponse<{ message: string }>>(
        `${RBAC_URL}/users/${userId}/roles`,
        { role_ids: roleIds }
      )
    ),
};
