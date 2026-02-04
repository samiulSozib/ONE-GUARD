import { DutyAttendance } from "./dutyAttendance";
import { GuardAssignment } from "./guardsAssignment";
import { GuardType } from "./lookup";

export interface Guard {
  id: number;
  guard_code: string;
  full_name: string;
  email: string;
  phone: string;
  password?: string; // For create/update only
  employee_company_card_number?: string;
  driver_license?: string;
  profile_image?: string;
  zip_code?: string;
  joining_date: string;
  contract_id?: number;
  date_of_birth?: string;
  gender: 'male' | 'female' | 'other';
  country?: string;
  city?: string;
  address?: string;
  guard_type_id?: number;
  license_expiry_date?: string;
  issuing_source?: string;
  
  // Profile data
  profile_data?: {
    place_of_birth?: string;
    country_of_origin?: string;
    current_country?: string;
    current_city?: string;
    current_address?: string;
    citizenship?: string;
    visa_countries?: string[];
    visa_expiry_date?: string;
    has_work_permit?: boolean;
    father_name?: string;
    mother_name?: string;
    national_id_number?: string;
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
    height?: string;
    weight?: string;
    blood_group?: string;
    experience_years?: number;
    skills?: string;
    languages?: string[];
    highest_education_level?: string;
    education_field?: string;
    institution_name?: string;
    graduation_year?: number;
    has_security_training?: boolean;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    notes?: string;
  };
  
  // Document types for upload
  document_types?: string[];
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  guard_type?: GuardType;
  contacts?: GuardContact[];
  assignments?: GuardAssignment[];
  attendances?: DutyAttendance[];

  user?:{
    id:number;
    first_name?:string;
    last_name?:string;
    role?:string;
    is_active?:string
  }
}

export interface GuardContact {
  id: number;
  guard_id: number;
  name: string;
  phone: string;
  email?: string;
  relation: string;
  is_primary: boolean;
  is_emergency: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuardParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
  guard_type_id?: number;
  country?: string;
  city?: string;
  include_type?: boolean;
  include_assignments?: boolean;
  include_attendances?: boolean;
}

export interface GuardState {
  guards: Guard[];
  currentGuard: Guard | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}