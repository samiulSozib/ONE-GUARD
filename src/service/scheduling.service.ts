import { ApiResponse } from "@/app/types/api.types";

import api, {
  handleApiResponse,
} from "./api.service";

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
  /**
   * Get current scheduling settings
   */
  getSettings: () =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          item: SchedulingSettings;
        }>
      >(
        "/admin/schedualing-settings"
      )
    ),

  /**
   * Update scheduling settings
   */
  updateSettings: (
    data: UpdateSchedulingSettingsDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          item: SchedulingSettings;
        }>
      >(
        "/admin/schedualing-settings",
        data
      )
    ),
};

// ============================================
// GUARD ASSIGNMENT PLANS SERVICE
// ============================================

export const assignmentPlanService = {
  /**
   * Get all assignment plans.
   *
   * Supports filters such as:
   *
   * page
   * per_page
   * duty_schedule_id
   * guard_id
   * status
   * is_active
   * search
   * sort_by
   * sort_order
   */
  getPlans: (
    params?: AssignmentPlanParams
  ) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          items: GuardAssignmentPlan[];

          data: {
            current_page: number;

            last_page: number;

            total: number;

            per_page: number;
          };
        }>
      >(
        "/admin/guard-assignment-plans",
        {
          params,
        }
      )
    ),

  /**
   * Get a single assignment plan.
   *
   * The returned item can now contain:
   *
   * guards: [
   *   {
   *     guard_id: 41,
   *     weekdays: [1, 3, 5],
   *     guard: {...}
   *   }
   * ]
   */
  getPlan: (
    id: number
  ) =>
    handleApiResponse(
      api.get<
        ApiResponse<{
          item: GuardAssignmentPlan;
        }>
      >(
        `/admin/guard-assignment-plans/${id}`
      )
    ),

  /**
   * Create assignment plan.
   *
   * NEW payload example:
   *
   * {
   *   duty_schedule_id: 1,
   *   start_date: "2026-10-02",
   *   end_date: "2026-10-31",
   *   is_open_ended: false,
   *   status: "active",
   *   is_active: true,
   *   guards: [
   *     {
   *       guard_id: 41,
   *       weekdays: [1, 3, 5]
   *     },
   *     {
   *       guard_id: 40,
   *       weekdays: [2, 4]
   *     },
   *     {
   *       guard_id: 39,
   *       weekdays: [6, 7]
   *     }
   *   ]
   * }
   */
  createPlan: (
    data: CreateAssignmentPlanDto
  ) =>
    handleApiResponse(
      api.post<
        ApiResponse<{
          item: GuardAssignmentPlan;

          generation?: AssignmentGenerationInfo;
        }>
      >(
        "/admin/guard-assignment-plans",
        data
      )
    ),

  /**
   * Update assignment plan.
   *
   * The same guards[] structure can be sent here.
   *
   * Example:
   *
   * guards: [
   *   {
   *     guard_id: 41,
   *     weekdays: [1, 3, 5]
   *   },
   *   {
   *     guard_id: 40,
   *     weekdays: [2, 4]
   *   }
   * ]
   */
  updatePlan: (
    id: number,
    data: UpdateAssignmentPlanDto
  ) =>
    handleApiResponse(
      api.put<
        ApiResponse<{
          item: GuardAssignmentPlan;
        }>
      >(
        `/admin/guard-assignment-plans/${id}`,
        data
      )
    ),

  /**
   * Enable / disable an assignment plan.
   */
  togglePlanStatus: (
    id: number,
    data: ToggleAssignmentPlanStatusDto
  ) =>
    handleApiResponse(
      api.patch<
        ApiResponse<{
          item: GuardAssignmentPlan;
        }>
      >(
        `/admin/guard-assignment-plans/${id}/toggle-status`,
        data
      )
    ),

  /**
   * Delete assignment plan.
   */
  deletePlan: (
    id: number
  ) =>
    handleApiResponse(
      api.delete<
        ApiResponse<void>
      >(
        `/admin/guard-assignment-plans/${id}`
      )
    ),
};