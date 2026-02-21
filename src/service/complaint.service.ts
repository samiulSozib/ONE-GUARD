import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { Complaint, ComplaintParams, CreateComplaintDto } from "@/app/types/complaint";

/* =========================================================
   Complaint Service
   ========================================================= */

export const complaintService = {
  /* ---------- Get all complaints ---------- */
  getComplaints: (params?: ComplaintParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Complaint[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/complaints", { params })
    ),

  /* ---------- Get single complaint ---------- */
  getComplaint: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: Complaint }>>(
        `/admin/complaints/${id}/show`,
        { params }
      )
    ),

  /* ---------- Create complaint ---------- */
  createComplaint: (
    data: FormData | CreateComplaintDto
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Complaint }>>(
        "/admin/complaints",
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : undefined,
        }
      )
    ),

  /* ---------- Update complaint ---------- */
  updateComplaint: (
    id: number,
    data: FormData | CreateComplaintDto
  ) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Complaint }>>(
        `/admin/complaints/${id}`,
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : undefined,
        }
      )
    ),

  /* ---------- Delete complaint ---------- */
  deleteComplaint: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(
        `/admin/complaints/${id}`
      )
    ),

  /* ---------- Toggle visibility / status ---------- */
  toggleVisibility: (
    id: number,
    payload: {
      is_visible_to_client?: boolean;
      is_visible_to_guard?: boolean;
    }
  ) =>
    handleApiResponse(
      api.get<ApiResponse<Complaint>>(
        `/admin/complaints/${id}/change-visibility`,
        
      )
    ),
};
