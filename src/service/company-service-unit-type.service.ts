// service/company-service-unit-type.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CompanyServiceUnitType, CompanyServiceUnitTypeParams, CreateCompanyServiceUnitTypeDto, UpdateCompanyServiceUnitTypeDto } from "@/app/types/company-service-unit-type";

export const companyServiceUnitTypeService = {
  // Get all unit types
  getCompanyServiceUnitTypes: (params?: CompanyServiceUnitTypeParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: CompanyServiceUnitType[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        }
      }>>('/admin/company-service-unit-types', { params })
    ),

  // Get single unit type
  getCompanyServiceUnitType: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{item: CompanyServiceUnitType}>>(`/admin/company-service-unit-types/${id}/show`)
    ),

  // Create unit type
  createCompanyServiceUnitType: (data: CreateCompanyServiceUnitTypeDto) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyServiceUnitType}>>('/admin/company-service-unit-types', data)
    ),

  // Update unit type
  updateCompanyServiceUnitType: (id: number, data: UpdateCompanyServiceUnitTypeDto) =>
    handleApiResponse(
      api.put<ApiResponse<{item: CompanyServiceUnitType}>>(`/admin/company-service-unit-types/${id}`, data)
    ),

  // Delete unit type
  deleteCompanyServiceUnitType: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/company-service-unit-types/${id}`)
    ),

  // Toggle unit type status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{message: string}>>(`/admin/company-service-unit-types/${id}/change-status`, { is_active })
    ),
};
