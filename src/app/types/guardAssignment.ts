import { Duty } from "./duty";
import { Guard } from "./guard";

export interface GuardAssignment {
  id: number;
  guard_id:number;
  duty_id:number;
  start_date:string;
  end_date:string;
  status?: 'assigned' | 'active' | 'completed' | 'cancelled';

  guard?:Partial<Guard>;
  duty?:Partial<Duty>;
  created_at?:string
  
}


export interface GuardAssignmentParams {
  page?: number;
  per_page?: number;
  search?: string;

  guard_id?: number;
  duty_id?: number;
  
  status?: string;
  include_guard?: boolean;
  include_duty?: boolean;


  sort_by?: string;
  sort_order?: "asc" | "desc";
  start_date?:string;
  end_date?:string
}


export interface GuardAssignmentState {
  assignments: GuardAssignment[];
  currentAssignment: GuardAssignment | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number; // 🔥 optional
  };

  isLoading: boolean;
  error: string | null;
}



export interface ToggleGuardAssignmentStatusRequest {
  status: string;
}



export interface CreateGuardAssignmentDto {
  guard_id: number;
  duty_id: number;
  start_date: string;
  end_date: string;
  status: string;
}