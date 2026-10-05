/* =========================================================
   Patrol Visit
   ========================================================= */

export type PatrolVisitStatus =
  | "pending"
  | "checked_in"
  | "completed"
  | "missed"
  | "cancelled"
  | string;

/* =========================================================
   Shared Related Entities
   ========================================================= */

export interface PatrolVisitGuard {
  id?: number;
  guard_code?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  profile_photo?: string | null;
}

export interface PatrolVisitSite {
  id?: number;
  site_name?: string | null;
  name?: string | null;
  address?: string | null;
}

export interface PatrolVisitSiteLocation {
  id?: number;
  title?: string | null;
  name?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface PatrolVisitDuty {
  id?: number;
  title?: string | null;
  duty_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  service_mode?: string | null;
  required_visits?: number | null;

  site?: PatrolVisitSite | null;
  site_location?: PatrolVisitSiteLocation | null;
}

export interface PatrolVisitAssignment {
  id?: number;
  guard_id?: number | null;
  duty_id?: number | null;
  status?: string | null;

  guard?: PatrolVisitGuard | null;
  duty?: PatrolVisitDuty | null;
}

/* =========================================================
   Individual Patrol Visit
   ========================================================= */

export interface PatrolVisit {
  id: number;

  duty_id?: number | null;
  guard_assignment_id?: number | null;
  guard_id?: number | null;

  visit_number: number;

  status: PatrolVisitStatus;

  checked_in_at?: string | null;
  checked_out_at?: string | null;

  checkin_latitude?: number | string | null;
  checkin_longitude?: number | string | null;
  checkin_accuracy?: number | string | null;

  checkout_latitude?: number | string | null;
  checkout_longitude?: number | string | null;
  checkout_accuracy?: number | string | null;

  duration_minutes?: number | null;

  notes?: string | null;

  metadata?: Record<string, unknown> | null;

  created_at?: string | null;
  updated_at?: string | null;

  guard?: PatrolVisitGuard | null;
  duty?: PatrolVisitDuty | null;

  guard_assignment?: PatrolVisitAssignment | null;
}

/* =========================================================
   Patrol Assignment Summary
   ========================================================= */

export type PatrolAssignmentStatus =
  | "pending"
  | "not_started"
  | "in_progress"
  | "completed"
  | "partially_completed"
  | "missed"
  | "cancelled"
  | string;

export interface PatrolAssignmentSummary {
  assignment_id: number;

  duty_id?: number | null;
  guard_id?: number | null;

  duty_date?: string | null;

  status?: PatrolAssignmentStatus;

  required_visits: number;
  completed_visits: number;
  remaining_visits: number;

  checked_in_visits?: number;
  missed_visits?: number;
  cancelled_visits?: number;

  progress_percentage?: number;

  latest_visit?: PatrolVisit | null;

  guard?: PatrolVisitGuard | null;
  duty?: PatrolVisitDuty | null;
  site?: PatrolVisitSite | null;
  site_location?: PatrolVisitSiteLocation | null;

  visits?: PatrolVisit[];
}

/* =========================================================
   Overview
   ========================================================= */

export interface PatrolVisitOverview {
  assignments?: {
    total?: number;
    completed?: number;
    in_progress?: number;
    pending?: number;
    missed?: number;
  };

  visits?: {
    required?: number;
    total?: number;
    completed?: number;
    checked_in?: number;
    pending?: number;
    missed?: number;
    cancelled?: number;
  };

  total_assignments?: number;
  total_required_visits?: number;
  completed_visits?: number;
  in_progress_visits?: number;
  pending_visits?: number;
  missed_visits?: number;
}

/* =========================================================
   List Filters
   ========================================================= */

export interface PatrolVisitParams {
  page?: number;
  per_page?: number;

  search?: string;

  guard_id?: number;
  duty_id?: number;
  site_id?: number;
  site_location_id?: number;

  status?: string;

  date?: string;
  start_date?: string;
  end_date?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* =========================================================
   Pagination
   ========================================================= */

export interface PatrolVisitPagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

/* =========================================================
   API Collection Response
   ========================================================= */

export interface PatrolAssignmentListResponse {
  items: PatrolAssignmentSummary[];

  data?: {
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
  };
}

/* =========================================================
   Redux State
   ========================================================= */

export interface PatrolVisitState {
  overview: PatrolVisitOverview | null;

  assignments: PatrolAssignmentSummary[];

  currentAssignment: PatrolAssignmentSummary | null;

  currentVisit: PatrolVisit | null;

  visits: PatrolVisit[];

  pagination: PatrolVisitPagination;

  isLoading: boolean;
  isOverviewLoading: boolean;
  isDetailsLoading: boolean;

  error: string | null;
}
