import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { ExpenseCategory, ExpenseCategoryParams } from "@/app/types/expenseCategory";

export const expenseCategoryService = {
  // Get all expenseCategorys
  getExpenseCategorys: (params?: ExpenseCategoryParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: ExpenseCategory[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/expense-categories', { params })
    ),
  
  // Get single expenseCategory
  getExpenseCategory: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<{item:ExpenseCategory}>>(`/admin/expense-categories/${id}/show`, { params })),
  
  // Create expenseCategory
  createExpenseCategory: (data: FormData | Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>) =>
    handleApiResponse(api.post<ApiResponse<{item:ExpenseCategory}>>('/admin/expense-categories', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update expenseCategory
  updateExpenseCategory: (id: number, data: FormData | Partial<ExpenseCategory>) =>
    handleApiResponse(api.put<ApiResponse<{item:ExpenseCategory}>>(`/admin/expense-categories/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete expenseCategory
  deleteExpenseCategory: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/expense-categories/${id}`)),
  
  // Toggle expenseCategory status
  toggleStatus: (id: number, is_active: boolean) =>
    handleApiResponse(api.patch<ApiResponse<ExpenseCategory>>(`/admin/expense-categories/${id}/change-status?is_active=${is_active?1:0}`)),
  


};