export interface DutyAttendance {
  id: number;
  duty_id: number;
  guard_id: number;
  check_in_time: string;
  check_out_time?: string;
  status: 'checked_in' | 'checked_out' | 'absent' | 'late';
  latitude?: number;
  longitude?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
  duty?: {
    id: number;
    title: string;
    site_id: number;
  };
  guard?: {
    id: number;
    full_name: string;
    guard_code: string;
  };
}

export interface DutyAttendanceParams {
  page?: number;
  per_page?: number;
  duty_id?: number;
  guard_id?: number;
  date?: string;
  status?: string;
  include_duty?: boolean;
  include_guard?: boolean;
}

export interface DutyAttendanceState {
  dutyAttendances: DutyAttendance[];
  currentDutyAttendance: DutyAttendance | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}