import { User } from "./api.types";

export interface ExpenseReview {
  id: number;
  remark?: string | null;
  decision?:"approved"|"rejected";
  
  created_at?: string;
  reviewer?:Partial<User>
  expense_id?:number
}

export interface ExpenseReviewParams {
  page?: number;
  per_page?: number;
  search?: string;
  decision?: string;
  
  sort_by?: 'id'  | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ExpenseReviewState {
  expenseReviews: ExpenseReview[];
  currentExpenseReview: ExpenseReview | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ToggleExpenseReviewStatusRequest {
  is_active: boolean;
}


/* ---------- Create  DTO ---------- */
export interface CreateExpenseReviewDto {

  expense_id?: number;
  

  decision?:string,
  remark?:string
}

