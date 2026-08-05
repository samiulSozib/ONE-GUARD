// service/company-service-category.service.ts
import { ApiResponse } from "@/app/types/api.types";
import { CompanyServiceCategory, CompanyServiceCategoryParams, CreateCompanyServiceCategoryDto, UpdateCompanyServiceCategoryDto } from "@/app/types/company-service-category";
import api, { handleApiResponse } from "./api.service";

export const companyServiceCategoryService = {
  // Get all categories
  getCompanyServiceCategories: (params?: CompanyServiceCategoryParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: CompanyServiceCategory[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        }
      }>>('/admin/company-service-categories', { params })
    ),

  // Get single category
  getCompanyServiceCategory: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{item: CompanyServiceCategory}>>(`/admin/company-service-categories/${id}/show`)
    ),

  // Create category
  createCompanyServiceCategory: (data: CreateCompanyServiceCategoryDto) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyServiceCategory}>>('/admin/company-service-categories', data)
    ),

  // Update category
  updateCompanyServiceCategory: (id: number, data: UpdateCompanyServiceCategoryDto) =>
    handleApiResponse(
      api.put<ApiResponse<{item: CompanyServiceCategory}>>(`/admin/company-service-categories/${id}`, data)
    ),

  // Delete category
  deleteCompanyServiceCategory: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/company-service-categories/${id}`)
    ),

  // Toggle category status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{message: string}>>(`/admin/company-service-categories/${id}/change-status`, { is_active })
    ),
};
