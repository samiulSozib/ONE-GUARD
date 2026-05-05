// service/job-application.service.ts
import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
    JobApplication,
    JobApplicationParams,
    JobApplicationStats,
    UpdateApplicationStatusDto,
    ScheduleInterviewDto,
    AddNoteDto,
    ConvertToGuardDto,
    ApplicationNote,
} from "@/app/types/job-applications";

/* =========================================================
   Job Applications Service
   ========================================================= */

export const jobApplicationService = {
    /* ---------- Get all job applications ---------- */
    getJobApplications: (params?: JobApplicationParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: JobApplication[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>("/admin/job-applications", { params })
        ),

    /* ---------- Get job application statistics ---------- */
    getStatistics: () =>
        handleApiResponse(
            api.get<ApiResponse<JobApplicationStats>>(
                "/admin/job-applications/stats"
            )
        ),

    /* ---------- Get applications by job ---------- */
    getApplicationsByJob: (jobId: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ items: JobApplication[] }>>(
                `/admin/job-applications/by-job/${jobId}`
            )
        ),

    /* ---------- Get single application ---------- */
    getJobApplication: (id: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: JobApplication }>>(
                `/admin/job-applications/${id}`
            )
        ),

    /* ---------- Download resume ---------- */
    downloadResume: (id: number) =>
        handleApiResponse(
            api.get<Blob>(
                `/admin/job-applications/${id}/download-resume`,
                { responseType: 'blob' }
            )
        ),

    /* ---------- Add note to application ---------- */
    addNote: (id: number, data: AddNoteDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ message: string; note: ApplicationNote }>>(
                `/admin/job-applications/${id}/add-note`,
                data
            )
        ),

    /* ---------- Update application status ---------- */
    updateStatus: (id: number, data: UpdateApplicationStatusDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ message: string; item: JobApplication }>>(
                `/admin/job-applications/${id}/update-status`,
                data
            )
        ),

    /* ---------- Schedule interview ---------- */
    scheduleInterview: (id: number, data: ScheduleInterviewDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ message: string; interview: Interview }>>(
                `/admin/job-applications/${id}/schedule-interview`,
                data
            )
        ),

    /* ---------- Convert to guard ---------- */
    convertToGuard: (id: number, data?: ConvertToGuardDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ message: string; guard_id: number; guard_code: string }>>(
                `/admin/job-applications/${id}/convert-to-guard`,
                data || {}
            )
        ),

    /* ---------- Delete job application ---------- */
    deleteJobApplication: (id: number) =>
        handleApiResponse(
            api.delete<ApiResponse<{ message: string }>>(
                `/admin/job-applications/${id}`
            )
        ),
};