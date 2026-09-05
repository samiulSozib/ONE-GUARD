// app/types/scheduling.ts

// ============================================
// SCHEDULING SETTINGS
// ============================================

export type GenerationMode = 'immediate' | 'rolling' | 'manual';

export interface SchedulingSettings {
  id?: number;
  duty_generation_mode: GenerationMode;
  duty_generation_horizon_days: number;
  assignment_generation_mode: GenerationMode;
  assignment_generation_horizon_days: number;
  generate_duties_on_schedule_create: boolean;
  generate_assignments_on_plan_create: boolean;
  allow_manual_duty_generation: boolean;
  allow_manual_assignment_generation: boolean;
  prevent_duty_duplicates: boolean;
  prevent_assignment_duplicates: boolean;
  open_ended_duty_horizon_days: number;
  open_ended_assignment_horizon_days: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateSchedulingSettingsDto {
  duty_generation_mode?: GenerationMode;
  duty_generation_horizon_days?: number;
  assignment_generation_mode?: GenerationMode;
  assignment_generation_horizon_days?: number;
  generate_duties_on_schedule_create?: boolean;
  generate_assignments_on_plan_create?: boolean;
  allow_manual_duty_generation?: boolean;
  allow_manual_assignment_generation?: boolean;
  prevent_duty_duplicates?: boolean;
  prevent_assignment_duplicates?: boolean;
  open_ended_duty_horizon_days?: number;
  open_ended_assignment_horizon_days?: number;
  is_active?: boolean;
}

// ============================================
// GUARD ASSIGNMENT PLANS
// ============================================

export type AssignmentPlanStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface GuardAssignmentPlan {
  id: number;
  duty_schedule_id: number;
  guard_id: number;
  start_date: string;
  end_date: string | null;
  is_open_ended: boolean;
  generated_until: string | null;
  status: AssignmentPlanStatus;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  // Relationships
  duty_schedule?: {
    id: number;
    title: string;
    description?: string;
    is_active?: boolean;
    service_mode?: string;
    schedule_type?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    // ... other fields
  };
  guard?: {
    id: number;
    full_name: string;
    guard_code: string;
    email?: string;
    phone?: string;
    profile_image?: string;
    // ... other fields
  };
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  updater?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface AssignmentPlanParams {
  page?: number;
  per_page?: number;
  duty_schedule_id?: number;
  guard_id?: number;
  status?: AssignmentPlanStatus;
  is_active?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateAssignmentPlanDto {
  duty_schedule_id: number;
  guard_id: number;
  start_date: string;
  end_date?: string | null;
  is_open_ended?: boolean;
  status?: AssignmentPlanStatus;
  is_active?: boolean;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateAssignmentPlanDto {
  duty_schedule_id?: number;
  guard_id?: number;
  start_date?: string;
  end_date?: string | null;
  is_open_ended?: boolean;
  status?: AssignmentPlanStatus;
  is_active?: boolean;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ToggleAssignmentPlanStatusDto {
  is_active: boolean;
}

export interface AssignmentGenerationInfo {
  plan_id: number;
  duties_checked: number;
  assignments_created: number;
  assignments_skipped: number;
  skipped_reasons?: Record<string, string[]>;
}

export interface AssignmentPlanState {
  plans: GuardAssignmentPlan[];
  currentPlan: GuardAssignmentPlan | null;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  isLoading: boolean;
  error: string | null;
  generationInfo: AssignmentGenerationInfo | null;
}

export interface SchedulingSettingsState {
  settings: SchedulingSettings | null;
  isLoading: boolean;
  error: string | null;
}
