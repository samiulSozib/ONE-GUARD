
export interface ShiftFilters {
  from?: string;
  to?: string;
  client_id?: string;
  site_id?: string;
  site_location_id?: string;
  guard_id?: string;
  duty_schedule_id?: string;
  duty_id?: string;
  service_mode?: string;
  assignment_status?: string;
  operational_status?: string;
  attendance?: string;
  check_in_timing?: string;
  check_out_timing?: string;
  checkout_source?: string;
  patrol_status?: string;
  coverage_status?: string;
  has_incidents?: string;
  has_reports?: string;
  is_replaced?: string;
  has_early_checkout_request?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ShiftGuard {
  id: number;
  name: string | null;
  code: string | null;
  is_missing: boolean;
}

export interface ShiftDuty {
  id: number;
  title: string | null;
  duty_schedule_id: number | null;
  service_mode: string;
  start_datetime: string | null;
  end_datetime: string | null;
  status: string;
  site_id: number;
  site_name: string | null;
  client_id: number | null;
  site_location_id: number | null;
  site_location_name: string | null;
  site_timezone: string | null;
}

export interface ShiftRow {
  row_type: "assignment" | "unfilled_slots";
  duty_id: number;
  assignment_id: number | null;
  guard: ShiftGuard | null;
  duty: ShiftDuty;
  assignment_status?: string;
  is_replaced?: boolean;
  operational_status: string;
  attendance_status?: string;
  attended?: boolean;
  check_in_time?: string | null;
  check_out_time?: string | null;
  check_in_timing?: {
    classification: string;
    difference_minutes: number;
  } | null;
  check_out_timing?: {
    classification: string;
    difference_minutes: number;
  } | null;
  checkout_source?: string | null;
  early_checkout_request?: {
    id: number;
    status: string;
    reason_text?: string | null;
  } | null;
  patrol?: {
    required: number;
    recorded: number;
    completed: number;
    missed: number;
    status: string;
  };
  incidents?: {
    guard_count?: number;
    duty_count: number;
  };
  shift_reports?: {
    guard_count?: number;
    duty_count: number;
  };
  coverage: {
    required: number;
    assigned: number;
    attended: number;
    status: string;
  };
  unfilled_count?: number;
  last_action?: string | null;
  last_action_at?: string | null;
}

export type ShiftSummary = Record<string, number>;

export interface ShiftListBody {
  items: ShiftRow[];
  summary: ShiftSummary;
  pagination: {
    unit: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: ShiftFilters;
  generated_at: string;
  notes?: string[];
}

export interface ShiftDetails {
  item: ShiftRow;
  assignments: Array<{
    assignment_id: number;
    guard_id: number;
    guard_name: string | null;
    status: string;
  }>;
  attendance: Record<string, unknown> | null;
  shift_logs: Array<{
    id: number;
    action: string;
    action_time: string;
    is_auto: boolean;
    remarks?: string | null;
  }>;
  patrol_visits: Array<Record<string, unknown>>;
  incidents: Array<Record<string, unknown>>;
  shift_reports: Array<Record<string, unknown>>;
  early_checkout_requests: Array<Record<string, unknown>>;
}

export interface ApiEnvelope<T> {
  status: string;
  success: boolean;
  body: T;
}
