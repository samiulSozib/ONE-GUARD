// service/email-log.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
    EmailLog,
    EmailLogParams,
    ClearOldLogsDto,
    ClearOldLogsResponse,
} from "@/app/types/emailLog";

export const emailLogService = {
    /* ---------- Get all email logs ---------- */
    getEmailLogs: (params?: EmailLogParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: EmailLog[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>("/admin/email-logs", { params })
        ),

    

    /* ---------- Get single email log by ID ---------- */
    getEmailLog: (id: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: EmailLog }>>(
                `/admin/email-logs/${id}`
            )
        ),

    /* ---------- Clear old logs ---------- */
    clearOldLogs: (data: ClearOldLogsDto) =>
        handleApiResponse(
            api.post<ApiResponse<ClearOldLogsResponse>>(
                "/admin/email-logs/clear-old",
                data
            )
        ),

    /* ---------- Delete email log ---------- */
    deleteEmailLog: (id: number) =>
        handleApiResponse(
            api.delete<ApiResponse<{ message: string }>>(
                `/admin/email-logs/${id}`
            )
        ),

};