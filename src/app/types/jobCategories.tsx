// types/job-category.ts

export interface JobCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number | null;
    is_active: boolean;
    jobs_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateJobCategoryDto {
    name: string;
    description?: string|null;
    icon?: string;
    sort_order?: number;
}

export interface UpdateJobCategoryDto {
    name?: string;
    description?: string|null;
    icon?: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface JobCategoryParams {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
    include_site?: boolean;
    include_client?: boolean;
}

export interface JobCategoryState {
    items: JobCategory[];
    currentItem: JobCategory | null;
    activeItems: JobCategory[];
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