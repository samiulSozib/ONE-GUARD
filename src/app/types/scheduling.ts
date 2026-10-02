// // app/types/scheduling.ts

// // ============================================
// // SCHEDULING SETTINGS
// // ============================================

// export type GenerationMode = 'immediate' | 'rolling' | 'manual';

// export interface SchedulingSettings {
//   id?: number;
//   duty_generation_mode: GenerationMode;
//   duty_generation_horizon_days: number;
//   assignment_generation_mode: GenerationMode;
//   assignment_generation_horizon_days: number;
//   generate_duties_on_schedule_create: boolean;
//   generate_assignments_on_plan_create: boolean;
//   allow_manual_duty_generation: boolean;
//   allow_manual_assignment_generation: boolean;
//   prevent_duty_duplicates: boolean;
//   prevent_assignment_duplicates: boolean;
//   open_ended_duty_horizon_days: number;
//   open_ended_assignment_horizon_days: number;
//   is_active: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface UpdateSchedulingSettingsDto {
//   duty_generation_mode?: GenerationMode;
//   duty_generation_horizon_days?: number;
//   assignment_generation_mode?: GenerationMode;
//   assignment_generation_horizon_days?: number;
//   generate_duties_on_schedule_create?: boolean;
//   generate_assignments_on_plan_create?: boolean;
//   allow_manual_duty_generation?: boolean;
//   allow_manual_assignment_generation?: boolean;
//   prevent_duty_duplicates?: boolean;
//   prevent_assignment_duplicates?: boolean;
//   open_ended_duty_horizon_days?: number;
//   open_ended_assignment_horizon_days?: number;
//   is_active?: boolean;
// }

// // ============================================
// // GUARD ASSIGNMENT PLANS
// // ============================================

// export type AssignmentPlanStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// export interface GuardAssignmentPlan {
//   id: number;
//   duty_schedule_id: number;
//   guard_id: number;
//   start_date: string;
//   end_date: string | null;
//   is_open_ended: boolean;
//   generated_until: string | null;
//   status: AssignmentPlanStatus;
//   is_active: boolean;
//   notes: string | null;
//   metadata: Record<string, any> | null;
//   created_at: string;
//   updated_at: string;
//   created_by?: number;
//   updated_by?: number;
//   // Relationships
//   duty_schedule?: {
//     id: number;
//     title: string;
//     description?: string;
//     is_active?: boolean;
//     service_mode?: string;
//     schedule_type?: string;
//     start_date?: string;
//     end_date?: string;
//     start_time?: string;
//     end_time?: string;
//     // ... other fields
//   };
//   guard?: {
//     id: number;
//     full_name: string;
//     guard_code: string;
//     email?: string;
//     phone?: string;
//     profile_image?: string;
//     // ... other fields
//   };
//   creator?: {
//     id: number;
//     first_name: string;
//     last_name: string;
//     email: string;
//     role: string;
//   };
//   updater?: {
//     id: number;
//     first_name: string;
//     last_name: string;
//     email: string;
//     role: string;
//   };
// }

// export interface AssignmentPlanParams {
//   page?: number;
//   per_page?: number;
//   duty_schedule_id?: number;
//   guard_id?: number;
//   status?: AssignmentPlanStatus;
//   is_active?: boolean;
//   search?: string;
//   sort_by?: string;
//   sort_order?: 'asc' | 'desc';
// }

// export interface CreateAssignmentPlanDto {
//   duty_schedule_id: number;
//   guard_id: number;
//   start_date: string;
//   end_date?: string | null;
//   is_open_ended?: boolean;
//   status?: AssignmentPlanStatus;
//   is_active?: boolean;
//   notes?: string | null;
//   metadata?: Record<string, any> | null;
// }

// export interface UpdateAssignmentPlanDto {
//   duty_schedule_id?: number;
//   guard_id?: number;
//   start_date?: string;
//   end_date?: string | null;
//   is_open_ended?: boolean;
//   status?: AssignmentPlanStatus;
//   is_active?: boolean;
//   notes?: string | null;
//   metadata?: Record<string, any> | null;
// }

// export interface ToggleAssignmentPlanStatusDto {
//   is_active: boolean;
// }

// export interface AssignmentGenerationInfo {
//   plan_id: number;
//   duties_checked: number;
//   assignments_created: number;
//   assignments_skipped: number;
//   skipped_reasons?: Record<string, string[]>;
// }

// export interface AssignmentPlanState {
//   plans: GuardAssignmentPlan[];
//   currentPlan: GuardAssignmentPlan | null;
//   pagination: {
//     current_page: number;
//     last_page: number;
//     total: number;
//     per_page: number;
//   };
//   isLoading: boolean;
//   error: string | null;
//   generationInfo: AssignmentGenerationInfo | null;
// }

// export interface SchedulingSettingsState {
//   settings: SchedulingSettings | null;
//   isLoading: boolean;
//   error: string | null;
// }



// ============================================
// SCHEDULING SETTINGS
// ============================================

export type GenerationMode = "immediate" | "rolling" | "manual";

export interface SchedulingSettings {
  id?: number;

  duty_generation_mode: GenerationMode;
  duty_generation_horizon_days: number;

  assignment_generation_mode: GenerationMode;
  assignment_generation_horizon_days: number;

  generate_duties_on_schedule_create: boolean;
  generate_assignments_on_plan_create: boolean;

  allow_manual_duty_generation: boolean;
  allow_manual_assignment_generation: boolean;

  prevent_duty_duplicates: boolean;
  prevent_assignment_duplicates: boolean;

  open_ended_duty_horizon_days: number;
  open_ended_assignment_horizon_days: number;

  is_active: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface UpdateSchedulingSettingsDto {
  duty_generation_mode?: GenerationMode;
  duty_generation_horizon_days?: number;

  assignment_generation_mode?: GenerationMode;
  assignment_generation_horizon_days?: number;

  generate_duties_on_schedule_create?: boolean;
  generate_assignments_on_plan_create?: boolean;

  allow_manual_duty_generation?: boolean;
  allow_manual_assignment_generation?: boolean;

  prevent_duty_duplicates?: boolean;
  prevent_assignment_duplicates?: boolean;

  open_ended_duty_horizon_days?: number;
  open_ended_assignment_horizon_days?: number;

  is_active?: boolean;
}

// ============================================
// GUARD ASSIGNMENT PLANS
// ============================================

export type AssignmentPlanStatus =
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

/**
 * ISO-8601 weekday numbers:
 *
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 * 7 = Sunday
 */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ============================================
// COMMON RELATIONSHIP TYPES
// ============================================

export interface AssignmentPlanGuardDetails {
  id: number;
  full_name: string;
  guard_code?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
}

export interface AssignmentPlanDutySchedule {
  id: number;
  title: string;

  description?: string;
  is_active?: boolean;

  service_mode?: string;
  schedule_type?: string;

  start_date?: string;
  end_date?: string | null;

  start_time?: string;
  end_time?: string;

  guards_required?: number;
}

export interface AssignmentPlanUser {
  id: number;

  first_name: string;
  last_name: string;

  email: string;
  role: string;
}

// ============================================
// PLAN GUARD
// ============================================

/**
 * Used when sending guard coverage to the backend.
 *
 * Example:
 *
 * {
 *   guard_id: 41,
 *   weekdays: [1, 3, 5]
 * }
 */
export interface AssignmentPlanGuardInput {
  guard_id: number;

  weekdays: IsoWeekday[];
}

/**
 * Guard coverage row returned by:
 *
 * guard_assignment_plan_guards
 */
export interface AssignmentPlanGuard {
  id: number;

  guard_assignment_plan_id: number;

  guard_id: number;

  /**
   * ISO weekday numbers.
   *
   * Example:
   * [1, 3, 5]
   *
   * Monday, Wednesday, Friday
   */
  weekdays: IsoWeekday[];

  /**
   * Effective date range of this particular guard rule.
   *
   * These can become different from the parent plan dates
   * later when we implement "this and future" replacement.
   */
  start_date: string;

  end_date: string | null;

  is_active: boolean;

  notes: string | null;

  metadata: Record<string, any> | null;

  created_by?: number | null;
  updated_by?: number | null;

  created_at?: string;
  updated_at?: string;

  /**
   * Loaded Guard relationship.
   */
  guard?: AssignmentPlanGuardDetails;
}

// ============================================
// ASSIGNMENT PLAN
// ============================================

export interface GuardAssignmentPlan {
  id: number;

  duty_schedule_id: number;

  /**
   * Legacy compatibility only.
   *
   * New assignment plans should use `guards`.
   *
   * The backend parent guard_id is now nullable because
   * one plan can contain multiple guards.
   */
  guard_id?: number | null;

  /**
   * The backend resource may expose the old parent guard
   * under this field during the transition period.
   */
  legacy_guard_id?: number | null;

  start_date: string;

  end_date: string | null;

  is_open_ended: boolean;

  generated_until: string | null;

  status: AssignmentPlanStatus;

  is_active: boolean;

  notes: string | null;

  metadata: Record<string, any> | null;

  created_at: string;
  updated_at: string;

  created_by?: number | null;
  updated_by?: number | null;

  // ==========================================
  // RELATIONSHIPS
  // ==========================================

  duty_schedule?: AssignmentPlanDutySchedule;

  /**
   * NEW:
   *
   * One assignment plan can contain multiple
   * guard/day coverage rules.
   *
   * Example:
   *
   * Guard 41 -> Mon / Wed / Fri
   * Guard 40 -> Tue / Thu
   * Guard 39 -> Sat / Sun
   */
  guards?: AssignmentPlanGuard[];

  /**
   * Legacy single-guard relationship.
   *
   * Keep temporarily so old API responses/components
   * do not immediately break during migration.
   */
  guard?: AssignmentPlanGuardDetails;

  creator?: AssignmentPlanUser;

  updater?: AssignmentPlanUser;
}

// ============================================
// ASSIGNMENT PLAN LIST PARAMS
// ============================================

export interface AssignmentPlanParams {
  page?: number;

  per_page?: number;

  duty_schedule_id?: number;

  /**
   * Backend can filter through planGuards.
   */
  guard_id?: number;

  status?: AssignmentPlanStatus;

  is_active?: boolean;

  search?: string;

  sort_by?: string;

  sort_order?: "asc" | "desc";
}

// ============================================
// CREATE ASSIGNMENT PLAN
// ============================================

export interface CreateAssignmentPlanDto {
  duty_schedule_id: number;

  start_date: string;

  end_date?: string | null;

  is_open_ended?: boolean;

  status?: AssignmentPlanStatus;

  is_active?: boolean;

  notes?: string | null;

  metadata?: Record<string, any> | null;

  /**
   * NEW SOURCE OF TRUTH
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
   *   },
   *   {
   *     guard_id: 39,
   *     weekdays: [6, 7]
   *   }
   * ]
   */
  guards: AssignmentPlanGuardInput[];

  /**
   * OLD FRONTEND COMPATIBILITY
   *
   * The backend currently supports:
   *
   * guard_id: 41
   *
   * and converts it internally to:
   *
   * guards: [
   *   {
   *     guard_id: 41,
   *     weekdays: [1,2,3,4,5,6,7]
   *   }
   * ]
   *
   * The new frontend should NOT need to send this.
   */
  guard_id?: number;
}

// ============================================
// UPDATE ASSIGNMENT PLAN
// ============================================

export interface UpdateAssignmentPlanDto {
  duty_schedule_id?: number;

  start_date?: string;

  end_date?: string | null;

  is_open_ended?: boolean;

  status?: AssignmentPlanStatus;

  is_active?: boolean;

  notes?: string | null;

  metadata?: Record<string, any> | null;

  /**
   * When supplied, this represents the new guard/day
   * configuration for the plan.
   */
  guards?: AssignmentPlanGuardInput[];

  /**
   * Legacy frontend compatibility.
   */
  guard_id?: number;
}

// ============================================
// TOGGLE ASSIGNMENT PLAN
// ============================================

export interface ToggleAssignmentPlanStatusDto {
  is_active: boolean;
}

// ============================================
// ASSIGNMENT GENERATION
// ============================================

export interface AssignmentGenerationInfo {
  plan_id: number;

  duties_checked: number;

  assignments_created: number;

  assignments_skipped: number;

  /**
   * Number of child guard coverage rules checked by
   * the new multi-guard generator.
   */
  guard_rules_checked?: number;

  skipped_reasons?: Record<string, string[]>;
}

// ============================================
// REDUX STATES
// ============================================

export interface AssignmentPlanState {
  plans: GuardAssignmentPlan[];

  currentPlan: GuardAssignmentPlan | null;

  pagination: {
    current_page: number;

    last_page: number;

    total: number;

    per_page: number;
  };

  isLoading: boolean;

  error: string | null;

  generationInfo: AssignmentGenerationInfo | null;
}

export interface SchedulingSettingsState {
  settings: SchedulingSettings | null;

  isLoading: boolean;

  error: string | null;
}