export interface DutyTimeType {
  id: number;
  title: string | null;
  description: string | null;
  start_time: string; // Format: "HH:mm" or "HH:mm:ss"
  end_time: string; // Format: "HH:mm" or "HH:mm:ss"
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Optional relationships (if include_site=1 or include_client=1 are supported)
  site?: {
    id: number;
    site_name: string;
    client_id: number;
    address?: string;
  };
  client?: {
    id: number;
    full_name?: string;
    client_code?: string;
  };
}

export interface DutyTimeTypeParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  include_site?: boolean | number;
  include_client?: boolean | number;
  sort_by?: 'id' | 'title' | 'start_time' | 'end_time' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface DutyTimeTypeState {
  dutyTimeTypes: DutyTimeType[];
  currentDutyTimeType: DutyTimeType | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ToggleDutyTimeTypeStatusRequest {
  is_active: boolean;
}