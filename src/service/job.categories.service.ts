// service/job-category.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
    JobCategory, 
    JobCategoryParams, 
    CreateJobCategoryDto, 
    UpdateJobCategoryDto 
} from "@/app/types/jobCategories";

/* =========================================================
   Job Category Service
   ========================================================= */

export const jobCategoryService = {
    /* ---------- Get all job categories ---------- */
    getJobCategories: (params?: JobCategoryParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: JobCategory[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>("/admin/job-categories", { params })
        ),

    /* ---------- Get single job category ---------- */
    getJobCategory: (id: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: JobCategory }>>(
                `/admin/job-categories/${id}`
            )
        ),

    /* ---------- Get active job categories ---------- */
    getActiveJobCategories: () =>
        handleApiResponse(
            api.get<ApiResponse<{ items: JobCategory[] }>>(
                "/admin/job-categories/active"
            )
        ),

    /* ---------- Create job category ---------- */
    createJobCategory: (data: CreateJobCategoryDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: JobCategory; message: string }>>(
                "/admin/job-categories",
                data
            )
        ),

    /* ---------- Update job category ---------- */
    updateJobCategory: (id: number, data: UpdateJobCategoryDto) =>
        handleApiResponse(
            api.put<ApiResponse<{ item: JobCategory; message: string }>>(
                `/admin/job-categories/${id}`,
                data
            )
        ),

    /* ---------- Toggle job category status ---------- */
    toggleStatus: (id: number, isActive: boolean) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: JobCategory; message: string }>>(
                `/admin/job-categories/${id}/update-status?is_active=${isActive ? 1 : 0}`
            )
        ),

    /* ---------- Delete job category ---------- */
    deleteJobCategory: (id: number) =>
        handleApiResponse(
            api.delete<ApiResponse<{ message: string }>>(
                `/admin/job-categories/${id}`
            )
        ),
};