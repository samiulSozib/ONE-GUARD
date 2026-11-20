import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { Duty, DutyParams } from "@/app/types/duty";

export const dutyService = {
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

  getDuty: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: Duty }>>(`/admin/duties/${id}/show`, { params })
    ),

  createDuty: (data: FormData | Partial<Duty>) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Duty }>>("/admin/duties", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  updateDuty: (id: number, data: FormData | Partial<Duty>) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Duty }>>(`/admin/duties/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  deleteDuty: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/duties/${id}`)),

  /**
   * Duty workflow lifecycle: pending | approved | completed
   * (stored on duties.status — use PUT, not change-status)
   */
  updateWorkflowStatus: (id: number, status: string) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Duty }>>(`/admin/duties/${id}`, { status })
    ),

  /**
   * Enable / disable duty occurrence (duties.is_active)
   */
  setActive: (id: number, is_active: boolean) =>
    handleApiResponse(
      api.get<ApiResponse<{ message: string }>>(
        `/admin/duties/${id}/change-status`,
        { params: { is_active: is_active ? 1 : 0 } }
      )
    ),

  /** @deprecated Use updateWorkflowStatus or setActive */
  toggleStatus: (id: number, status: string) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Duty }>>(`/admin/duties/${id}`, { status })
    ),
};
