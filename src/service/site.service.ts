import { Site, SiteLocation, SiteParams } from "@/app/types/site";
import api, { handleApiResponse } from "./api.service";
import { ApiResponse } from "@/app/types/api.types";

export const siteService = {
  // Get all sites
  getSites: (params?: SiteParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: Site[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/sites', { params })
    ),
  
  // Get single site
  getSite: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<Site>>(`/admin/sites/${id}`, { params })),
  
  // Create site
  createSite: (data: FormData | Omit<Site, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<Site>>('/admin/sites', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update site
  updateSite: (id: number, data: FormData | Partial<Site>) =>
    handleApiResponse(api.put<ApiResponse<Site>>(`/admin/sites/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete site
  deleteSite: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/sites/${id}`)),
  
  // Toggle site status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.patch<ApiResponse<Site>>(`/admin/sites/${id}/change-status`, { is_active })),
  
  // Site locations management
  getSiteLocations: (siteId: number) =>
    handleApiResponse(api.get<ApiResponse<SiteLocation[]>>(`/admin/sites/${siteId}/locations`)),
  
  createSiteLocation: (siteId: number, data: Omit<SiteLocation, 'id' | 'site_id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<SiteLocation>>(`/admin/sites/${siteId}/locations`, data)),
  
  updateSiteLocation: (siteId: number, locationId: number, data: Partial<SiteLocation>) =>
    handleApiResponse(api.put<ApiResponse<SiteLocation>>(`/admin/sites/${siteId}/locations/${locationId}`, data)),
  
  deleteSiteLocation: (siteId: number, locationId: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/sites/${siteId}/locations/${locationId}`)),
  
  // Upload site documents
  uploadSiteDocument: (siteId: number, formData: FormData) =>
    handleApiResponse(api.post<ApiResponse<void>>(`/admin/sites/${siteId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })),
  
  // Get site statistics
  getSiteStats: () =>
    handleApiResponse(api.get<ApiResponse<{
      total_sites: number;
      active_sites: number;
      running_sites: number;
      planned_sites: number;
    }>>('/admin/sites/stats')),
  
  // Get site duties
  getSiteDuties: (siteId: number, params?: { status?: string; date_from?: string; date_to?: string }) =>
    handleApiResponse(api.get<ApiResponse<void>>(`/admin/sites/${siteId}/duties`, { params })),
  
  // Get site incidents
  getSiteIncidents: (siteId: number, params?: { status?: string; date_from?: string; date_to?: string }) =>
    handleApiResponse(api.get<ApiResponse<void>>(`/admin/sites/${siteId}/incidents`, { params })),
};