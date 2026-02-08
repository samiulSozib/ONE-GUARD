import { Duty } from "./duty";
import { Guard } from "./guard";
import { Site, SiteLocation } from "./site";

export interface DutyAttendance {
  id: number;
  status?:string;
  remarks?:string;
  check_in_time?:string;
  check_out_time?:string;
  total_working_minutes?:number

  guard_id?:number;
  duty_id?:number;
  

  guard?:Partial<Guard>;
  duty?:Partial<Duty>;
  site?:Partial<Site>
  site_location?:Partial<SiteLocation>
  created_at?:string
  
}


export interface DutyAttendanceParams {
  page?: number;
  per_page?: number;
  search?: string;

  guard_id?: number;
  duty_id?: number;
  
  status?: string;


  sort_by?: string;
  sort_order?: "asc" | "desc";
}


export interface DutyAttendanceState {
  attendences: DutyAttendance[];
  currentAttendence: DutyAttendance | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number; // 🔥 optional
  };

  isLoading: boolean;
  error: string | null;
}



export interface ToggleDutyAttendenceStatusRequest {
  status: string;
}



export interface CreateDutyAttendanceDto {
  guard_id: number;
  duty_id: number;

  check_in_time: string;
  check_out_time:string;

  status?: string;

  latitude?:string;
  longitude?:string;

  remarks?:string
}