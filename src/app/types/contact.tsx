export interface Contactable {
  id: number;
  user_id: number | null;
  guard_code: string | null;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  guard_type_id: number | null;
  is_active: boolean;
  rating: string | null;
  joining_date: string | null;
  contract_id: number | null;
  currency_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employee_company_card_number: string | null;
  driver_license: string | null;
  issuing_source: string | null;
  license_expiry_date: string | null;
  profile_image: string | null;
}

export interface Contact {
  id: number;
  contactable_type: 'client' | 'guard' | 'site';
  contactable_id: number;
  name: string;
  phone: string;
  email?: string;
  position?: string;
  department?: string;
  designation?: string | null;
  is_primary?: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contactable?: Contactable;
}

export interface ContactParams {
  page?: number;
  per_page?: number;
  search?: string;
  contactable_type?: string;
  contactable_id?: number;
  is_active?: boolean;
  is_primary?: boolean;
}

export interface ContactState {
  contacts: Contact[];
  currentContact: Contact | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page:number
  };
  isLoading: boolean;
  error: string | null;
}