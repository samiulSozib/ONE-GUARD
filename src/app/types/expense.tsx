import { ExpenseCategory } from "./expenseCategory";
import { Site } from "./site";

export interface Expense {
  id: number;
  title: string;

  amount: string;
  currency: string;


  status: "pending" | "approved" | "completed" | string;
  expense_date:string;


  created_at: string;
 

  /* ---------------- Relationships ---------------- */

  category?:Partial<ExpenseCategory>
  site?: Partial<Site>;
  description?:string
  guard_id?:number,
  site_id?:number,
  expense_category_id?:number
  

}


export interface ExpenseParams {
  page?: number;
  per_page?: number;
  search?: string;

  site_id?: number;
  category_id?:number;

  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'paid';

  include_site?: boolean | number;
  

  sort_by?: string;
  sort_order?: "asc" | "desc";
}


export interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;

  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number; // 🔥 optional
  };

  isLoading: boolean;
  error: string | null;
}



export interface ToggleExpenseStatusRequest {
  status: string;
}


/* ---------- Create Complaint DTO ---------- */
export interface CreateExpenseDto {
  title?: string;

  expense_category_id?: number;
  site_id?: number;

  guard_id?: number;

  amount?:string;
  currency?:string;

  description?: string | null;

  expense_date?: string;
  category?:Partial<ExpenseCategory>
  site?:Partial<Site>
}


