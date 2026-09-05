// service/scheduling.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
  SchedulingSettings,
  UpdateSchedulingSettingsDto,
  GuardAssignmentPlan,
  AssignmentPlanParams,
  CreateAssignmentPlanDto,
  UpdateAssignmentPlanDto,
  ToggleAssignmentPlanStatusDto,
  AssignmentGenerationInfo,
} from "@/app/types/scheduling";

// ============================================
// SCHEDULING SETTINGS SERVICE
// ============================================

export const schedulingSettingsService = {
  // Get current scheduling settings
  getSettings: () =>
    handleApiResponse(
      api.get<ApiResponse<{ item: SchedulingSettings }>>(
        "/admin/schedualing-settings"
      )
    ),

  // Update scheduling settings
  updateSettings: (data: UpdateSchedulingSettingsDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: SchedulingSettings }>>(
        "/admin/schedualing-settings",
        data
      )
    ),
};

// ============================================
// GUARD ASSIGNMENT PLANS SERVICE
// ============================================

export const assignmentPlanService = {
  // Get all assignment plans
  getPlans: (params?: AssignmentPlanParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: GuardAssignmentPlan[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/guard-assignment-plans", { params })
    ),

  // Get single assignment plan
  getPlan: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: GuardAssignmentPlan }>>(
        `/admin/guard-assignment-plans/${id}`
      )
    ),

  // Create assignment plan
  createPlan: (data: CreateAssignmentPlanDto) =>
    handleApiResponse(
      api.post<ApiResponse<{
        item: GuardAssignmentPlan;
        generation?: AssignmentGenerationInfo;
      }>>(
        "/admin/guard-assignment-plans",
        data
      )
    ),

  // Update assignment plan
  updatePlan: (id: number, data: UpdateAssignmentPlanDto) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: GuardAssignmentPlan }>>(
        `/admin/guard-assignment-plans/${id}`,
        data
      )
    ),

  // Toggle assignment plan status (enable/disable)
  togglePlanStatus: (id: number, data: ToggleAssignmentPlanStatusDto) =>
    handleApiResponse(
      api.patch<ApiResponse<{ item: GuardAssignmentPlan }>>(
        `/admin/guard-assignment-plans/${id}/toggle-status`,
        data
      )
    ),

  // Delete assignment plan
  deletePlan: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(
        `/admin/guard-assignment-plans/${id}`
      )
    ),
};
