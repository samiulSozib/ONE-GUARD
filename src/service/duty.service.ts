import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { Duty, DutyParams } from "@/app/types/duty";

export const dutyService = {
  // Get all duties
  getDuties: (params?: DutyParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Duty[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/duties", { params })
    ),

  // Get single duty
  getDuty: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item:Duty}>>(`/admin/duties/${id}/show`, { params })
    ),

  // Create duty
  createDuty: (
    data: FormData | Omit<Duty, "id" | "created_at" | "updated_at">
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{item:Duty}>>("/admin/duties", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Update duty
  updateDuty: (id: number, data: FormData | Partial<Duty>) =>
    handleApiResponse(
      api.put<ApiResponse<{item:Duty}>>(`/admin/duties/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Delete duty
  deleteDuty: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/duties/${id}`)
    ),

  // Toggle duty status
  toggleStatus: (id: number, status: string) =>
    handleApiResponse(
      api.get<ApiResponse<{message:string}>>(
        `/admin/duties/${id}/change-status?status=${status}`
        
      )
    ),
};
