// types/job.ts

export interface JobCategory {
    id: number;
    name: string;
}

export interface CreatedBy {
    id: number;
    name: string;
}

export interface Job {
    id: number;
    title: string;
    slug: string;
    category: JobCategory;
    location: string;
    city: string | null;
    state: string | null;
    country: string;
    is_remote: boolean;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
    shift_type: string | null;
    shift_hours: string | null;
    payment_type: 'hourly' | 'salary' | 'fixed';
    min_pay_rate: string;
    max_pay_rate: string;
    pay_range: string;
    currency: string;
    is_pay_negotiable: boolean;
    pay_notes: string | null;
    benefits: string | null;
    required_certifications: string | null;
    min_experience_years: number;
    education_requirement: string | null;
    requires_drivers_license: boolean;
    requires_firearms_permit: boolean;
    requires_own_vehicle: boolean;
    description: string | null;
    responsibilities: string | null;
    requirements: string | null;
    physical_requirements: string | null;
    preferred_guard_type: string | null;
    vacancies: number;
    applicants_count: number;
    is_active: boolean;
    is_featured: boolean;
    is_urgent: boolean;
    posted_at: string;
    deadline: string;
    start_date: string | null;
    created_by?: CreatedBy;
    created_at: string;
    updated_at: string;
}

export interface CreateJobDto {
    title: string;
    category_id: number;
    location: string;
    employment_type: string;
    payment_type: string;
    min_pay_rate: number;
    max_pay_rate: number;
    description?: string;
    requirements?: string;
    vacancies: number;
    deadline: string;
    city?: string;
    state?: string;
    country?: string;
    is_remote?: boolean;
    shift_type?: string;
    shift_hours?: string;
    currency?: string;
    is_pay_negotiable?: boolean;
    pay_notes?: string;
    benefits?: string;
    required_certifications?: string;
    min_experience_years?: number;
    education_requirement?: string;
    requires_drivers_license?: boolean;
    requires_firearms_permit?: boolean;
    requires_own_vehicle?: boolean;
    responsibilities?: string;
    physical_requirements?: string;
    preferred_guard_type?: string;
    is_featured?: boolean;
    is_urgent?: boolean;
    start_date?: string;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
    is_active?: boolean;
}

export interface JobParams {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: number;
    employment_type?: string;
    payment_type?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_urgent?: boolean;
    location?: string;
    min_pay?: number;
    max_pay?: number;
    include_site?: boolean;
    include_client?: boolean;
}

export interface JobState {
    items: Job[];
    currentItem: Job | null;
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

// types/job.ts - Add these if not already present

export interface CreateJobDto {
    title: string;
    category_id: number;
    location: string;
    employment_type: string;
    payment_type: string;
    min_pay_rate: number;
    max_pay_rate: number;
    description?: string;
    requirements?: string;
    vacancies: number;
    deadline: string;
    city?: string;
    state?: string;
    country?: string;
    is_remote?: boolean;
    shift_type?: string;
    shift_hours?: string;
    currency?: string;
    is_pay_negotiable?: boolean;
    pay_notes?: string;
    benefits?: string;
    required_certifications?: string;
    min_experience_years?: number;
    education_requirement?: string;
    requires_drivers_license?: boolean;
    requires_firearms_permit?: boolean;
    requires_own_vehicle?: boolean;
    responsibilities?: string;
    physical_requirements?: string;
    preferred_guard_type?: string;
    is_featured?: boolean;
    is_urgent?: boolean;
    start_date?: string;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
    is_active?: boolean;
}