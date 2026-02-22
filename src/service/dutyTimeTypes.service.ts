import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { DutyTimeType, DutyTimeTypeParams } from "@/app/types/dutyTimeType";

export const dutyTimeTypeService = {
  // Get all dutyTimeTypes
  getDutyTimeTypes: (params?: DutyTimeTypeParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: DutyTimeType[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/duty-time-types', { params })
    ),
  
  // Get single dutyTimeType
  getDutyTimeType: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<{item:DutyTimeType}>>(`/admin/duty-time-types/${id}/show`, { params })),
  
  // Create dutyTimeType
  createDutyTimeType: (data: FormData | Omit<DutyTimeType, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<{item:DutyTimeType}>>('/admin/duty-time-types', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update dutyTimeType
  updateDutyTimeType: (id: number, data: FormData | Partial<DutyTimeType>) =>
    handleApiResponse(api.put<ApiResponse<{item:DutyTimeType}>>(`/admin/duty-time-types/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete dutyTimeType
  deleteDutyTimeType: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/duty-time-types/${id}`)),
  
  // Toggle dutyTimeType status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.get<ApiResponse<{message:string}>>(`/admin/duty-time-types/${id}/change-status?is_active=${is_active?1:0}`)),
  


};