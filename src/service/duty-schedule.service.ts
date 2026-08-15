// service/duty-schedule.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  DutySchedule,
  DutyScheduleParams,
  CreateDutyScheduleDto,
  UpdateDutyScheduleDto,
} from "@/app/types/duty-schedule";

export const dutyScheduleService = {
  // Get all duty schedules
  getDutySchedules: (params?: DutyScheduleParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: DutySchedule[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>('/admin/duty-schedules', { params })
    ),

  // Get single duty schedule
  getDutySchedule: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: DutySchedule }>>(
        `/admin/duty-schedules/${id}`
      )
    ),

  // Create duty schedule
  createDutySchedule: (data: CreateDutyScheduleDto) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: DutySchedule; message: string }>>(
        '/admin/duty-schedules',
        data
      )
    ),

  // Update duty schedule
  updateDutySchedule: (id: number, data: UpdateDutyScheduleDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: DutySchedule; message: string }>>(
        `/admin/duty-schedules/${id}`,
        data
      )
    ),

  // Toggle duty schedule status
  toggleStatus: (id: number, isActive: boolean) =>
    handleApiResponse(
      api.patch<ApiResponse<{ item: DutySchedule; message: string }>>(
        `/admin/duty-schedules/${id}/change-status`,
        { is_active: isActive }
      )
    ),

  // Delete duty schedule
  deleteDutySchedule: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<{ message: string }>>(
        `/admin/duty-schedules/${id}`
      )
    ),
};
