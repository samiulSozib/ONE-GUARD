// types/duty-schedule.ts
import { Site } from './site';
import { SiteLocation } from './siteLocation.types';
import { ClientContractService } from './client-contract-service';
import { User } from './api.types';

export interface DutySchedule {
  id: number;
  client_contract_service_id: number | null;
  site_id: number;
  site_location_id: number | null;
  duty_time_type_id: number | null;
  title: string;
  description: string | null;
  schedule_type: 'one_time' | 'recurring';
  start_date: string;
  end_date: string | null;
  is_open_ended: boolean;
  recurrence_frequency: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_interval: number | null;
  recurrence_days: string[] | null;
  recurrence_rule: Record<string, any> | null;
  start_time: string;
  end_time: string;
  guards_required: number;
  required_hours: number;
  mandatory_check_in_time: string | null;
  generated_until: string | null;
  status: 'active' | 'inactive' | 'draft' | string;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, any> | null;
  duties_count?: number;
  created_at?: string;
  updated_at?: string;

  // Relations
  site?: Partial<Site>;
  site_location?: Partial<SiteLocation> | null;
  duty_time_type?: any | null;
  client_contract_service?: Partial<ClientContractService> | null;
  creator?: Partial<User>;
  updater?: Partial<User>;
}

export interface CreateDutyScheduleDto {
  client_contract_service_id?: number | null;
  site_id: number;
  site_location_id?: number | null;
  duty_time_type_id?: number | null;
  title: string;
  description?: string | null;
  schedule_type: 'one_time' | 'recurring';
  start_date: string;
  end_date?: string | null;
  is_open_ended?: boolean;
  recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_interval?: number | null;
  recurrence_days?: string[] | null;
  recurrence_rule?: Record<string, any> | null;
  start_time: string;
  end_time: string;
  guards_required: number;
  required_hours?: number;
  mandatory_check_in_time?: string | null;
  status?: 'active' | 'inactive' | 'draft' | string;
  is_active?: boolean;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateDutyScheduleDto {
  client_contract_service_id?: number | null;
  site_id?: number;
  site_location_id?: number | null;
  duty_time_type_id?: number | null;
  title?: string;
  description?: string | null;
  schedule_type?: 'one_time' | 'recurring';
  start_date?: string;
  end_date?: string | null;
  is_open_ended?: boolean;
  recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_interval?: number | null;
  recurrence_days?: string[] | null;
  recurrence_rule?: Record<string, any> | null;
  start_time?: string;
  end_time?: string;
  guards_required?: number;
  required_hours?: number;
  mandatory_check_in_time?: string | null;
  status?: 'active' | 'inactive' | 'draft' | string;
  is_active?: boolean;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface DutyScheduleParams {
  page?: number;
  per_page?: number;
  search?: string;
  site_id?: number;
  site_location_id?: number;
  client_contract_service_id?: number;
  schedule_type?: 'one_time' | 'recurring';
  recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  status?: string;
  is_active?: boolean;
  is_open_ended?: boolean;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  include_site?: boolean;
  include_client?: boolean;
  include_creator?: boolean;
  include_updater?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DutyScheduleState {
  items: DutySchedule[];
  currentItem: DutySchedule | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}
