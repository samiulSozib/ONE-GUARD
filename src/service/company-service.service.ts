// service/company-service.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CompanyService, CompanyServiceParams } from "@/app/types/company-service";

export const companyServiceService = {
  // Get all services
  getCompanyServices: (params?: CompanyServiceParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: CompanyService[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        }
      }>>('/company-services', { params })
    ),

  // Get single service
  getCompanyService: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{item: CompanyService}>>(`/company-services/${id}/show`)
    ),

  // Create service
  createCompanyService: (data: Omit<CompanyService, 'id' | 'created_at' | 'updated_at' | 'category' | 'unit_type' | 'billing_method' | 'components'>) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyService}>>('/company-services', data)
    ),

  // Update service
  updateCompanyService: (id: number, data: Partial<CompanyService>) =>
    handleApiResponse(
      api.put<ApiResponse<{item: CompanyService}>>(`/company-services/${id}`, data)
    ),

  // Delete service
  deleteCompanyService: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/company-services/${id}`)
    ),

  // Toggle service status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{message: string}>>(`/company-services/${id}/change-status`, { is_active })
    ),
};
