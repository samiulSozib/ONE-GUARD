// app/types/duty.ts

import { DutySchedule } from '@/app/types/duty-schedule';
import { Site } from "./site";

export interface Duty {
  id: number;
  title: string;
  duty_date: string | null;
  start_datetime: string;
  end_datetime: string;
  duty_schedule_id: number | null;
  client_contract_service_id: number | null;
  is_schedule_exception: boolean;
  source_type: 'scheduled' | 'one_time' | 'manual' | 'exception';
  site_id: number;
  site_location_id: number | null;
  duty_time_type_id: number | null;
  duty_type: string | null;
  required_hours: number;
  mandatory_check_in_time: string | null;
  guards_required: number;
  assigned_guards_count: number | null;
  remaining_guards_count: number | null;
  coverage_status: 'unassigned' | 'partial' | 'covered' | 'not_required' | string;
  status: 'pending' | 'approved' | 'completed' | string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Relationships
  site?: {
    id: number;
    client_id: number;
    site_name: string;
    site_instruction?: string;
    address?: string;
    guards_required?: number;
    latitude?: string | number;
    longitude?: string | number;
    timezone?: string | null;
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
  };
  duty_schedule?: DutySchedule;
  client_contract_service?: any | null;
  duty_time_type?: any | null;
}

export interface DutyParams {
  page?: number;
  per_page?: number;
  search?: string;
  guard_id?: number;
  site_id?: number;
  site_location_id?: number;
  duty_time_type_id?: number;
  duty_schedule_id?: number;
  source_type?: 'scheduled' | 'one_time' | 'manual' | 'exception';
  duty_type?: 'day' | 'night' | string;
  status?: 'pending' | 'approved' | 'completed' | string;
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  include_site?: boolean | number;
  include_site_location?: boolean | number;
  include_duty_time_type?: boolean | number;
  include_duty_schedule?: boolean | number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DutyState {
  duties: Duty[];
  currentDuty: Duty | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ToggleDutyStatusRequest {
  is_active: boolean;
}

// Coverage status helper
export const getCoverageStatusDisplay = (status: string): string => {
  const map: Record<string, string> = {
    'unassigned': 'Unassigned',
    'partial': 'Partial',
    'covered': 'Covered',
    'not_required': 'Not Required',
  };
  return map[status] || status;
};

export const getCoverageStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'unassigned': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'covered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'not_required': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusDisplay = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'completed': 'Completed',
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};
