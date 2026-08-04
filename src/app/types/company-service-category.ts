// types/company-service-category.ts
export interface CompanyServiceCategory {
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

export interface CompanyServiceCategoryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CompanyServiceCategoryState {
  companyServiceCategories: CompanyServiceCategory[];
  currentCompanyServiceCategory: CompanyServiceCategory | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}
