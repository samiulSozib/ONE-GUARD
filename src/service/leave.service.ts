import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
  Leave, 
  LeaveParams, 
  CreateLeaveDto,
  UpdateLeaveDto 
} from "@/app/types/leave";

/* =========================================================
   Leave Service
   ========================================================= */

export const leaveService = {
  /* ---------- Get all leaves ---------- */
  getLeaves: (params?: LeaveParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Leave[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/leaves", { params })
    ),

  /* ---------- Get single leave ---------- */
  getLeave: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: Leave }>>(
        `/admin/leaves/${id}/show`,
        { params }
      )
    ),

  /* ---------- Create leave ---------- */
  createLeave: (data: CreateLeaveDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Leave }>>(
        "/admin/leaves",
        data
      )
    ),

  /* ---------- Update leave ---------- */
  updateLeave: (id: number, data: UpdateLeaveDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Leave }>>(
        `/admin/leaves/${id}`,
        data
      )
    ),

  /* ---------- Delete leave ---------- */
  deleteLeave: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(
        `/admin/leaves/${id}`
      )
    ),

  /* ---------- Toggle leave status (approve/reject) ---------- */
  updateLeaveStatus: (
    id: number,
    payload: {
      status: string;
      review_note?: string | null;
    }
  ) =>
    handleApiResponse(
      api.get<ApiResponse<Leave>>(
        `/admin/leaves/${id}/update-status?is_active=${payload.status?1:0}`
      )
    ),



  /* ---------- Get leaves by guard ---------- */
  getLeavesByGuard: (guardId: number, params?: LeaveParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Leave[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>(`/admin/guards/${guardId}/leaves`, { params })
    ),

  /* ---------- Get leaves by site ---------- */
  getLeavesBySite: (siteId: number, params?: LeaveParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Leave[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>(`/admin/sites/${siteId}/leaves`, { params })
    ),
};