// types/client-contract-service.ts
import { CompanyService } from './company-service';
import { Site } from './site';
import { SiteLocation } from './siteLocation.types';
import { CompanyServiceBillingMethod } from './company-service-billing-method';
import { Currency } from './currency';
import { ClientContractServiceComponent } from '@/app/types/client-contract-service-component';

export interface ClientContractService {
  id: number;
  client_contract_site_id: number;
  company_service_id: number;
  site_location_id: number | null;
  company_service_billing_method_id: number;
  currency_id: number;
  pricing_type: 'hourly' | 'quantity_rate' | 'fixed' | string;
  quantity: number;
  selling_rate: number;
  internal_cost: number;
  fixed_amount: number | null;
  minimum_billable_quantity: number | null;
  overtime_rate: number | null;
  holiday_rate: number | null;
  night_rate: number | null;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  is_package: boolean;
  requires_attendance: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  components_count?: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Relations
  company_service?: CompanyService;
  contract_site?: {
    id: number;
    client_contract_id: number;
    site_id: number;
    guards_required: number;
    site_specific_rate: number | null;
    is_primary: boolean;
    is_active: boolean;
  };
  site_location?: SiteLocation | null;
  billing_method?: CompanyServiceBillingMethod;
  currency?: Currency;
  components?: ClientContractServiceComponent[];
}

export interface CreateClientContractServiceDto {
  client_contract_site_id: number;
  company_service_id: number;
  site_location_id?: number | null;
  company_service_billing_method_id: number;
  currency_id: number;
  pricing_type: 'hourly' | 'quantity_rate' | 'fixed' | string;
  quantity: number;
  selling_rate: number;
  internal_cost: number;
  fixed_amount?: number | null;
  minimum_billable_quantity?: number | null;
  overtime_rate?: number | null;
  holiday_rate?: number | null;
  night_rate?: number | null;
  discount_type?: 'percentage' | 'fixed' | null;
  discount_value?: number | null;
  requires_attendance?: boolean;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateClientContractServiceDto {
  client_contract_site_id?: number;
  company_service_id?: number;
  site_location_id?: number | null;
  company_service_billing_method_id?: number;
  currency_id?: number;
  pricing_type?: 'hourly' | 'quantity_rate' | 'fixed' | string;
  quantity?: number;
  selling_rate?: number;
  internal_cost?: number;
  fixed_amount?: number | null;
  minimum_billable_quantity?: number | null;
  overtime_rate?: number | null;
  holiday_rate?: number | null;
  night_rate?: number | null;
  discount_type?: 'percentage' | 'fixed' | null;
  discount_value?: number | null;
  requires_attendance?: boolean;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ClientContractServiceParams {
  page?: number;
  per_page?: number;
  search?: string;
  client_contract_site_id?: number;
  company_service_id?: number;
  client_contract_id?: number;
  site_id?: number;
  is_active?: boolean;
  is_package?: boolean;
  include_site?: boolean;
  include_client?: boolean;
  include_components?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ClientContractServiceState {
  items: ClientContractService[];
  currentItem: ClientContractService | null;
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
