import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { Incident, IncidentParams, CreateIncidentDto } from "@/app/types/incident";

/* =========================================================
   Incident Service
   ========================================================= */

export const incidentService = {
  /* ---------- Get all incidents ---------- */
  getIncidents: (params?: IncidentParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Incident[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/incidents", { params })
    ),

  /* ---------- Get single incident ---------- */
  getIncident: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: Incident }>>(
        `/admin/incidents/${id}/show`
      )
    ),

  /* ---------- Create incident ---------- */
  createIncident: (data: FormData | CreateIncidentDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Incident }>>(
        "/admin/incidents",
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
        }
      )
    ),

  /* ---------- Update incident ---------- */
  updateIncident: (id: number, data: FormData | CreateIncidentDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Incident }>>(
        `/admin/incidents/${id}`,
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
        }
      )
    ),

  /* ---------- Delete incident ---------- */
  deleteIncident: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(`/admin/incidents/${id}`)
    ),

  /* ---------- Update incident status ---------- */
  updateIncidentStatus: (id: number, status: string) =>
    handleApiResponse(
      api.get<ApiResponse<Incident>>(
        `/admin/incidents/${id}/change-status?status=${status}`,
       
      )
    ),

  /* ---------- Toggle incident client visibility ---------- */
  toggleClientVisibility: (id: number, visible_to_client: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<Incident>>(
        `/admin/incidents/${id}/client-visibility`,
       
      )
    ),
};