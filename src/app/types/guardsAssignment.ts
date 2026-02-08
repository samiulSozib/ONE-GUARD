export interface GuardAssignment {
  id: number;
  guard_id: number;
  duty_id: number;
  start_date: string;
  end_date: string;
  status: 'assigned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  guard?: {
    id: number;
    full_name: string;
    guard_code: string;
  };
  duty?: {
    id: number;
    title: string;
    site_id: number;
  };
}

export interface GuardAssignmentParams {
  page?: number;
  per_page?: number;
  guard_id?: number;
  duty_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  include_guard?: boolean;
  include_duty?: boolean;
  include_site?: boolean;
}

export interface GuardAssignmentState {
  guardAssignments: GuardAssignment[];
  currentGuardAssignment: GuardAssignment | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}


// no need