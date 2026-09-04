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

  // Get single report with full details
  getReport: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item: DutyStatusReport}>>(`/admin/duty-status-report/${id}`, { params })
    ),

  // Create report with all fields
  createReport: (data: FormData | CreateDutyStatusReportDto) => {
    let formData: FormData;

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();

      // Basic fields
      formData.append('duty_id', data.duty_id.toString());
      formData.append('guard_id', data.guard_id.toString());
      formData.append('message', data.message);
      formData.append('is_ok', data.is_ok ? "1" : "0");

      // Incident fields
      if (data.had_incident !== undefined) {
        formData.append('had_incident', data.had_incident ? "1" : "0");
      }
      if (data.suspicious_activity !== undefined) {
        formData.append('suspicious_activity', data.suspicious_activity ? "1" : "0");
      }
      if (data.security_safety_concern !== undefined) {
        formData.append('security_safety_concern', data.security_safety_concern ? "1" : "0");
      }
      if (data.unauthorized_access !== undefined) {
        formData.append('unauthorized_access', data.unauthorized_access ? "1" : "0");
      }
      if (data.property_damage !== undefined) {
        formData.append('property_damage', data.property_damage ? "1" : "0");
      }
      if (data.emergency_services_contacted !== undefined) {
        formData.append('emergency_services_contacted', data.emergency_services_contacted ? "1" : "0");
      }
      if (data.requires_follow_up !== undefined) {
        formData.append('requires_follow_up', data.requires_follow_up ? "1" : "0");
      }

      // Location fields
      if (data.latitude !== undefined && data.latitude !== null) {
        formData.append('latitude', data.latitude.toString());
      }
      if (data.longitude !== undefined && data.longitude !== null) {
        formData.append('longitude', data.longitude.toString());
      }
      if (data.has_location !== undefined) {
        formData.append('has_location', data.has_location ? "1" : "0");
      }

      // Visibility
      if (data.visible_to_client !== undefined) {
        formData.append('visible_to_client', data.visible_to_client ? "1" : "0");
      }

      // Media files
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

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();

      // Update fields
      if (data.message !== undefined) formData.append('message', data.message);
      if (data.is_ok !== undefined) formData.append('is_ok', data.is_ok ? "1" : "0");

      // Incident fields
      if (data.had_incident !== undefined) {
        formData.append('had_incident', data.had_incident ? "1" : "0");
      }
      if (data.suspicious_activity !== undefined) {
        formData.append('suspicious_activity', data.suspicious_activity ? "1" : "0");
      }
      if (data.security_safety_concern !== undefined) {
        formData.append('security_safety_concern', data.security_safety_concern ? "1" : "0");
      }
      if (data.unauthorized_access !== undefined) {
        formData.append('unauthorized_access', data.unauthorized_access ? "1" : "0");
      }
      if (data.property_damage !== undefined) {
        formData.append('property_damage', data.property_damage ? "1" : "0");
      }
      if (data.emergency_services_contacted !== undefined) {
        formData.append('emergency_services_contacted', data.emergency_services_contacted ? "1" : "0");
      }
      if (data.requires_follow_up !== undefined) {
        formData.append('requires_follow_up', data.requires_follow_up ? "1" : "0");
      }

      // Location fields
      if (data.latitude !== undefined && data.latitude !== null) {
        formData.append('latitude', data.latitude.toString());
      }
      if (data.longitude !== undefined && data.longitude !== null) {
        formData.append('longitude', data.longitude.toString());
      }
      if (data.has_location !== undefined) {
        formData.append('has_location', data.has_location ? "1" : "0");
      }

      if (data.visible_to_client !== undefined) {
        formData.append('visible_to_client', data.visible_to_client ? "1" : "0");
      }
      if (data.guard_id !== undefined) {
        formData.append('guard_id', data.guard_id.toString());
      }
      if (data.duty_id !== undefined) {
        formData.append('duty_id', data.duty_id.toString());
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
      api.put<ApiResponse<{item: DutyStatusReport}>>(
        `/admin/duty-status-report/${id}/toggle-visibility`,
        { visible_to_client }
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
