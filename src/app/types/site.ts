export interface Site {
  id: number;
  client_id: number;
  site_name: string;
  site_instruction?: string;
  address: string;
  guards_required: number;
  latitude: number;
  longitude: number;
  status: 'planned' | 'running' | 'paused' | 'completed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  site_id?:number;
  title?:string;
  description?:string;
  
  // Relationships
  client?: {
    id: number;
    full_name: string;
    client_code: string;
  };
  locations?: SiteLocation[];
  //duties?: Duty[];
  //incidents?: Incident[];
  //expenses?: Expense[];
}

export interface SiteLocation {
  id: number;
  site_id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  //duties?: Duty[];
}

export interface SiteDocument {
  id: number;
  site_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: number;
  notes?: string;
  created_at: string;
}

export interface SiteParams {
  page?: number;
  per_page?: number;
  search?: string;
  client_id?: number;
  status?: string;
  is_active?: boolean;
  include_client?: boolean;
  include_locations?: boolean;
  include_duties?: boolean;
  include_incidents?: boolean;
}

export interface SiteState {
  sites: Site[];
  currentSite: Site | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface SiteLocationState {
  locations: SiteLocation[];
  currentLocation: SiteLocation | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface CreateSiteDto {
  client_id: number;
  client_contract_id?: number;  // Optional
  site_name: string;
  address: string;
  guards_required: number;
  latitude?: number;  // Optional
  longitude?: number; // Optional
  status: 'planned' | 'active' | 'paused' | 'completed';
  site_instruction?: string;
  is_active?: boolean; // Optional, defaults to true
  locations?: CreateSiteLocationDto[];
}

export interface CreateSiteLocationDto {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export interface UpdateSiteDto {
  client_id?: number;
  client_contract_id?: number | null; // null to remove contract assignment
  site_name?: string;
  address?: string;
  guards_required?: number;
  latitude?: number | null;
  longitude?: number | null;
  status?: 'planned' | 'active' | 'paused' | 'completed';
  site_instruction?: string | null;
  is_active?: boolean;
  locations?: CreateSiteLocationDto[]; // This will replace all locations
}

export interface UpdateSiteLocationDto {
  title?: string;
  description?: string | null;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}
