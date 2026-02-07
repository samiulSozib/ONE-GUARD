export interface SiteLocation {
  id: number;
  site_id: number;
  title: string;
  description?: string | null;
  latitude: string | number;
  longitude: string | number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  
  // Relationships
  site?: {
    id: number;
    client_id: number;
    site_name: string;
    site_instruction?: string;
    address: string;
    guards_required?: number;
    latitude?: string;
    longitude?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  client?: {
    id?: number;
    full_name?: string;
    client_code?: string;
  };
}

export interface SiteLocationParams {
  page?: number;
  per_page?: number;
  search?: string;
  site_id?: number;
  client_id?: number;
  is_active?: boolean;
  include_site?: boolean | number;
  include_client?: boolean | number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SiteLocationState {
  siteLocations: SiteLocation[];
  currentSiteLocation: SiteLocation | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Request types
export interface CreateSiteLocationRequest {
  site_id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

export interface UpdateSiteLocationRequest {
  site_id?: number;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

export interface ToggleStatusRequest {
  is_active: boolean;
}