// app/types/duty.ts

import { DutySchedule } from '@/app/types/duty-schedule';
import { Site } from "./site";

export interface Duty {
  id: number;
  title: string;
  duty_date: string | null;
  start_datetime: string;
  end_datetime: string;
  duty_schedule_id: number | null;
  client_contract_service_id: number | null;
  is_schedule_exception: boolean;
  source_type: 'scheduled' | 'one_time' | 'manual' | 'exception';
  site_id: number;
  site_location_id: number | null;
  duty_time_type_id: number | null;
  duty_type: string | null;
  service_mode: 'continuous_shift' | 'patrol_visits';
  required_visits: number | null;
  required_hours: number;
  guard_pay_basis: 'per_shift' | 'per_hour' | 'per_visit' | null;
  guard_pay_rate: number | null;
  mandatory_check_in_time: string | null;
  guards_required: number;
  assigned_guards_count: number | null;
  remaining_guards_count: number | null;
  coverage_status: 'unassigned' | 'partial' | 'covered' | 'not_required' | string;
  status: 'pending' | 'approved' | 'completed' | string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;

  /** Nested roster from GET /admin/duties */
  assignments?: DutyAssignmentSummary[];

  // Relationships
  site?: {
    id: number;
    client_id: number;
    site_name: string;
    site_instruction?: string;
    address?: string;
    guards_required?: number;
    latitude?: string | number;
    longitude?: string | number;
    timezone?: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  site_location?: {
    id: number;
    site_id: number;
    title: string;
    description?: string | null;
    latitude?: string;
    longitude?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  duty_schedule?: DutySchedule;
  client_contract_service?: any | null;
  duty_time_type?: any | null;
}

export interface DutyAssignmentGuard {
  id: number;
  guard_code?: string | null;
  full_name: string;
  phone?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface DutyAssignmentSummary {
  id: number;
  guard_id: number;
  duty_id: number;
  status: string;
  /** Derived: upcoming | on_duty | late | past | completed | cancelled | replaced */
  operational_status?: string;
  guard?: DutyAssignmentGuard | null;
}

export interface DutyParams {
  page?: number;
  per_page?: number;
  search?: string;
  guard_id?: number;
  site_id?: number;
  site_location_id?: number;
  duty_time_type_id?: number;
  duty_schedule_id?: number;
  source_type?: 'scheduled' | 'one_time' | 'manual' | 'exception';
  service_mode?: 'continuous_shift' | 'patrol_visits';
  duty_type?: 'day' | 'night' | string;
  status?: 'pending' | 'approved' | 'completed' | string;
  assignment_status?: string;
  /** Live roster: unassigned | on_duty | late | upcoming | past */
  live_status?: string;
  coverage_status?: 'unassigned' | 'partial' | 'covered' | 'not_required' | string;
  timing?: 'current' | 'upcoming' | 'past' | string;
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  include_site?: boolean | number;
  include_site_location?: boolean | number;
  include_duty_time_type?: boolean | number;
  include_duty_schedule?: boolean | number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DutyState {
  duties: Duty[];
  currentDuty: Duty | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ToggleDutyStatusRequest {
  is_active: boolean;
}

// Coverage status helper
export const getCoverageStatusDisplay = (status: string): string => {
  const map: Record<string, string> = {
    'unassigned': 'Unassigned',
    'partial': 'Partial',
    'covered': 'Covered',
    'not_required': 'Not Required',
  };
  return map[status] || status;
};

export const getCoverageStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'unassigned': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'covered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'not_required': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusDisplay = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'completed': 'Completed',
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

// Service mode helpers
export const getServiceModeDisplay = (mode: string): string => {
  const map: Record<string, string> = {
    'continuous_shift': 'Continuous Shift',
    'patrol_visits': 'Patrol Visits',
  };
  return map[mode] || mode;
};

export const getServiceModeColor = (mode: string): string => {
  const map: Record<string, string> = {
    'continuous_shift': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    'patrol_visits': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  };
  return map[mode] || 'bg-gray-100 text-gray-700';
};

/**
 * Live attendance labels for Shift List (from check-in / check-out truth).
 * Not the same as assignment DB status (active/completed/…).
 */
export const getAssignmentOperationalDisplay = (status: string): string => {
  const map: Record<string, string> = {
    unassigned: 'Unassigned',
    upcoming: 'Upcoming',
    not_checked_in_after_start: 'No check-in',
    not_checked_in: 'No check-in',
    on_duty: 'On duty',
    missing_check_out: 'Missing check-out',
    no_show: 'No show',
    late: 'No show',
    checked_out: 'Checked out',
    past: 'Past',
    active: 'Rostered',
    assigned: 'Rostered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    replaced: 'Replaced',
  };
  return map[status] || status;
};

export const getAssignmentOperationalColor = (status: string): string => {
  const map: Record<string, string> = {
    unassigned: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    upcoming: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
    not_checked_in_after_start: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    not_checked_in: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    on_duty: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    missing_check_out: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
    no_show: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    late: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    checked_out: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    past: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300',
    active: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400',
    replaced: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/** Most urgent attendance status across assignees (or unassigned). */
export const getDutyRosterStatus = (
  duty: Pick<Duty, 'assignments' | 'guards_required' | 'assigned_guards_count'>
): string => {
  const assignments = duty.assignments || [];
  if (!assignments.length) return 'unassigned';

  const priority = [
    'no_show',
    'late',
    'missing_check_out',
    'not_checked_in_after_start',
    'not_checked_in',
    'on_duty',
    'upcoming',
    'checked_out',
    'active',
    'assigned',
    'past',
    'completed',
    'cancelled',
    'replaced',
  ];
  let best = assignments[0]?.operational_status || assignments[0]?.status || 'active';
  let bestIdx = priority.indexOf(best);
  if (bestIdx < 0) bestIdx = priority.length;

  for (const a of assignments) {
    const s = a.operational_status || a.status || 'active';
    const idx = priority.indexOf(s);
    if (idx >= 0 && idx < bestIdx) {
      best = s;
      bestIdx = idx;
    }
  }
  return best;
};
