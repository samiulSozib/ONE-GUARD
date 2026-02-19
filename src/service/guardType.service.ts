import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { GuardType, GuardTypeParams } from "@/app/types/guard-type";

export const guardTypeService = {
  // Get all guardTypes
  getGuardTypes: (params?: GuardTypeParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: GuardType[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/guard-types', { params })
    ),
  
  // Get single guardType
  getGuardType: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<{item:GuardType}>>(`/admin/guard-types/${id}/show`, { params })),
  
  // Create guardType
  createGuardType: (data: FormData | Omit<GuardType, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<{item:GuardType}>>('/admin/guard-types', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update guardType
  updateGuardType: (id: number, data: FormData | Partial<GuardType>) =>
    handleApiResponse(api.put<ApiResponse<{item:GuardType}>>(`/admin/guard-types/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete guardType
  deleteGuardType: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/guard-types/${id}`)),
  
  // Toggle guardType status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.patch<ApiResponse<GuardType>>(`/admin/guard-types/${id}/change-status?is_active=${is_active?1:0}`)),
  


};