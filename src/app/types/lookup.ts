// Expense Category
export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategoryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface ExpenseCategoryState {
  expenseCategories: ExpenseCategory[];
  currentExpenseCategory: ExpenseCategory | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Guard Type
export interface GuardType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuardTypeParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface GuardTypeState {
  guardTypes: GuardType[];
  currentGuardType: GuardType | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Duty Time Type
export interface DutyTimeType {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DutyTimeTypeParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface DutyTimeTypeState {
  dutyTimeTypes: DutyTimeType[];
  currentDutyTimeType: DutyTimeType | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Site Location (already covered in Site feature, but separate for lookup)
export interface SiteLocation {
  id: number;
  site_id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteLocationParams {
  page?: number;
  per_page?: number;
  search?: string;
  site_id?: number;
  is_active?: boolean;
  include_site?: boolean;
}

export interface SiteLocationState {
  siteLocations: SiteLocation[];
  currentSiteLocation: SiteLocation | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}