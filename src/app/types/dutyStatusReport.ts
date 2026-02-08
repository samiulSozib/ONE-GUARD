import { Duty } from "./duty";
import { Guard } from "./guard";

export interface DutyStatusReportMedia {
  id: number;
  url: string;
  type: 'image' | 'video' | 'document';
  thumbnail_url?: string;
  created_at: string;
}

export interface DutyStatusReport {
  id: number;
  message: string;
  is_ok: boolean;
  latitude: string;
  longitude: string;
  visible_to_client: boolean;
  guard_id?: number;
  duty_id?: number;
  created_at: string;
  updated_at?: string;
  
  duty?: Partial<Duty>;
  guard?: Partial<Guard>;
  media?: DutyStatusReportMedia[];
}

export interface DutyStatusReportParams {
  page?: number;
  per_page?: number;
  search?: string;
  guard_id?: number;
  duty_id?: number;
  is_ok?: boolean;
  visible_to_client?: boolean;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface DutyStatusReportState {
  reports: DutyStatusReport[];
  currentReport: DutyStatusReport | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface CreateDutyStatusReportDto {
  duty_id: number;
  guard_id: number;
  message: string;
  is_ok: boolean;
  latitude?: string;
  longitude?: string;
  visible_to_client?: boolean;
  media_files?: File[]; // For FormData uploads

}

export interface UpdateDutyStatusReportDto {
  message?: string;
  is_ok?: boolean;
  latitude?: string;
  longitude?: string;
  visible_to_client?: boolean;
  guard_id?:number;
  duty_id?:number,
}