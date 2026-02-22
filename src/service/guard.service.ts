import { ApiResponse } from "@/app/types/api.types";
import { Guard, GuardContact, GuardParams } from "@/app/types/guard";
import api, { handleApiResponse } from "./api.service";

export const guardService = {
  // Get all guards
  getGuards: (params?: GuardParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: Guard[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/guards', { params })
    ),
  
  // Get single guard
  getGuard: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<{item:Guard}>>(`/admin/guards/${id}/show`, { params })),
  
  // Create guard
  createGuard: (data: FormData | Omit<Guard, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<{item:Guard}>>('/admin/guards', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update guard
  updateGuard: (id: number, data: FormData | Partial<Guard>) =>
    handleApiResponse(api.put<ApiResponse<{item:Guard}>>(`/admin/guards/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete guard
  deleteGuard: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/guards/${id}`)),
  
  // Toggle guard status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.get<ApiResponse<{message:string}>>(`/admin/guards/${id}/change-status?is_active=${is_active?1:0}`)),
  
  // Guard contacts management
  getGuardContacts: (guardId: number) =>
    handleApiResponse(api.get<ApiResponse<GuardContact[]>>(`/admin/guards/${guardId}/contacts`)),
  
  addGuardContact: (guardId: number, data: Omit<GuardContact, 'id' | 'guard_id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<GuardContact>>(`/admin/guards/${guardId}/contacts`, data)),
  
  updateGuardContact: (guardId: number, contactId: number, data: Partial<GuardContact>) =>
    handleApiResponse(api.put<ApiResponse<GuardContact>>(`/admin/guards/${guardId}/contacts/${contactId}`, data)),
  
  deleteGuardContact: (guardId: number, contactId: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/guards/${guardId}/contacts/${contactId}`)),
  
  // Upload guard documents
  uploadGuardDocument: (guardId: number, formData: FormData) =>
    handleApiResponse(api.post<ApiResponse<void>>(`/admin/guards/${guardId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })),
  
  // Get guard statistics
  getGuardStats: () =>
    handleApiResponse(api.get<ApiResponse<{
      total_guards: number;
      active_guards: number;
      on_duty: number;
      available: number;
    }>>('/admin/guards/stats')),
  
  // Get guard assignments
  getGuardAssignments: (guardId: number, params?: { status?: string; date_from?: string; date_to?: string }) =>
    handleApiResponse(api.get<ApiResponse<void>>(`/admin/guards/${guardId}/assignments`, { params })),
  
  // Get guard attendance
  getGuardAttendance: (guardId: number, params?: { date_from?: string; date_to?: string }) =>
    handleApiResponse(api.get<ApiResponse<void>>(`/admin/guards/${guardId}/attendance`, { params })),
};