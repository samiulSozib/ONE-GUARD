// types/client-contract-service-component.ts
import { CompanyService } from './company-service';

export interface ClientContractServiceComponent {
  id: number;
  client_contract_service_id: number;
  company_service_id: number;
  quantity: number;
  included_quantity: number;
  selling_rate: number;
  internal_cost: number;
  additional_unit_rate: number | null;
  is_required: boolean;
  is_optional: boolean;
  is_included_in_parent_price: boolean;
  is_client_billable: boolean;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Relations
  company_service?: CompanyService;
}

export interface CreateClientContractServiceComponentDto {
  client_contract_service_id: number;
  company_service_id: number;
  quantity: number;
  included_quantity?: number;
  selling_rate?: number;
  internal_cost?: number;
  additional_unit_rate?: number | null;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  is_active?: boolean;
  sort_order?: number;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateClientContractServiceComponentDto {
  client_contract_service_id?: number;
  company_service_id?: number;
  quantity?: number;
  included_quantity?: number;
  selling_rate?: number;
  internal_cost?: number;
  additional_unit_rate?: number | null;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  is_active?: boolean;
  sort_order?: number;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ClientContractServiceComponentParams {
  page?: number;
  per_page?: number;
  search?: string;
  client_contract_service_id?: number;
  company_service_id?: number;
  is_active?: boolean;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ClientContractServiceComponentState {
  items: ClientContractServiceComponent[];
  currentItem: ClientContractServiceComponent | null;
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
