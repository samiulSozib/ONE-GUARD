import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { Expense, ExpenseParams, CreateExpenseDto } from "@/app/types/expense";

/* =========================================================
   Expense Service
   ========================================================= */

export const expenseService = {
  /* ---------- Get all expenses ---------- */
  getExpenses: (params?: ExpenseParams) =>
    handleApiResponse(
      api.get<ApiResponse<{
        items: Expense[];
        data: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
      }>>("/admin/expenses", { params })
    ),

  /* ---------- Get single expense ---------- */
  getExpense: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(
      api.get<ApiResponse<{ item: Expense }>>(
        `/admin/expenses/${id}/show`,
        { params }
      )
    ),

  /* ---------- Create expense ---------- */
  createExpense: (
    data: FormData | CreateExpenseDto
  ) =>
    handleApiResponse(
      api.post<ApiResponse<{ item: Expense }>>(
        "/admin/expenses",
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : undefined,
        }
      )
    ),

  /* ---------- Update expense ---------- */
  updateExpense: (
    id: number,
    data: FormData | CreateExpenseDto
  ) =>
    handleApiResponse(
      api.put<ApiResponse<{ item: Expense }>>(
        `/admin/expenses/${id}`,
        data,
        {
          headers:
            data instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : undefined,
        }
      )
    ),

  /* ---------- Delete expense ---------- */
  deleteExpense: (id: number) =>
    handleApiResponse(
      api.delete<ApiResponse<void>>(
        `/admin/expenses/${id}`
      )
    ),

  /* ---------- Toggle visibility / status ---------- */
  toggleVisibility: (
    id: number,
    payload: {
      is_visible_to_client?: boolean;
      is_visible_to_guard?: boolean;
    }
  ) =>
    handleApiResponse(
      api.get<ApiResponse<Expense>>(
        `/admin/expenses/${id}/change-visibility`
      )
    ),

  /* ---------- Change expense status via query param ---------- */
  changeStatus: (
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'paid'
  ) =>
    handleApiResponse(
      api.get<ApiResponse<{message:string}>>(
        `/admin/expenses/${id}/change-status?status=${status}`
      )
    ),
};