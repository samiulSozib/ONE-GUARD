// service/company-service-billing-method.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CompanyServiceBillingMethod, CompanyServiceBillingMethodParams } from "@/app/types/company-service-billing-method";

export const companyServiceBillingMethodService = {
  // Get all billing methods
  getCompanyServiceBillingMethods: (params?: CompanyServiceBillingMethodParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: CompanyServiceBillingMethod[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        }
      }>>('/company-service-billing-methods', { params })
    ),

  // Get single billing method
  getCompanyServiceBillingMethod: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{item: CompanyServiceBillingMethod}>>(`/company-service-billing-methods/${id}/show`)
    ),

  // Create billing method
  createCompanyServiceBillingMethod: (data: Omit<CompanyServiceBillingMethod, 'id' | 'created_at' | 'updated_at' | 'services_count'>) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyServiceBillingMethod}>>('/company-service-billing-methods', data)
    ),

  // Update billing method
  updateCompanyServiceBillingMethod: (id: number, data: Partial<CompanyServiceBillingMethod>) =>
    handleApiResponse(
      api.put<ApiResponse<{item: CompanyServiceBillingMethod}>>(`/company-service-billing-methods/${id}`, data)
    ),

  // Delete billing method
  deleteCompanyServiceBillingMethod: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/company-service-billing-methods/${id}`)
    ),

  // Toggle billing method status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{message: string}>>(`/company-service-billing-methods/${id}/change-status`, { is_active })
    ),
};
