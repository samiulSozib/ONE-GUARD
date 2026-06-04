// types/email-log.ts

export interface EmailTemplateBasic {
    id: number;
    code: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    description: string | null;
    category: string;
    is_active: boolean;
    version: string;
    created_by: number;
    updated_by: number | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmailLog {
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
    template: EmailTemplateBasic | null;
}

export interface EmailLogParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: 'pending' | 'sent' | 'failed' | 'opened';
    template_code?: string;
    recipient_email?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: 'id' | 'created_at' | 'sent_at' | 'recipient_email' | 'status';
    sort_order?: 'asc' | 'desc';
}

// export interface EmailLogStats {
//     total: number;
//     by_status: {
//         pending: number;
//         sent: number;
//         failed: number;
//         opened: number;
//     };
//     today_count: number;
//     last_7_days_count: number;
//     last_30_days_count: number;
// }

export interface ClearOldLogsDto {
    days: number;
}

export interface ClearOldLogsResponse {
    message: string;
    deleted_count: number;
}

export interface EmailLogState {
    items: EmailLog[];
    currentItem: EmailLog | null;
    // statistics: EmailLogStats | null;
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