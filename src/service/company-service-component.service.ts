// service/company-service-component.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CompanyServiceComponent, CompanyServiceComponentParams } from "@/app/types/company-service-component";

export const companyServiceComponentService = {
  // Get all components
  getCompanyServiceComponents: (params?: CompanyServiceComponentParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: CompanyServiceComponent[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        }
      }>>('/company-service-components', { params })
    ),

  // Get single component
  getCompanyServiceComponent: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{item: CompanyServiceComponent}>>(`/company-service-components/${id}/show`)
    ),

  // Create component
  createCompanyServiceComponent: (data: Omit<CompanyServiceComponent, 'id' | 'created_at' | 'updated_at' | 'parent_service' | 'component_service'>) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyServiceComponent}>>('/company-service-components', data)
    ),

  // Update component
  updateCompanyServiceComponent: (id: number, data: Partial<CompanyServiceComponent>) =>
    handleApiResponse(
      api.put<ApiResponse<{item: CompanyServiceComponent}>>(`/company-service-components/${id}`, data)
    ),

  // Delete component
  deleteCompanyServiceComponent: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/company-service-components/${id}`)
    ),

  // Toggle component status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{message: string}>>(`/company-service-components/${id}/change-status`, { is_active })
    ),
};
