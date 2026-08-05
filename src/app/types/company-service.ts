// types/company-service.ts
import { CompanyServiceCategory } from './company-service-category';
import { CompanyServiceUnitType } from './company-service-unit-type';
import { CompanyServiceBillingMethod } from './company-service-billing-method';
import { CompanyServiceComponent } from './company-service-component';
import { Currency } from './currency';
import { GuardType } from './guard-type';

export interface CompanyService {
  id: number;
  company_service_category_id: number;
  company_service_unit_type_id: number;
  company_service_billing_method_id: number;
  guard_type_id: number | null;
  currency_id: number | null;
  name: string;
  code: string;
  service_type: 'standalone' | 'package' | 'component' | null;
  service_kind: 'standalone' | 'package' | 'component';
  description: string | null;
  default_selling_rate: number | null;
  default_internal_cost: number | null;
  minimum_quantity: number | null;
  default_quantity: number | null;
  is_package: boolean;
  is_active: boolean;
  is_sellable: boolean;
  is_component: boolean;
  requires_guard: boolean;
  requires_shift: boolean;
  requires_attendance: boolean;
  requires_asset: boolean;
  required_certifications: string[] | null;
  restrictions: string[] | null;
  metadata: Record<string, any> | null;
  sort_order: number | null;
  notes: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  category?: CompanyServiceCategory;
  unit_type?: CompanyServiceUnitType;
  billing_method?: CompanyServiceBillingMethod;
  guard_type?: GuardType | null;
  currency?: Currency | null;
  components?: CompanyServiceComponent[];
  parent_components?: CompanyServiceComponent[];
  components_count?: number;
}

export interface CreateCompanyServiceDto {
  company_service_category_id: number;
  company_service_unit_type_id: number;
  company_service_billing_method_id: number;
  currency_id?: number | null;
  guard_type_id?: number | null;
  name: string;
  code: string;
  service_type: 'standalone' | 'package' | 'component';
  service_kind?: 'standalone' | 'package' | 'component';
  description?: string | null;
  default_selling_rate?: number | null;
  default_internal_cost?: number | null;
  minimum_quantity?: number | null;
  default_quantity?: number | null;
  is_package?: boolean;
  is_active?: boolean;
  is_sellable?: boolean;
  is_component?: boolean;
  requires_guard?: boolean;
  requires_shift?: boolean;
  requires_attendance?: boolean;
  requires_asset?: boolean;
  required_certifications?: string[] | null;
  restrictions?: string[] | null;
  metadata?: Record<string, any> | null;
  sort_order?: number | null;
  notes?: string | null;
}

export interface UpdateCompanyServiceDto {
  company_service_category_id?: number;
  company_service_unit_type_id?: number;
  company_service_billing_method_id?: number;
  currency_id?: number | null;
  guard_type_id?: number | null;
  name?: string;
  code?: string;
  service_type?: 'standalone' | 'package' | 'component';
  service_kind?: 'standalone' | 'package' | 'component';
  description?: string | null;
  default_selling_rate?: number | null;
  default_internal_cost?: number | null;
  minimum_quantity?: number | null;
  default_quantity?: number | null;
  is_package?: boolean;
  is_active?: boolean;
  is_sellable?: boolean;
  is_component?: boolean;
  requires_guard?: boolean;
  requires_shift?: boolean;
  requires_attendance?: boolean;
  requires_asset?: boolean;
  required_certifications?: string[] | null;
  restrictions?: string[] | null;
  metadata?: Record<string, any> | null;
  sort_order?: number | null;
  notes?: string | null;
}

export interface CompanyServiceParams {
  page?: number;
  per_page?: number;
  search?: string;
  company_service_category_id?: number;
  company_service_unit_type_id?: number;
  company_service_billing_method_id?: number;
  guard_type_id?: number;
  currency_id?: number;
  service_type?: 'standalone' | 'package' | 'component';
  service_kind?: 'standalone' | 'package' | 'component';
  is_package?: boolean;
  is_active?: boolean;
  is_sellable?: boolean;
  is_component?: boolean;
}

export interface CompanyServiceState {
  companyServices: CompanyService[];
  currentCompanyService: CompanyService | null;
  packageServices: CompanyService[];
  standaloneServices: CompanyService[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}
