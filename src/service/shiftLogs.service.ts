import { ApiResponse } from "@/app/types/api.types";
import api, { handleApiResponse } from "./api.service";
import {
    GuardStatusResponse,
    ShiftLogsResponse,
    GuardCurrentStatusResponse,
    AssignmentSummaryResponse,
    AssignmentLogsResponse,
    ShiftLogParams,
    GuardStatusParams,
} from "@/app/types/shiftLogs";

export const shiftLogService = {
    // Endpoint 1: Get guard statuses (all guards with their current status)
    getGuardsStatus: (params?: GuardStatusParams) =>
        handleApiResponse(
            api.get<ApiResponse<GuardStatusResponse>>("/admin/shift-logs/guards-status", { params })
        ),

    // Endpoint 2: Get shift logs with filters
    getShiftLogs: (params?: ShiftLogParams) =>
        handleApiResponse(
            api.get<ApiResponse<ShiftLogsResponse>>("/admin/shift-logs/logs", { params })
        ),

    // Endpoint 3: Get current status of a specific guard
    getGuardCurrentStatus: (guardId: number) =>
        handleApiResponse(
            api.get<ApiResponse<GuardCurrentStatusResponse>>(
                `/admin/shift-logs/guard/${guardId}/current-status`
            )
        ),

    // Endpoint 4: Get summary of a specific assignment
    getAssignmentSummary: (assignmentId: number) =>
        handleApiResponse(
            api.get<ApiResponse<AssignmentSummaryResponse>>(
                `/admin/shift-logs/assignment/${assignmentId}/summary`
            )
        ),

    // Endpoint 5: Get assignment logs
    getAssignmentLogs: (assignmentId: number, params?: { page?: number; per_page?: number }) =>
        handleApiResponse(
            api.get<ApiResponse<AssignmentLogsResponse>>(
                `/admin/shift-logs/assignment/${assignmentId}/logs`,
                { params }
            )
        ),
};