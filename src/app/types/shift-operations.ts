
export interface ShiftOperationsSummary {
    assignment_rows: number;
    unfilled_duties: number;
    unfilled_positions: number;
    attended_assignments: number;
    on_duty: number;
    on_break: number;
    missing_check_out: number;
    early_check_ins: number;
    early_checkouts: number;
    replaced_assignments: number;
    patrol_completed: number;
    patrol_incomplete: number;
    shifts_with_incidents: number;
    shifts_with_reports: number;
  }
  
  export interface ShiftDuty {
    id: number;
    title: string;
    duty_schedule_id: number | null;
    service_mode: string;
    status: string;
    start_datetime: string;
    end_datetime: string;
    site_id: number | null;
    site_name: string | null;
    client_id: number | null;
    site_location_id: number | null;
    site_location_name: string | null;
    site_timezone: string | null;
  }
  
  export interface ShiftGuard {
    id: number;
    name: string | null;
    code: string | null;
    is_missing: boolean;
  }
  
  export interface ShiftTiming {
    classification: string;
    difference_minutes: number;
  }
  
  export interface ShiftPatrol {
    required: number;
    recorded: number;
    completed: number;
    missed: number;
    status: string;
  }
  
  export interface ShiftCoverage {
    required: number;
    assigned: number;
    attended?: number;
    status: string;
  }
  
  export interface ShiftCount {
    guard_count?: number;
    duty_count: number;
  }
  
  export interface ShiftOperationRow {
    row_type: "assignment" | "unfilled_slots";
    duty_id: number;
    assignment_id: number | null;
    guard: ShiftGuard | null;
    duty: ShiftDuty;
    unfilled_count?: number;
    assignment_status?: string;
    is_replaced?: boolean;
    operational_status: string;
    attended?: boolean;
    attendance_status: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    check_in_timing?: ShiftTiming | null;
    check_out_timing?: ShiftTiming | null;
    checkout_source?: string | null;
    early_checkout_request?: unknown;
    patrol?: ShiftPatrol;
    incidents: ShiftCount;
    shift_reports: ShiftCount;
    coverage: ShiftCoverage;
    last_action?: string | null;
    last_action_at?: string | null;
  }
  
  export interface ShiftFilters {
    from: string;
    to: string;
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
  
  export interface ShiftOperationsList {
    items: ShiftOperationRow[];
    summary: ShiftOperationsSummary;
    pagination: {
      unit: string;
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    filters: Record<string, string>;
    generated_at: string;
    notes?: string[];
  }
  
  export interface ShiftOperationsOverview {
    summary: ShiftOperationsSummary;
    filters: Record<string, string>;
    generated_at: string;
  }
  
  export type ShiftAssignmentDetails = Record<string, unknown>;
  