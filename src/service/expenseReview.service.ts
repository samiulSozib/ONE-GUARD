import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { CreateExpenseReviewDto, ExpenseReview, ExpenseReviewParams } from "@/app/types/expenseReview";
import { CreateComplaintDto } from "@/app/types/complaint";

export const expenseReviewService = {
  // Get all expenseReviews
  getExpenseReviews: (params?: ExpenseReviewParams) =>
    handleApiResponse(
      api.get<ApiResponse<{ 
        items: ExpenseReview[]; 
        data: { 
          current_page: number; 
          last_page: number; 
          total: number;
          per_page: number;
        } 
      }>>('/admin/expense-reviews', { params })
    ),
  
  // Get single expenseReview
  getExpenseReview: (id: number, params?: { include?: string[] }) =>
    handleApiResponse(api.get<ApiResponse<{item:ExpenseReview}>>(`/admin/expense-reviews/${id}/show`, { params })),
  
  // Create expenseReview
  createExpenseReview: (data: FormData | CreateExpenseReviewDto) =>
    handleApiResponse(api.post<ApiResponse<{message:string}>>('/admin/expense-reviews', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Update expenseReview
  updateExpenseReview: (id: number, data: FormData | CreateExpenseReviewDto) =>
    handleApiResponse(api.put<ApiResponse<{item:ExpenseReview}>>(`/admin/expense-reviews/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })),
  
  // Delete expenseReview
  deleteExpenseReview: (id: number) =>
    handleApiResponse(api.delete<ApiResponse<void>>(`/admin/expense-reviews/${id}`)),
  
/* ---------- Change expense review decision via query param ---------- */
  changeStatus: (
    id: number,
    decision: 'pending' | 'approved' | 'rejected' 
  ) =>
    handleApiResponse(
      api.get<ApiResponse<{message:string}>>(
        `/admin/expenses-reviews/${id}/change-decision?decision=${decision}`
      )
    ),

};