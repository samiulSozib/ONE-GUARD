import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { GuardAssignment, GuardAssignmentParams } from "@/app/types/guardsAssignment";
import { CreateGuardAssignmentDto } from "@/app/types/guardAssignment";

export const guardAssignmentService = {
  // Get all assignments
  getAssignments: (params?: GuardAssignmentParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: GuardAssignment[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/guard-assignments", { params })
    ),

  // Get single assignment
  getAssignment: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{item:GuardAssignment}>>(`/admin/guard-assignments/${id}/show`, { params })
    ),

  // Create assignment
  createAssignment: (
    data: FormData | CreateGuardAssignmentDto
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{item:GuardAssignment}>>("/admin/guard-assignments", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Update assignment
  updateAssignment: (id: number, data: FormData | CreateGuardAssignmentDto) =>
    handleApiResponse(
      api.put<ApiResponse<{item:GuardAssignment}>>(`/admin/guard-assignments/${id}`, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
    ),

  // Delete assignment
  deleteAssignment: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/guard-assignments/${id}`)
    ),

  // Update assignment status
  updateStatusStatus: (id: number, status: string) =>
    handleApiResponse(
      api.get<ApiResponse<{item:GuardAssignment}>>(
        `/admin/guard-assignments/${id}/change-status?status=${status}`,
        
      )
    ),
};
