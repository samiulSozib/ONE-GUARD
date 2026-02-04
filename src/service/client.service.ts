import { 
  Client, 
  ClientContact, 
  ClientParams, 
  SingleClientResponse, 
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
      api.get<ApiResponse<SingleClientResponse>>(`/admin/clients/${id}`, { params })
    ),
  
  // Create client
  createClient: (data: FormData | Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) =>
    handleApiResponse(
      api.post<ApiResponse<SingleClientResponse>>('/admin/clients', data, {
        headers: data instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' } 
          : undefined
      })
    ),
  
  // Update client
  updateClient: (id: number, data: FormData | Partial<Client>) =>
    handleApiResponse(
      api.put<ApiResponse<SingleClientResponse>>(`/admin/clients/${id}`, data, {
        headers: data instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' } 
          : undefined
      })
    ),
  
  // Delete client
  deleteClient: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/clients/${id}`)
    ),
  
  // Toggle client status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<SingleClientResponse>>(
        `/admin/clients/${id}/change-status`, 
        { is_active }
      )
    ),
  
};