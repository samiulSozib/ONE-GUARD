// ============== Guard Status Types ==============

export interface GuardStatus {
    id: number;
    name: string;
    employee_id: string;
    profile_image: string | null;
}

export interface GuardAssignment {
    id: number;
    guard_id: number;
    duty_id: number;
    start_date: string;
    end_date: string;
    status: "assigned" | "active" | "completed" | "cancelled";
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface GuardShiftSummary {
    total_hours: number;
    break_time: number;
    net_hours: number;
    break_count: number;
    first_checkin: string | null;
    last_checkout: string | null;
    is_shift_completed: boolean;
    formatted_total: string;
    formatted_net: string;
}

export interface GuardAttendance {
    id: number;
    check_in_time: string | null;
    check_out_time: string | null;
    total_working_minutes: number;
    formatted_hours: string;
    status: "pending" | "checked_in" | "checked_out" | "completed";
}

export interface GuardStatusItem {
    guard: GuardStatus;
    assignment: GuardAssignment | null;
    current_status: "on_duty" | "on_break" | "completed" | "not_assigned";
    is_on_break: boolean;
    last_action: string | null;
    shift_summary: GuardShiftSummary | null;
    attendance: GuardAttendance | null;
    log_count: number;
}

export interface GuardStatusResponse {
    summary: {
        total_guards: number;
        on_duty: number;
        on_break: number;
        completed: number;
        not_assigned: number;
    };
    guards: GuardStatusItem[];
    last_updated: string;
}

// ============== Shift Log Types ==============

export interface ShiftLogDuty {
    id: number;
    title: string;
    duty_date: string | null;
    start_datetime: string;
    end_datetime: string;
    site_id: number;
    site_location_id: number;
    guards_required: number;
    duty_time_type_id: number;
    duty_type: string;
    required_hours: number;
    mandatory_check_in_time: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    total_working_hours: number | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ShiftLogAssignment {
    id: number;
    guard_id: number;
    duty_id: number;
    start_date: string;
    end_date: string;
    status: "assigned" | "active" | "completed" | "cancelled";
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ShiftLogMetadata {
    device_id?: string;
    timestamp?: string;
    battery_level?: number;
    network_strength?: string;
    break_ended_at?: string;
    break_duration_minutes?: number;
}

export interface ShiftLog {
    id: number;
    guard_id: number;
    duty_id: number;
    guard_assignment_id: number;
    action: "check_in" | "check_out" | "break" | "patrol" | "incident";
    action_time: string;
    latitude: string;
    longitude: string;
    accuracy: string;
    location_address: string;
    remarks: string;
    metadata: ShiftLogMetadata;
    is_auto: boolean;
    verified: boolean;
    verified_by: number | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    guard_user: any | null;
    duty?: ShiftLogDuty;
    assignment?: ShiftLogAssignment;
}

export interface ShiftLogStats {
    total_logs: number;
    check_ins: number;
    check_outs: number;
    breaks: number;
    patrols: number;
    incidents: number;
}

export interface ShiftLogsResponse {
    stats: ShiftLogStats;
    logs: ShiftLog[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// ============== Guard Current Status Types ==============

export interface GuardCurrentStatusResponse {
    guard: {
        id: number;
        name: string;
        employee_id: string;
    };
    has_active_assignment: boolean;
    message: string;
}

// ============== Assignment Summary Types ==============

export interface AssignmentSummary {
    id: number;
    guard_name: string;
    duty_title: string;
    site_name: string;
    status: string;
}

export interface BreakDetail {
    start_time: string;
    end_time: string;
    duration_minutes: number;
    duration_formatted: string;
    break_type: string;
    location: string;
}

export interface AssignmentSummaryResponse {
    assignment: AssignmentSummary;
    shift_summary: GuardShiftSummary;
    break_details: BreakDetail[];
    break_count: number;
    incidents_reported: number;
    attendance: GuardAttendance;
    logs_count: number;
    first_action: string | null;
    last_action: string | null;
    total_breaks: number;
}

// ============== Assignment Logs Types ==============

export interface AssignmentLogsResponse {
    assignment: {
        id: number;
        guard: {
            id: number;
            name: string;
            employee_id: string;
        };
        duty: {
            id: number;
            title: string;
            site: string;
        };
        status: string;
    };
    summary: GuardShiftSummary;
    break_details: BreakDetail[];
    break_count: number;
    logs: ShiftLog[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// ============== Params Types ==============

export interface ShiftLogParams {
    page?: number;
    per_page?: number;
    search?: string;
    guard_id?: number;
    duty_id?: number;
    assignment_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
    verified?: boolean;
}

export interface GuardStatusParams {
    site_id?: number;
    duty_id?: number;
    status?: string;
}

// ============== State Types ==============

export interface ShiftLogState {
    guardStatus: GuardStatusItem[];
    guardStatusSummary: {
        total_guards: number;
        on_duty: number;
        on_break: number;
        completed: number;
        not_assigned: number;
    };
    logs: ShiftLog[];
    logStats: ShiftLogStats;
    currentGuardStatus: GuardCurrentStatusResponse | null;
    assignmentSummary: AssignmentSummaryResponse | null;
    assignmentLogs: AssignmentLogsResponse | null;
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
}