import { Site } from "./site";

export interface Duty {
  id: number;
  title: string;

  start_datetime: string;
  end_datetime: string;

  guards_required: number;
  required_hours: number;

  duty_type: "day" | "night" | string;
  status: "pending" | "approved" | "completed" | string;

  is_active?: boolean;

  created_at: string;
  site_id?:number;
  site_location_id?:number;
  duty_time_type_id?:number,
  mandatory_check_in_time?:string,
  notes?:string|null,

  /* ---------------- Relationships ---------------- */

  site?: {
    id: number;
    client_id: number;
    site_name: string;
    site_instruction?: string;
    address?: string;
    guards_required?: number;
    latitude?: string;
    longitude?: string;
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
    site?:Site
  };
}


export interface DutyParams {
  page?: number;
  per_page?: number;
  search?: string;

  site_id?: number;
  site_location_id?: number;
  duty_time_type_id?: number;

  duty_type?: "day" | "night";
  status?: "pending" | "approved" | "completed";
  is_active?: boolean;

  include_site?: boolean | number;
  include_site_location?: boolean | number;
  include_duty_time_type?: boolean | number;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}


export interface DutyState {
  duties: Duty[];
  currentDuty: Duty | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number; // 🔥 optional
  };

  isLoading: boolean;
  error: string | null;
}



export interface ToggleDutyStatusRequest {
  is_active: boolean;
}
