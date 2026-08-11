// service/client-contract-service-component.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  ClientContractServiceComponent,
  ClientContractServiceComponentParams,
  CreateClientContractServiceComponentDto,
  UpdateClientContractServiceComponentDto,
} from "@/app/types/client-contract-service-component";

export const clientContractServiceComponentService = {
  // Get all client contract service components
  getClientContractServiceComponents: (params?: ClientContractServiceComponentParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: ClientContractServiceComponent[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>('/admin/client-contract-service-components', { params })
    ),

  // Get single client contract service component
  getClientContractServiceComponent: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: ClientContractServiceComponent }>>(
        `/admin/client-contract-service-components/${id}`
      )
    ),

  // Create client contract service component
  createClientContractServiceComponent: (data: CreateClientContractServiceComponentDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: ClientContractServiceComponent; message: string }>>(
        '/admin/client-contract-service-components',
        data
      )
    ),

  // Update client contract service component
  updateClientContractServiceComponent: (id: number, data: UpdateClientContractServiceComponentDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: ClientContractServiceComponent; message: string }>>(
        `/admin/client-contract-service-components/${id}`,
        data
      )
    ),

  // Toggle client contract service component status
  toggleStatus: (id: number, isActive: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{ item: ClientContractServiceComponent; message: string }>>(
        `/admin/client-contract-service-components/${id}/change-status`,
        { is_active: isActive }
      )
    ),

  // Delete client contract service component
  deleteClientContractServiceComponent: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<{ message: string }>>(
        `/admin/client-contract-service-components/${id}`
      )
    ),
};
