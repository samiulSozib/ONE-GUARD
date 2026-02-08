import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
  DutyAttendance, 
  DutyAttendanceParams,
  CreateDutyAttendanceDto 
} from "@/app/types/dutyAttendance";

export const dutyAttendanceService = {
  // Get all attendances
  getAttendances: (params?: DutyAttendanceParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: DutyAttendance[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/duty-attendances", { params })
    ),

  // Get single attendance
  getAttendance: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item: DutyAttendance}>>(`/admin/duty-attendances/${id}/show`, { params })
    ),

  // Create attendance
  createAttendance: (
    data: FormData | CreateDutyAttendanceDto
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{item: DutyAttendance}>>("/admin/duty-attendances", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Update attendance
  updateAttendance: (id: number, data: FormData | CreateDutyAttendanceDto) =>
    handleApiResponse(
      api.put<ApiResponse<{item: DutyAttendance}>>(`/admin/duty-attendances/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Delete attendance
  deleteAttendance: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/duty-attendances/${id}`)
    ),

  // Toggle attendance status
  toggleStatus: (id: number, status: string) =>
    handleApiResponse(
      api.patch<ApiResponse<{item: DutyAttendance}>>(
        `/admin/duty-attendances/${id}/change-status`,
        { status }
      )
    ),

  // Mark check-in
  markCheckIn: (data: { guard_id: number; duty_id: number; latitude?: string; longitude?: string; remarks?: string }) =>
    handleApiResponse(
      api.post<ApiResponse<{item: DutyAttendance}>>("/admin/duty-attendances/check-in", data)
    ),

  // Mark check-out
  markCheckOut: (id: number, data: { remarks?: string }) =>
    handleApiResponse(
      api.post<ApiResponse<{item: DutyAttendance}>>(`/admin/duty-attendances/${id}/check-out`, data)
    ),
};