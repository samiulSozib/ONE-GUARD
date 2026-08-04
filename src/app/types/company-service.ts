// types/company-service.ts
import { CompanyServiceCategory } from './company-service-category';
import { CompanyServiceUnitType } from './company-service-unit-type';
import { CompanyServiceBillingMethod } from './company-service-billing-method';
import { CompanyServiceComponent } from './company-service-component';

export interface CompanyService {
  id: number;
  company_service_category_id: number;
  company_service_unit_type_id: number;
  company_service_billing_method_id: number;
  guard_type_id: number | null;
  currency_id: number | null;
  name: string;
  code: string;
  service_type: 'standalone' | 'package' | 'component';
  description: string | null;
  default_selling_rate: number | null;
  default_internal_cost: number | null;
  minimum_quantity: number | null;
  default_quantity: number | null;
  is_package: boolean;
  is_active: boolean;
  sort_order: number | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  category?: CompanyServiceCategory;
  unit_type?: CompanyServiceUnitType;
  billing_method?: CompanyServiceBillingMethod;
  components?: CompanyServiceComponent[];
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
  is_package?: boolean;
  is_active?: boolean;
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
