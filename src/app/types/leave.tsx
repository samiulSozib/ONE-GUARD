import { Site } from "./site";

export interface Leave {
  id: number;
  guard_id: number;
  site_id: number;
  leave_type: "sick" | "casual" | "annual" | "emergency" | string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed" | string;
  review_note: string | null;
  created_at: string;
  
  /* ---------------- Relationships ---------------- */
  site?: Partial<Site>;
  reviewer?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface LeaveParams {
  page?: number;
  per_page?: number;
  search?: string;
  guard_id?: number;
  site_id?: number;
  leave_type?: string;
  status?: "pending" | "approved" | "rejected" | "completed";
  from_date?: string;
  to_date?: string;
  include_site?: boolean | number;
  include_reviewer?: boolean | number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface LeaveState {
  leaves: Leave[];
  currentLeave: Leave | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ToggleLeaveStatusRequest {
  status: string;
  review_note?: string | null;
}

/* ---------- Create Leave DTO ---------- */
export interface CreateLeaveDto {
  guard_id: number;
  site_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
}

/* ---------- Update Leave DTO ---------- */
export interface UpdateLeaveDto extends Partial<CreateLeaveDto> {
  status?: string;
  review_note?: string | null;
}

