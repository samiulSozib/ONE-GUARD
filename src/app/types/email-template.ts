// types/email-template.ts

export interface EmailTemplate {
    id: number;
    code: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    description: string | null;
    category: EmailTemplateCategory;
    is_active: boolean;
    version: string;
    created_by: number | UserInfo;
    updated_by: number | UserInfo | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    logs_count?: number;
}

export interface UserInfo {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export type EmailTemplateCategory = 'guard' | 'client' | 'job' | 'system' | 'general';

export interface EmailTemplateStats {
    total: number;
    active: number;
    by_category: {
        guard: number;
        client: number;
        job: number;
        system: number;
        general: number;
    };
}

export interface EmailTemplateParams {
    page?: number;
    per_page?: number;
    search?: string;
    category?: EmailTemplateCategory;
    is_active?: boolean;
    sort_by?: 'id' | 'name' | 'code' | 'category' | 'created_at' | 'updated_at';
    sort_order?: 'asc' | 'desc';
}

export interface CreateEmailTemplateDto {
    code: string;
    name: string;
    subject: string;
    body: string;
    variables?: string[];
    description?: string;
    category?: EmailTemplateCategory;
    is_active?: boolean;
}

export interface UpdateEmailTemplateDto {
    name?: string;
    subject?: string;
    body?: string;
    variables?: string[];
    description?: string;
    category?: EmailTemplateCategory;
    is_active?: boolean;
}

export interface PreviewEmailDto {
    variables: Record<string, string>;
}

export interface PreviewEmailResponse {
    subject: string;
    body: string;
}

export interface SendTestEmailDto {
    test_email: string;
    variables: Record<string, string>;
}

export interface SendTestEmailResponse {
    message: string;
}

export interface EmailTemplateLog {
    id: number;
    template_code: string;
    recipient_email: string;
    recipient_name: string | null;
    subject: string;
    body: string;
    variables: Record<string, any>;
    attachments: string | null;
    status: 'pending' | 'sent' | 'failed' | 'opened';
    error_message: string | null;
    message_id: string | null;
    ip_address: string;
    user_agent: string;
    sent_at: string | null;
    opened_at: string | null;
    tracking_data: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmailTemplateLogParams {
    page?: number;
    per_page?: number;
    template_id?: number;
    status?: string;
}

export interface EmailTemplateState {
    items: EmailTemplate[];
    currentItem: EmailTemplate | null;
    statistics: EmailTemplateStats | null;
    logs: EmailTemplateLog[];
    logsPagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    successMessage: string | null;
}