import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { SiteLocation, SiteLocationParams } from "@/app/types/siteLocation.types";

export const siteLocationService = {
  // Get all siteLocations
  getSiteLocations: (params?: SiteLocationParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: SiteLocation[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/site-locations', { params })
    ),
  
  // Get single siteLocation
  getSiteLocation: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<SiteLocation>>(`/admin/site-locations/${id}`, { params })),
  
  // Create siteLocation
  createSiteLocation: (data: FormData | Omit<SiteLocation, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<SiteLocation>>('/admin/site-locations', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update siteLocation
  updateSiteLocation: (id: number, data: FormData | Partial<SiteLocation>) =>
    handleApiResponse(api.put<ApiResponse<SiteLocation>>(`/admin/site-locations/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete siteLocation
  deleteSiteLocation: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/site-locations/${id}`)),
  
  // Toggle siteLocation status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.patch<ApiResponse<SiteLocation>>(`/admin/site-locations/${id}/change-status`, { is_active })),
  


};