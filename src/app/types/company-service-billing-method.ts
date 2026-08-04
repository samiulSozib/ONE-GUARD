// types/company-service-billing-method.ts
export interface CompanyServiceBillingMethod {
  id: number;
  name: string;
  code: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
  services_count?: number;
  created_at?: string;
  updated_at?: string;
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
