
export interface ExpenseCategory {
  id: number;
  name: string | null;
  description: string | null;
  
  is_active: boolean;
  created_at?: string;
}

export interface ExpenseCategoryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  
  sort_by?: 'id' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
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

export interface ToggleExpenseCategoryStatusRequest {
  is_active: boolean;
}