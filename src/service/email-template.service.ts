// service/email-template.service.ts

import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
    EmailTemplate,
    EmailTemplateParams,
    EmailTemplateStats,
    CreateEmailTemplateDto,
    UpdateEmailTemplateDto,
    PreviewEmailDto,
    PreviewEmailResponse,
    SendTestEmailDto,
    SendTestEmailResponse,
    EmailTemplateLog,
    EmailTemplateLogParams,
} from "@/app/types/email-template";

export const emailTemplateService = {
    /* ---------- Get all email templates ---------- */
    getEmailTemplates: (params?: EmailTemplateParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: EmailTemplate[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>("/admin/email-templates", { params })
        ),

    /* ---------- Get email template statistics ---------- */
    getStatistics: () =>
        handleApiResponse(
            api.get<ApiResponse<EmailTemplateStats>>(
                "/admin/email-templates/stats"
            )
        ),

    /* ---------- Get single email template by ID ---------- */
    getEmailTemplate: (id: number) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: EmailTemplate }>>(
                `/admin/email-templates/${id}`
            )
        ),

    /* ---------- Get email template by code ---------- */
    getEmailTemplateByCode: (code: string) =>
        handleApiResponse(
            api.get<ApiResponse<{ item: EmailTemplate }>>(
                `/admin/email-templates/by-code/${code}`
            )
        ),

    /* ---------- Create email template ---------- */
    createEmailTemplate: (data: CreateEmailTemplateDto) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: EmailTemplate; message: string }>>(
                "/admin/email-templates",
                data
            )
        ),

    /* ---------- Update email template ---------- */
    updateEmailTemplate: (id: number, data: UpdateEmailTemplateDto) =>
        handleApiResponse(
            api.put<ApiResponse<{ item: EmailTemplate; message: string }>>(
                `/admin/email-templates/${id}`,
                data
            )
        ),

    /* ---------- Delete email template ---------- */
    deleteEmailTemplate: (id: number) =>
        handleApiResponse(
            api.delete<ApiResponse<{ message: string }>>(
                `/admin/email-templates/${id}`
            )
        ),

    /* ---------- Preview email template ---------- */
    previewEmailTemplate: (id: number, data: PreviewEmailDto) =>
        handleApiResponse(
            api.post<ApiResponse<PreviewEmailResponse>>(
                `/admin/email-templates/${id}/preview`,
                data
            )
        ),

    /* ---------- Send test email ---------- */
    sendTestEmail: (id: number, data: SendTestEmailDto) =>
        handleApiResponse(
            api.post<ApiResponse<SendTestEmailResponse>>(
                `/admin/email-templates/${id}/test`,
                data
            )
        ),

    /* ---------- Get email template logs ---------- */
    getEmailTemplateLogs: (id: number, params?: EmailTemplateLogParams) =>
        handleApiResponse(
            api.get<ApiResponse<{
                items: EmailTemplateLog[];
                data: {
                    current_page: number;
                    last_page: number;
                    total: number;
                    per_page: number;
                };
            }>>(`/admin/email-templates/${id}/logs`, { params })
        ),

    /* ---------- Toggle template status ---------- */
    toggleTemplateStatus: (id: number) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: EmailTemplate; message: string }>>(
                `/admin/email-templates/${id}/toggle-status`
            )
        ),

    /* ---------- Duplicate template ---------- */
    duplicateTemplate: (id: number, newCode: string) =>
        handleApiResponse(
            api.post<ApiResponse<{ item: EmailTemplate; message: string }>>(
                `/admin/email-templates/${id}/duplicate`,
                { code: newCode }
            )
        ),
};