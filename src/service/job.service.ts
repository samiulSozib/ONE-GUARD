// service/job.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import { 
    Job, 
    JobParams, 
    CreateJobDto, 
    UpdateJobDto 
} from "@/app/types/job";

/* =========================================================
   Jobs Service
   ========================================================= */

export const jobService = {
    /* ---------- Get all jobs ---------- */
    getJobs: (params?: JobParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: Job[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>("/admin/jobs", { params })
        ),

    /* ---------- Get single job ---------- */
    getJob: (id: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: Job }>>(
                `/admin/jobs/${id}`
            )
        ),

    /* ---------- Create job ---------- */
    createJob: (data: CreateJobDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: Job; message: string }>>(
                "/admin/jobs",
                data
            )
        ),

    /* ---------- Update job ---------- */
    updateJob: (id: number, data: UpdateJobDto) =>
        handleApiResponse(
            api.put<ApiResponse<{ item: Job; message: string }>>(
                `/admin/jobs/${id}`,
                data
            )
        ),

    /* ---------- Duplicate job ---------- */
    duplicateJob: (id: number) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: Job; message: string }>>(
                `/admin/jobs/${id}/duplicate`
            )
        ),

    /* ---------- Toggle job status ---------- */
    toggleStatus: (id: number, isActive: boolean) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: Job; message: string }>>(
                `/admin/jobs/${id}/update-status?is_active=${isActive ? 1 : 0}`
            )
        ),

    /* ---------- Delete job ---------- */
    deleteJob: (id: number) =>
        handleApiResponse(
            api.delete<ApiResponse<{ message: string }>>(
                `/admin/jobs/${id}`
            )
        ),
};