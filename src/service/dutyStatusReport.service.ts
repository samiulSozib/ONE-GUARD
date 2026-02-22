import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
  DutyStatusReport, 
  DutyStatusReportParams,
  CreateDutyStatusReportDto,
  UpdateDutyStatusReportDto
} from "@/app/types/dutyStatusReport";

export const dutyStatusReportService = {
  // Get all reports
  getReports: (params?: DutyStatusReportParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: DutyStatusReport[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/duty-status-report", { params })
    ),

  // Get single report
  getReport: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item: DutyStatusReport}>>(`/admin/duty-status-report/${id}/show`, { params })
    ),

  // Create report
  createReport: (
    data: FormData | CreateDutyStatusReportDto
  ) => {
    // Handle FormData conversion if needed
    let formData: FormData;
    let isFormData = false;
    
    if (data instanceof FormData) {
      formData = data;
      isFormData = true;
    } else {
      formData = new FormData();
      
      // Append basic fields
      formData.append('duty_id', data.duty_id.toString());
      formData.append('guard_id', data.guard_id.toString());
      formData.append('message', data.message);
      formData.append("is_ok", data.is_ok ? "1" : "0");
      
      if (data.latitude) formData.append('latitude', data.latitude);
      if (data.longitude) formData.append('longitude', data.longitude);
      if (data.visible_to_client !== undefined) {
        //formData.append('visible_to_client', data.visible_to_client.toString());
        formData.append("visible_to_client", data.visible_to_client ? "1" : "0");
      }
      
      // Append media files if any
      if (data.media_files && data.media_files.length > 0) {
        data.media_files.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }
    }
    
    return handleApiResponse(
      api.post<ApiResponse<{item: DutyStatusReport}>>("/admin/duty-status-report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  },

  // Update report
  updateReport: (id: number, data: FormData | UpdateDutyStatusReportDto) => {
    let formData: FormData;
    let isFormData = false;
    
    if (data instanceof FormData) {
      formData = data;
      isFormData = true;
    } else {
      formData = new FormData();
      
      // Append fields that are provided
      if (data.message !== undefined) formData.append('message', data.message);
      if (data.is_ok !== undefined) formData.append("is_ok", data.is_ok ? "1" : "0");
      if (data.latitude !== undefined) formData.append('latitude', data.latitude);
      if (data.longitude !== undefined) formData.append('longitude', data.longitude);
      if (data.visible_to_client !== undefined) {
        formData.append('visible_to_client', data.visible_to_client?"1":"0");
      }
    }
    
    return handleApiResponse(
      api.put<ApiResponse<{item: DutyStatusReport}>>(`/admin/duty-status-report/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  },

  // Delete report
  deleteReport: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/duty-status-report/${id}`)
    ),

  // Toggle visibility
  toggleVisibility: (id: number, visible_to_client: boolean) =>
    handleApiResponse(
      api.get<ApiResponse<{message:string}>>(
        `/admin/duty-status-report/${id}/change-visibility?visible_to_client=${visible_to_client?1:0}`,
       
      )
    ),

  // Add media to report
  addMedia: (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`media[${index}]`, file);
    });
    
    return handleApiResponse(
      api.post<ApiResponse<{item: DutyStatusReport}>>(
        `/admin/duty-status-report/${id}/add-media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
    );
  },

  // Delete media from report
  deleteMedia: (reportId: number, mediaId: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/duty-status-report/${reportId}/media/${mediaId}`)
    ),
};