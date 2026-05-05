// types/job-application.ts

export interface JobApplication {
    id: number;
    career_job_id: number;
    job_title: string | null;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    years_experience: number;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
    status_text: string;
    status_color: string;
    rating: number | null;
    created_at: string;
    updated_at?: string;
    has_resume: boolean;
    resume_url?: string;
    notes?: ApplicationNote[];
    interviews?: Interview[];
    cover_letter?: string;
    portfolio_url?: string;
    linkedin_url?: string;
}

export interface ApplicationNote {
    id: number;
    application_id: number;
    note: string;
    created_by: string;
    created_at: string;
}

export interface Interview {
    id: number;
    application_id: number;
    interview_date: string;
    notes: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

export interface JobApplicationStats {
    total_applications: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
}

export interface JobApplicationParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    career_job_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface UpdateApplicationStatusDto {
    status: string;
    note?: string;
}

export interface ScheduleInterviewDto {
    interview_date: string;
    notes?: string;
}

export interface AddNoteDto {
    note: string;
}

export interface ConvertToGuardDto {
    guard_code?: string;
    phone?: string;
    address?: string;
}

export interface JobApplicationState {
    items: JobApplication[];
    currentItem: JobApplication | null;
    statistics: JobApplicationStats | null;
    applicationsByJob: JobApplication[];
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