// service/company-service-category.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CompanyServiceCategory, CompanyServiceCategoryParams } from "@/app/types/company-service-category";

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
  createCompanyServiceCategory: (data: Omit<CompanyServiceCategory, 'id' | 'created_at' | 'updated_at' | 'services_count'>) =>
    handleApiResponse(
      api.post<ApiResponse<{item: CompanyServiceCategory}>>('/admin/company-service-categories', data)
    ),

  // Update category
  updateCompanyServiceCategory: (id: number, data: Partial<CompanyServiceCategory>) =>
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
