export type GuardPayBasis = "per_shift" | "per_hour" | "per_visit";
export type ManualPayBasis = "fixed" | "per_hour" | "per_shift" | "per_day" | "adjustment";
export type TimesheetExportFormat = "csv" | "excel" | "pdf";
export type TimingClassification = "early" | "on_time" | "late";

export interface TimesheetFilters {
  period_start: string;
  period_end: string;
  guard_id?: number;
  site_id?: number;
  duty_id?: number;
  service_mode?: "continuous_shift" | "patrol_visits" | "";
  status?: string;
  page?: number;
  per_page?: number;
}

export interface TimesheetManualPay {
  id: number;
  guard_id: number;
  period_start: string;
  period_end: string;
  pay_basis: ManualPayBasis;
  manual_rate: number | null;
  manual_total_amount: number | null;
  currency: string | null;
  rate_source: string;
  notes: string | null;
}

export interface TimesheetTiming {
  classification: TimingClassification;
  difference_minutes: number;
}

export interface TimesheetGuardRow {
  guard_id: number;
  guard_code: string | null;
  guard_name: string | null;
  days_worked: number;
  shift_count: number;
  incomplete_shifts: number;
  total_working_minutes: number;
  total_working_hours: number;
  scheduled_hours?: number;
  hours_variance?: number;
  continuous_shifts: number;
  patrol_shifts: number;
  completed_visits: number;
  required_visits: number;
  visit_minutes?: number;
  visit_hours?: number;
  late_check_ins?: number;
  late_check_outs?: number;
  short_shifts?: number;
  visits_shortfall?: number;
  computed_pay: number;
  suggested_amount: number;
  payable_amount: number;
  has_manual_pay: boolean;
  manual_pay?: TimesheetManualPay | null;
}

export interface TimesheetSummary {
  guards: number;
  days_worked: number;
  shift_count: number;
  incomplete_shifts: number;
  total_working_minutes: number;
  total_working_hours: number;
  computed_pay: number;
  payable_amount: number;
}

export interface TimesheetLine {
  attendance_id: number;
  guard_id: number;
  duty_id: number;
  duty_title: string | null;
  duty_date: string | null;
  work_date: string | null;
  site_id: number | null;
  site_name: string | null;
  site_timezone: string | null;
  site_location_title: string | null;
  service_mode: string | null;
  schedule_kind?: "visit_window" | "shift" | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  scheduled_hours: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_timing: TimesheetTiming | null;
  check_out_timing: TimesheetTiming | null;
  is_late_check_in: boolean;
  is_late_check_out: boolean;
  is_short_shift: boolean;
  hours_variance: number | null;
  total_working_minutes: number | null;
  total_working_hours: number | null;
  status: string | null;
  is_completed: boolean;
  required_visits: number;
  completed_visits: number;
  visit_minutes: number;
  visit_hours: number;
  visits_shortfall: number;
  visits_incomplete?: boolean;
  guard_pay_basis: GuardPayBasis | null;
  guard_pay_rate: number | null;
  line_pay: number;
}

export interface TimesheetGroupRow {
  days_worked: number;
  shift_count: number;
  total_working_minutes: number;
  total_working_hours: number;
  scheduled_hours: number;
  hours_variance: number | null;
  completed_visits: number;
  required_visits: number;
  visit_minutes: number;
  visit_hours: number;
  visits_shortfall?: number;
  late_check_ins: number;
  late_check_outs: number;
  short_shifts: number;
  computed_pay: number;
}

export interface TimesheetGuardReport {
  filters: TimesheetFilters;
  summary: TimesheetGuardRow & {
    suggested_amount: number;
    payable_amount: number;
  };
  manual_pay: TimesheetManualPay | null;
  by_site: Array<
    TimesheetGroupRow & {
      site_id: number | null;
      site_name: string | null;
      site_timezone: string | null;
    }
  >;
  by_duty: Array<
    TimesheetGroupRow & {
      duty_id: number | null;
      duty_title: string | null;
      duty_date: string | null;
      site_name: string | null;
      site_timezone: string | null;
      service_mode: string | null;
      guard_pay_basis: GuardPayBasis | null;
      guard_pay_rate: number | null;
    }
  >;
  lines: TimesheetLine[];
  generated_at: string;
}

export interface TimesheetListResponse {
  items: TimesheetGuardRow[];
  summary: TimesheetSummary;
  filters: TimesheetFilters;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  generated_at: string;
}

export interface UpsertManualPayDto {
  period_start: string;
  period_end: string;
  pay_basis: ManualPayBasis;
  manual_rate?: number | null;
  manual_total_amount?: number | null;
  currency?: string | null;
  notes?: string | null;
}
