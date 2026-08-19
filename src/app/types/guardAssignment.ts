// app/types/guardAssignment.ts

import { Duty } from "./duty";
import { Guard } from "./guard";

// Status type definition
export type GuardAssignmentStatus =
  | 'assigned'
  | 'accepted'
  | 'checked_in'
  | 'on_duty'
  | 'completed'
  | 'late'
  | 'no_show'
  | 'cancelled'
  | 'replaced';

export interface GuardAssignment {
  id: number;
  guard_id: number;
  duty_id: number;
  start_date: string;
  end_date: string;
  status: GuardAssignmentStatus;
  guard?: {
    id: number;
    user_id: number;
    guard_code: string;
    full_name: string;
    phone: string;
    email: string;
    profile_image: string | null;
    profile_image_url: string | null;
    status: string | null;
    user_is_active: boolean | null;
  };
  duty?: Duty;
  created_at?: string;
  updated_at?: string;
}

export interface GuardAssignmentParams {
  page?: number;
  per_page?: number;
  search?: string;
  guard_id?: number;
  duty_id?: number;
  status?: GuardAssignmentStatus | string;
  include_guard?: boolean;
  include_duty?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  start_date?: string;
  end_date?: string;
  duty_schedule_id?: number;
  site_id?: number;
  site_location_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface GuardAssignmentState {
  assignments: GuardAssignment[];
  currentAssignment: GuardAssignment | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

// Single assignment - only guard_id and duty_id are needed
export interface CreateGuardAssignmentDto {
  guard_id: number;
  duty_id: number;
}

// Update assignment
export interface UpdateGuardAssignmentDto {
  guard_id: number;
  duty_id: number;
}

// Bulk Schedule DTO
export interface BulkScheduleDto {
  duty_schedule_id: number;
  guard_ids: number[];
  date_from?: string;
  date_to?: string;
}

export interface BulkScheduleResponse {
  summary: {
    duty_schedule_id: number;
    duties_checked: number;
    guards_requested: number;
    assignment_attempts: number;
    assignments_created: number;
    assignments_skipped: number;
  };
  skipped: Array<{
    duty_id: number;
    guard_id: number;
    reason: string;
    message: string;
  }>;
}

// Replace Guard DTO
export interface ReplaceGuardDto {
  assignment_id: number;
  replacement_guard_id: number;
  scope: 'this_duty' | 'this_and_future';
}

// Cancel Assignment DTO
export interface CancelAssignmentDto {
  assignment_id: number;
  scope: 'this_duty' | 'this_and_future';
}

// Change Status DTO
export interface ChangeAssignmentStatusDto {
  status: GuardAssignmentStatus;
}
