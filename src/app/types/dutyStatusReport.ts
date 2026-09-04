// import { Duty } from "./duty";
// import { Guard } from "./guard";

// export interface DutyStatusReportMedia {
//   id: number;
//   url: string;
//   type: 'image' | 'video' | 'document';
//   thumbnail_url?: string;
//   created_at: string;
// }

// export interface DutyStatusReport {
//   id: number;
//   message: string;
//   is_ok: boolean;
//   latitude: string;
//   longitude: string;
//   visible_to_client: boolean;
//   guard_id?: number;
//   duty_id?: number;
//   created_at: string;
//   updated_at?: string;

//   duty?: Partial<Duty>;
//   guard?: Partial<Guard>;
//   media?: DutyStatusReportMedia[];
// }

// export interface DutyStatusReportParams {
//   page?: number;
//   per_page?: number;
//   search?: string;
//   guard_id?: number;
//   duty_id?: number;
//   is_ok?: boolean;
//   visible_to_client?: boolean;
//   start_date?: string;
//   end_date?: string;
//   sort_by?: string;
//   sort_order?: "asc" | "desc";
// }

// export interface DutyStatusReportState {
//   reports: DutyStatusReport[];
//   currentReport: DutyStatusReport | null;
//   pagination: {
//     current_page: number;
//     last_page: number;
//     total: number;
//     per_page?: number;
//   };
//   isLoading: boolean;
//   error: string | null;
// }

// export interface CreateDutyStatusReportDto {
//   duty_id: number;
//   guard_id: number;
//   message: string;
//   is_ok: boolean;
//   latitude?: string;
//   longitude?: string;
//   visible_to_client?: boolean;
//   media_files?: File[]; // For FormData uploads

// }

// export interface UpdateDutyStatusReportDto {
//   message?: string;
//   is_ok?: boolean;
//   latitude?: string;
//   longitude?: string;
//   visible_to_client?: boolean;
//   guard_id?:number;
//   duty_id?:number,
// }

// ============================================
// CORE INTERFACES
// ============================================

export interface DutyStatusReport {
  id: number;
  duty_id: number;
  guard_id: number;
  message: string;
  is_ok: boolean;
  had_incident: boolean;
  suspicious_activity: boolean;
  security_safety_concern: boolean;
  unauthorized_access: boolean;
  property_damage: boolean;
  emergency_services_contacted: boolean;
  requires_follow_up: boolean;
  latitude: number;
  longitude: number;
  has_location: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  visible_to_client: boolean;
  status: 'submitted' | 'draft' | 'approved' | 'rejected' | 'pending';
  reported_issues: string[]; // or any[] based on your data structure
  duty: Duty;
  duty_details: DutyDetails;
  guard: Guard;
  media: DutyStatusReportMedia[];
  has_media: boolean;
  created_at: string;
  updated_at: string;
  created_at_formatted?: string;
  time_ago?: string;
}

// ============================================
// DUTY INTERFACES
// ============================================

export interface Duty {
  id: number;
  duty_schedule_id: number | null;
  client_contract_service_id: number | null;
  is_schedule_exception: boolean;
  service_mode: string;
  title: string;
  duty_date: string;
  start_datetime: string;
  end_datetime: string;
  site_id: number;
  site_location_id: number;
  guards_required: number;
  required_visits: number | null;
  duty_time_type_id: number | null;
  duty_type: string | null;
  required_hours: number;
  mandatory_check_in_time: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_working_hours: number | null;
  status: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  site: Site;
  site_location: SiteLocation;
}

export interface DutyDetails {
  id: number;
  title: string;
  service_mode: string;
  required_visits: number | null;
  duty_date: string;
  start_datetime: string;
  end_datetime: string;
  site_name: string;
  site_address: string;
  site_timezone: string;
  site_location: string;
}

// ============================================
// SITE INTERFACES
// ============================================

export interface Site {
  id: number;
  client_id: number;
  site_name: string;
  site_instruction: string;
  address: string;
  guards_required: number;
  latitude: number;
  longitude: number;
  timezone: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  client_contract_id: number | null;
}

export interface SiteLocation {
  id: number;
  site_id: number;
  title: string;
  description: string;
  contract_specific_instructions: string | null;
  latitude: string;
  longitude: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  client_contract_id: number | null;
}

// ============================================
// GUARD INTERFACE
// ============================================

export interface Guard {
  id: number;
  guard_code: string;
  full_name: string;
  phone: string;
  email: string;
  profile_image: string;
}

// ============================================
// MEDIA INTERFACE
// ============================================

export interface DutyStatusReportMedia {
  id: number;
  model_type: string;
  model_id: number;
  file_category_id: number;
  disk: string;
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
  is_primary: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  url: string;
  media_type: 'image' | 'video' | 'document';
  category?: MediaCategory;
}

export interface MediaCategory {
  id: number;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================
// API REQUEST/RESPONSE INTERFACES
// ============================================

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
  sort_order?: 'asc' | 'desc';
  has_incident?: boolean;
}

export interface CreateDutyStatusReportDto {
  duty_id: number;
  guard_id: number;
  message: string;
  is_ok: boolean;
  had_incident?: boolean;
  suspicious_activity?: boolean;
  security_safety_concern?: boolean;
  unauthorized_access?: boolean;
  property_damage?: boolean;
  emergency_services_contacted?: boolean;
  requires_follow_up?: boolean;
  latitude?: string | number;
  longitude?: string | number;
  visible_to_client?: boolean;
  media_files?: File[];
  has_location?: boolean;
}

export interface UpdateDutyStatusReportDto {
  message?: string;
  is_ok?: boolean;
  had_incident?: boolean;
  suspicious_activity?: boolean;
  security_safety_concern?: boolean;
  unauthorized_access?: boolean;
  property_damage?: boolean;
  emergency_services_contacted?: boolean;
  requires_follow_up?: boolean;
  latitude?: string | number;
  longitude?: string | number;
  visible_to_client?: boolean;
  guard_id?: number;
  duty_id?: number;
  has_location?: boolean;
}

// ============================================
// API RESPONSE INTERFACES
// ============================================

export interface DutyStatusReportResponse {
  status: string;
  status_code: number;
  success: boolean;
  body: {
    items: DutyStatusReport[];
    data: {
      current_page: number;
      last_page: number;
      total: number;
    };
  };
}

// ============================================
// STATE INTERFACE
// ============================================

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
