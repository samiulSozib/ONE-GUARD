// types/company-service-component.ts
import { CompanyService } from './company-service';

export interface CompanyServiceComponent {
  id: number;
  parent_company_service_id: number;
  component_company_service_id: number;
  default_quantity: number | null;
  included_quantity: number | null;
  is_required: boolean;
  is_optional: boolean;
  is_included_in_parent_price: boolean;
  is_client_billable: boolean;
  default_selling_rate: number | null;
  default_internal_cost: number | null;
  additional_unit_rate: number | null;
  sort_order: number | null;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  parent_service?: CompanyService;
  component_service?: CompanyService;
}

export interface CreateCompanyServiceComponentDto {
  parent_company_service_id: number;
  component_company_service_id: number;
  default_quantity?: number | null;
  included_quantity?: number | null;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  default_selling_rate?: number | null;
  default_internal_cost?: number | null;
  additional_unit_rate?: number | null;
  sort_order?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface UpdateCompanyServiceComponentDto {
  parent_company_service_id?: number;
  component_company_service_id?: number;
  default_quantity?: number | null;
  included_quantity?: number | null;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  default_selling_rate?: number | null;
  default_internal_cost?: number | null;
  additional_unit_rate?: number | null;
  sort_order?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface CompanyServiceComponentParams {
  page?: number;
  per_page?: number;
  search?: string;
  parent_company_service_id?: number;
  component_company_service_id?: number;
  is_required?: boolean;
  is_optional?: boolean;
  is_included_in_parent_price?: boolean;
  is_client_billable?: boolean;
  is_active?: boolean;
}

export interface CompanyServiceComponentState {
  companyServiceComponents: CompanyServiceComponent[];
  currentCompanyServiceComponent: CompanyServiceComponent | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}
