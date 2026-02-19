import { 
  Client, 
  ClientContact, 
  ClientParams, 
  PaginatedClientsResponse 
} from "@/app/types/client";
import api, { handleApiResponse } from "./api.service";
import { ApiResponse } from "@/app/types/api.types";

export const clientService = {
  // Get all clients
  getClients: (params?: ClientParams) =>
    handleApiResponse(
      api.get<ApiResponse<PaginatedClientsResponse>>('/admin/clients', { params })
    ),
  
  // Get single client
  getClient: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item:Client}>>(`/admin/clients/${id}/show`, { params })
    ),
  
  // Create client
  createClient: (data: FormData | Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) =>
    handleApiResponse(
      api.post<ApiResponse<{item:Client}>>('/admin/clients', data, {
        headers: data instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' } 
          : undefined
      })
    ),
  
  // Update client
  updateClient: (id: number, data: FormData | Partial<Client>) =>
    handleApiResponse(
      api.put<ApiResponse<{item:Client}>>(`/admin/clients/${id}`, data, {
        headers: data instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' } 
          : undefined
      })
    ),
  
  // Delete client
  deleteClient: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<null>>(`/admin/clients/${id}`)
    ),
  
  // Toggle client status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{item:Client}>>(
        `/admin/clients/${id}/change-status?is_active=${is_active?1:0}`, 
        { is_active }
      )
    ),
};