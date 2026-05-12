// types/job-application.ts

export interface JobApplication {
    id: number;
    career_job_id: number;
    job_title: string | null;
    tracking_code: string;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    is_legally_authorized: boolean;
    requires_sponsorship: boolean;
    work_authorization_confirmed: boolean;
    job_reference_number: string | null;
    desired_pay_range: string | null;
    days_available: string[] | null;
    days_available_formatted: string | null;
    shift_preference: string | null;
    shift_preference_label: string | null;
    available_for_overtime: boolean;
    available_start_date: string | null;
    years_experience: number;
    current_employer: string | null;
    current_position: string | null;
    most_recent_employer_supervisor: string | null;
    most_recent_employer_supervisor_phone: string | null;
    previous_employer_supervisor: string | null;
    previous_employer_supervisor_phone: string | null;
    highest_education: string | null;
    highest_education_label: string | null;
    school_name: string | null;
    degree_certification: string | null;
    education_other: string | null;
    has_guard_card: boolean;
    guard_card_number: string | null;
    guard_card_expiry: string | null;
    has_firearms_permit: boolean;
    firearms_permit_number: string | null;
    firearms_permit_expiry: string | null;
    has_cpr_certification: boolean;
    cpr_expiry: string | null;
    has_drivers_license: boolean;
    drivers_license_number: string | null;
    driver_license_state: string | null;
    certifications: string | string[] | null;
    other_certifications: string | null;
    has_criminal_conviction: boolean;
    criminal_explanation: string | null;
    can_perform_essential_duties: boolean;
    consents_to_drug_testing: boolean;
    security_skills: string | string[] | null;
    physical_capabilities: string | string[] | null;
    professional_traits: string | string[] | null;
    reliable_transportation: boolean;
    additional_qualifications: string | null;
    cover_letter: string | null;
    additional_info: string | null;
    expected_hourly_rate: string | null;
    expected_monthly_salary: string | null;
    currency: string;
    notice_period_days: number;
    references: string | Reference[] | null;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
    status_text: string;
    status_color: string;
    admin_notes: string | null;
    rating: number | null;
    reviewed_by: number | null;
    reviewer_name: string;
    reviewed_at: string | null;
    interview_date: string | null;
    interview_notes: string | null;
    offered_rate: string | null;
    offered_payment_type: string | null;
    offer_sent_at: string | null;
    offer_accepted_at: string | null;
    converted_to_guard_id: number | null;
    converted_guard: GuardInfo | null;
    converted_at: string | null;
    has_resume: boolean;
    resume_url: string | null;
    additional_documents: string | null;
    source: string | null;
    referral_code: string | null;
    notes?: ApplicationNote[];
    interviews?: Interview[];
    created_at: string;
    updated_at: string;
    location?:string;
    old_status?:string;
    new_status?:string;
}

export interface Reference {
    name: string;
    phone: string;
    relationship: string;
}

export interface GuardInfo {
    id: number;
    name: string;
    email: string;
    phone: string;
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

// Update the JobApplicationStats interface
export interface JobApplicationStats {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    hired: number;
    rejected: number;
    converted_to_guard: number;
    by_job: JobStats[];
}

export interface JobStats {
    job_title: string;
    count: number;
}

// Keep the old interface for backward compatibility if needed
export interface JobApplicationStatsV1 {
    total_applications: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
}