// import { ApiResponse } from "@/app/types/api.types";
// import api, { handleApiResponse } from "./api.service";
// import { GuardAssignment, GuardAssignmentParams } from "@/app/types/guardAssignment";
// import { CreateGuardAssignmentDto } from "@/app/types/guardAssignment";

// export const guardAssignmentService = {
//   // Get all assignments
//   getAssignments: (params?: GuardAssignmentParams) =>
//     handleApiResponse(
//       api.get<ApiResponse<{
//         items: GuardAssignment[];
//         data: {
//           current_page: number;
//           last_page: number;
//           total: number;
//           per_page: number;
//         };
//       }>>("/admin/guard-assignments", { params })
//     ),

//   // Get single assignment
//   getAssignment: (id: number, params?: { include?: string[] }) =>
//     handleApiResponse(
//       api.get<ApiResponse<{item:GuardAssignment}>>(`/admin/guard-assignments/${id}/show`, { params })
//     ),

//   // Create assignment
//   createAssignment: (
//     data: FormData | CreateGuardAssignmentDto
//   ) =>
//     handleApiResponse(
//       api.post<ApiResponse<{item:GuardAssignment}>>("/admin/guard-assignments", data, {
//         headers:
//           data instanceof FormData
//             ? { "Content-Type": "multipart/form-data" }
//             : undefined,
//       })
//     ),

//   // Update assignment
//   updateAssignment: (id: number, data: FormData | CreateGuardAssignmentDto) =>
//     handleApiResponse(
//       api.put<ApiResponse<{item:GuardAssignment}>>(`/admin/guard-assignments/${id}`, data, {
//         headers:
//           data instanceof FormData
//             ? { "Content-Type": "multipart/form-data" }
//             : undefined,
//       })
//     ),

//   // Delete assignment
//   deleteAssignment: (id: number) =>
//     handleApiResponse(
//       api.delete<ApiResponse<void>>(`/admin/guard-assignments/${id}`)
//     ),

//   // Update assignment status
//   updateStatusStatus: (id: number, status: string) =>
//     handleApiResponse(
//       api.get<ApiResponse<{item:GuardAssignment}>>(
//         `/admin/guard-assignments/${id}/change-status?status=${status}`,

//       )
//     ),
// };


// service/guardAssignment.service.ts

// service/guardAssignment.service.ts

// service/guardAssignment.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  GuardAssignment,
  GuardAssignmentParams,
  CreateGuardAssignmentDto,
  UpdateGuardAssignmentDto,
  BulkScheduleDto,
  BulkScheduleResponse,
  ReplaceGuardDto,
  CancelAssignmentDto,
  GuardAssignmentStatus,
} from "@/app/types/guardAssignment";

// Define the replacement response type
export interface ReplaceGuardResponse {
  message: string;
  summary: {
    scope: string;
    old_guard_id: number;
    replacement_guard_id: number;
    assignments_checked: number;
    assignments_replaced: number;
    assignments_skipped: number;
  };
  replaced: Array<{
    duty_id: number;
    old_assignment_id: number;
    old_guard_id: number;
    old_status: string;
    new_assignment_id: number;
    replacement_guard_id: number;
    new_status: string;
    start_datetime: string;
    end_datetime: string;
  }>;
  skipped: Array<{
    duty_id: number;
    old_assignment_id: number;
    reason: string;
    message: string;
  }>;
}

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
      api.get<ApiResponse<{ item: GuardAssignment }>>(
        `/admin/guard-assignments/${id}/show`,
        { params }
      )
    ),

  // Create assignment
  createAssignment: (data: CreateGuardAssignmentDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: GuardAssignment }>>(
        "/admin/guard-assignments",
        data
      )
    ),

  // Update assignment
  updateAssignment: (id: number, data: UpdateGuardAssignmentDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: GuardAssignment }>>(
        `/admin/guard-assignments/${id}`,
        data
      )
    ),

  // Delete assignment (soft delete)
  deleteAssignment: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/guard-assignments/${id}`)
    ),

  // Update assignment status
  updateAssignmentStatus: (id: number, status: GuardAssignmentStatus) =>
    handleApiResponse(
      api.patch<ApiResponse<{ item: GuardAssignment }>>(
        `/admin/guard-assignments/${id}/change-status`,
        { status }
      )
    ),

  // Bulk schedule
  bulkSchedule: (data: BulkScheduleDto) =>
    handleApiResponse(
      api.post<ApiResponse<BulkScheduleResponse>>(
        "/admin/guard-assignments/bulk-schedule",
        data
      )
    ),

  // Replace guard - FIXED: Use the correct response type
  replaceGuard: (data: ReplaceGuardDto) =>
    handleApiResponse(
      api.post<ApiResponse<ReplaceGuardResponse>>(
        "/admin/guard-assignments/replace",
        data
      )
    ),

  // Cancel assignment
  cancelAssignment: (data: CancelAssignmentDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: GuardAssignment }>>(
        "/admin/guard-assignments/cancel",
        data
      )
    ),
};
