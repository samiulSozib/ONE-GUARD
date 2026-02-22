import { Contact } from "./contact";
import { Site } from "./site";

// ==================== Base Types ====================

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface ClientContact {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  position?: string | null;  // From create payload example
  designation?: string | null; // From existing interface
  department?: string | null;
  is_primary: boolean | number; // Can be boolean in create, number (0/1) in response
  notes?: string | null;
  is_active?: boolean | number; // Optional as it might not be in create
  created_at?: string;
  updated_at?: string;
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
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Media {
  id?: number;
  url?: string;
  file?: File; // For form data
  category?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

// ==================== API Response Types ====================

/**
 * Client model as returned by the API (GET responses)
 */
export interface Client {
  // Core fields
  id: number;
  user_id: number;
  client_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  
  // Optional fields (may be null in API)
  company_name?: string | null;
  tax_id?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  zip_code?: string | null;
  currency_id?: number | null;
  registration_date?: string | null;
  business_type?: string | null;
  industry?: string | null;
  license_number?: string | null;
  website?: string | null;
  contact_person?: string | null;
  contact_person_phone?: string | null;
  notes?: string | null;
  
  // Profile image
  profile_image?: string | null;
  profile_image_data?: string | null;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Relationships (loaded based on include params)
  user?: User;
  currency?: null ; // Currency type if needed
  sites?: Site[];
  contacts?: ClientContact[];
  documents?: ClientDocument[];
  media?: Media[];
  
  // Counts (often included in list responses)
  sites_count?: number;
  documents_count?: number;
  contacts_count?: number;
  media_count?: number;
  name?:string
}

// ==================== Create/Update Payload Types ====================

/**
 * Location data for site creation
 */
export interface LocationCreatePayload {
  title: string;
  description?: string;
  latitude: string | number;
  longitude: string | number;
  is_active?: boolean;
}

/**
 * Site creation payload (used within client creation)
 */
export interface SiteCreatePayload {
  site_name: string;
  site_instruction?: string;
  address: string;
  guards_required: number;
  latitude: string | number;
  longitude: string | number;
  status?: 'running' | 'planned' | 'active' | 'inactive'; // Adjust based on your valid statuses
  
  // Optional nested data
  locations?: LocationCreatePayload[];
  site_document_types?: string[]; // Document types to be uploaded for this site
}

/**
 * Client contact creation payload
 */
export interface ClientContactCreatePayload {
  name: string;
  phone: string;
  email?: string;
  position?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
}

/**
 * Client creation payload (POST /clients)
 * This matches the form-data structure shown in your example
 */
export interface ClientCreatePayload {
  // Required fields
  full_name: string;
  email: string;
  phone: string;
  password: string;
  client_code?: string; // Optional if auto-generated
  
  // Optional client fields
  company_name?: string;
  tax_id?: string;
  country?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  currency_id?: number | null;
  registration_date?: string;
  business_type?: string;
  industry?: string;
  website?: string;
  contact_person?: string;
  contact_person_phone?: string;
  license_number?: string;
  notes?: string;
  is_active?: boolean;
  
  // Nested data for relations (will be sent as JSON strings in form-data)
  sites?: SiteCreatePayload[];
  contacts?: ClientContactCreatePayload[];
  client_document_types?: string[]; // Document types to be uploaded for this client
  media_categories?: string[]; // Media categories for file uploads
}

/**
 * Client update payload (PUT/PATCH /clients/{id})
 * Similar to create but all fields optional
 */
export interface ClientUpdatePayload extends Partial<Omit<ClientCreatePayload, 'password'>> {
  password?: string; // Still optional for updates
}

// ==================== Query Parameters ====================

export interface ClientParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
  country?: string;
  city?: string;
  
  // Include relationships
  include_sites?: boolean;
  include_contacts?: boolean;
  include_documents?: boolean;
  include_user?: boolean;
  include_media?: boolean;
  is_active?:boolean
}

// ==================== State Management ====================

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

// ==================== API Response Types ====================



export interface PaginatedClientsResponse {
  items: Client[];
  data: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

// ==================== Component Props ====================

export interface ViewClientTopCardProps {
  client: Client;
}

// ==================== Form Types ====================

/**
 * Form values for client create/edit form
 * This can be used with form libraries like Formik or React Hook Form
 */
export interface ClientFormValues {
  // Basic Info
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  client_code?: string;
  
  // Company Info
  company_name?: string;
  tax_id?: string;
  business_type?: string;
  industry?: string;
  license_number?: string;
  website?: string;
  
  // Contact Info
  country?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  contact_person?: string;
  contact_person_phone?: string;
  
  // Additional Info
  registration_date?: string;
  currency_id?: number | null;
  notes?: string;
  is_active: boolean;
  
  // Nested data
  sites?: SiteCreatePayload[];
  contacts?: ClientContactCreatePayload[];
}

// ==================== Constants ====================

export const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'OM', name: 'Oman' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }, // Fixed from UK to GB
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  // Add more countries as needed
];

export const BUSINESS_TYPES = [
  'Limited Liability Company',
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Freelancer',
  'Government Entity',
  'Non-Profit Organization',
  'Branch Office'
];

export const INDUSTRIES = [
  'Security Services',
  'Construction',
  'Real Estate',
  'Retail',
  'Hospitality',
  'Healthcare',
  'Manufacturing',
  'Technology',
  'Finance',
  'Education',
  'Transportation',
  'Logistics',
  'Oil & Gas',
  'Government',
  'Other'
];

export const CLIENT_DOCUMENT_TYPES = [
  { id: 'trade_license', name: 'Trade License', required: true },
  { id: 'tax_certificate', name: 'Tax Certificate', required: true },
  { id: 'company_registration', name: 'Company Registration', required: true },
  { id: 'insurance_certificate', name: 'Insurance Certificate', required: false },
  { id: 'memorandum_of_association', name: 'Memorandum of Association', required: false },
  { id: 'articles_of_association', name: 'Articles of Association', required: false },
  { id: 'board_resolution', name: 'Board Resolution', required: false },
  { id: 'passport_copy', name: 'Passport Copy (Owner)', required: false },
  { id: 'visa_copy', name: 'Visa Copy', required: false },
  { id: 'authorization_letter', name: 'Authorization Letter', required: false }
];

export const SITE_DOCUMENT_TYPES = [
  { id: 'site_map', name: 'Site Map', required: true },
  { id: 'safety_plan', name: 'Safety Plan', required: true },
  { id: 'emergency_procedures', name: 'Emergency Procedures', required: true },
  { id: 'floor_plan', name: 'Floor Plan', required: false },
  { id: 'site_layout', name: 'Site Layout', required: false },
  { id: 'fire_safety', name: 'Fire Safety Certificate', required: false },
  { id: 'operating_license', name: 'Operating License', required: false },
  { id: 'access_control', name: 'Access Control Plan', required: false }
];

export const CLIENT_STATUS = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'pending', name: 'Pending' },
  { id: 'suspended', name: 'Suspended' }
] as const;

// ==================== Type Guards ====================

export function isClientContact(contact: Contact): contact is Contact {
  return contact && typeof contact === 'object' && 'id' in contact && 'name' in contact && 'phone' in contact;
}

export function isClient(client: Client): client is Client {
  return client && typeof client === 'object' && 'id' in client && 'full_name' in client && 'email' in client;
}