
/**
 * One Guard Security
 * Shift Operations Management
 *
 * Shared API contracts and frontend types.
 */

export type ShiftServiceMode =
  | "continuous_shift"
  | "patrol_visits";

export type ShiftRowType =
  | "assignment"
  | "unfilled_slots";

export type ShiftTimingClassification =
  | "early"
  | "on_time"
  | "late";

export type ShiftExportFormat =
  | "csv"
  | "excel"
  | "pdf";

export type ShiftLookupField =
  | "client_id"
  | "site_id"
  | "site_location_id"
  | "guard_id"
  | "duty_schedule_id"
  | "duty_id";

/**
 * Empty string means "All" in the frontend.
 * Empty filter values are removed before API requests.
 */
export interface ShiftFilters {
  from?: string;
  to?: string;

  search?: string;

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
  has_early_checkout_request?: string;

  is_replaced?: string;
  include_replaced?: string;

  assignment_id?: string;

  page?: number;
  per_page?: number;
}

export interface ShiftGuard {
  id: number | null;
  name: string | null;
  code: string | null;
  is_missing?: boolean;
}

export interface ShiftDuty {
  id: number;
  title: string | null;

  duty_schedule_id: number | null;
  service_mode: ShiftServiceMode | string;

  start_datetime: string | null;
  end_datetime: string | null;

  status: string | null;

  site_id: number | null;
  site_name: string | null;

  client_id: number | null;

  site_location_id: number | null;
  site_location_name: string | null;

  site_timezone: string | null;
}

export interface ShiftTiming {
  classification: ShiftTimingClassification;
  difference_minutes: number;
}

export interface ShiftCoverage {
  required: number;
  assigned: number;
  attended: number;
  status: string;
}

export interface ShiftPatrol {
  required: number;
  recorded: number;
  completed: number;
  missed: number;
  status: string;
}

export interface ShiftRecordCount {
  guard_count?: number;
  duty_count: number;
}

export interface ShiftEarlyCheckoutRequest {
  id: number;
  status: string;
  reason_code?: string | null;
  reason_text?: string | null;
  minutes_early?: number | null;
}

export interface ShiftRow {
  row_type: ShiftRowType;

  duty_id: number;
  assignment_id: number | null;

  guard: ShiftGuard | null;
  duty: ShiftDuty;

  assignment_status?: string | null;
  operational_status: string;

  is_replaced?: boolean;
  attended?: boolean;

  check_in_time?: string | null;
  check_out_time?: string | null;

  check_in_timing?: ShiftTiming | null;
  check_out_timing?: ShiftTiming | null;

  checkout_source?: string | null;

  early_checkout_request?: ShiftEarlyCheckoutRequest | null;

  patrol?: ShiftPatrol | null;

  incidents?: ShiftRecordCount | null;
  shift_reports?: ShiftRecordCount | null;

  coverage: ShiftCoverage;

  unfilled_count?: number;

  last_action?: string | null;
  last_action_at?: string | null;
}

export interface ShiftPagination {
  unit?: string;

  current_page: number;
  last_page: number;
  per_page: number;

  total?: number;
  total_duties?: number;

  rows_on_page?: number;
  from?: number | null;
  to?: number | null;
}

/**
 * Statistics are supplied by the overview endpoint.
 * Unknown fields remain supported without inventing values.
 */
export interface ShiftSummary {
  [key: string]: number | undefined;

  assignment_rows?: number;
  attended_assignments?: number;

  on_duty?: number;
  on_break?: number;

  missing_check_out?: number;

  unfilled_positions?: number;
  unfilled_duties?: number;

  patrol_completed?: number;

  shifts_with_incidents?: number;
  shifts_with_reports?: number;

  replaced_assignments?: number;

  early_check_ins?: number;
  early_checkouts?: number;
}

export interface ShiftListBody {
  items: ShiftRow[];

  pagination: ShiftPagination;

  summary?: ShiftSummary;
  page_summary?: ShiftSummary;

  filters?: ShiftFilters;
  generated_at?: string;
  notes?: string[];
}

export interface ShiftOverviewBody {
  summary: ShiftSummary;

  filters?: ShiftFilters;
  generated_at?: string;

  [key: string]: unknown;
}

export interface ShiftAssignmentReference {
  assignment_id?: number;
  id?: number;

  guard_id?: number | null;
  guard_name?: string | null;

  status?: string;

  [key: string]: unknown;
}

export interface ShiftLogRecord {
  id: number;

  action?: string;
  action_time?: string | null;

  is_auto?: boolean;

  remarks?: string | null;

  [key: string]: unknown;
}

export type ShiftDetailRecord =
  Record<string, unknown>;

export interface ShiftDetails {
  item: ShiftRow;

  assignments?: ShiftAssignmentReference[];

  attendance?: ShiftDetailRecord | null;

  shift_logs?: ShiftLogRecord[];

  patrol_visits?: ShiftDetailRecord[];

  incidents?: ShiftDetailRecord[];

  shift_reports?: ShiftDetailRecord[];

  early_checkout_requests?: ShiftDetailRecord[];

  [key: string]: unknown;
}

export interface ShiftLookupOption {
  id: number;
  label: string;

  description?: string;

  client_id?: number | null;
  site_id?: number | null;
  site_location_id?: number | null;
}

export interface ShiftLookupPage {
  items: ShiftLookupOption[];

  current_page: number;
  last_page: number;
  total: number;
  has_more: boolean;
}

export interface ApiEnvelope<T> {
  status: string;
  success: boolean;

  body: T;

  message?: string;
}
