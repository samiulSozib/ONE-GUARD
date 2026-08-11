// service/client-contract-service.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  ClientContractService,
  ClientContractServiceParams,
  CreateClientContractServiceDto,
  UpdateClientContractServiceDto,
} from "@/app/types/client-contract-service";

export const clientContractServiceService = {
  // Get all client contract services
  getClientContractServices: (params?: ClientContractServiceParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: ClientContractService[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>('/admin/client-contract-services', { params })
    ),

  // Get single client contract service
  getClientContractService: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: ClientContractService }>>(
        `/admin/client-contract-services/${id}`
      )
    ),

  // Create client contract service
  createClientContractService: (data: CreateClientContractServiceDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContractService; message: string }>>(
        '/admin/client-contract-services',
        data
      )
    ),

  // Update client contract service
  updateClientContractService: (id: number, data: UpdateClientContractServiceDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: ClientContractService; message: string }>>(
        `/admin/client-contract-services/${id}`,
        data
      )
    ),

  // Toggle client contract service status
  toggleStatus: (id: number, isActive: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{ item: ClientContractService; message: string }>>(
        `/admin/client-contract-services/${id}/change-status`,
        { is_active: isActive }
      )
    ),

  // Delete client contract service
  deleteClientContractService: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<{ message: string }>>(
        `/admin/client-contract-services/${id}`
      )
    ),
};
