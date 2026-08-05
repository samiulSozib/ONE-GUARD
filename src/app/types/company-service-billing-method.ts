// types/company-service-billing-method.ts
export interface CompanyServiceBillingMethod {
  id: number;
  name: string;
  code: string;
  description: string | null;
  sort_order: number | null;
  services?: any[]|null;
  services_count?: number;
  calculation_type:string;
  is_recurring:boolean;
  requires_attendance:boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyServiceBillingMethodDto {
  name: string;
  code: string;
  description?: string | null;
  calculation_type:string;
  is_recurring:boolean;
  requires_attendance:boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCompanyServiceBillingMethodDto {
  name?: string;
  code?: string;
  description?: string | null;
  calculation_type:string;
  is_recurring:boolean;
  requires_attendance:boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface CompanyServiceBillingMethodParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CompanyServiceBillingMethodState {
  companyServiceBillingMethods: CompanyServiceBillingMethod[];
  currentCompanyServiceBillingMethod: CompanyServiceBillingMethod | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}
