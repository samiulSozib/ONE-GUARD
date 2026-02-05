import { Site } from "./site";

export interface Client {
  id: number;
  user_id: number;
  client_code: string;
  full_name: string;
  email: string;
  phone: string;
  password?: string; // For create/update only
  company_name?: string;
  tax_id?: string;
  country: string;
  city: string;
  address: string;
  zip_code?: string;
  currency_id?: number;
  registration_date?: string;
  business_type?: string;
  industry?: string;
  license_number?: string;
  website?: string;
  contact_person?: string;
  contact_person_phone?: string;
  notes?: string;
  profile_image?: string;
  profile_image_data?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Relationships
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
  };
  //currency?: null;
  sites?: Site[];
  contacts?: ClientContact[];
  documents?: ClientDocument[];
  media?: File[];
  
  // Counts
  sites_count?: number;
  documents_count?: number;
  contacts_count?: number;
  media_count?: number;
}

export interface ClientContact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  designation?: string;
  department?: string;
  is_primary: number; // 0 or 1 from API
  notes?: string;
  is_active: number; // 0 or 1 from API
  created_at: string;
  updated_at: string;
}

export interface ClientDocument {
  id: number;
  client_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: number;
  notes?: string;
  created_at: string;
}

export interface ClientParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
  country?: string;
  city?: string;
  include_sites?: boolean;
  include_contacts?: boolean;
  include_documents?: boolean;
  include_user?: boolean;
  include_media?: boolean;
}

export interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface SingleClientResponse {
  item: Client;
}

export interface PaginatedClientsResponse {
  items: Client[];
  data: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface ViewClientTopCardProps{
  client:Client
}