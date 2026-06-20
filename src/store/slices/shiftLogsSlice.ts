import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    ShiftLogState,
    GuardStatusItem,
    ShiftLog,
    ShiftLogStats,
    GuardStatusResponse,
    ShiftLogsResponse,
    GuardCurrentStatusResponse,
    AssignmentSummaryResponse,
    AssignmentLogsResponse,
    ShiftLogParams,
    GuardStatusParams
} from "@/app/types/shiftLogs";
import { shiftLogService } from "@/service/shiftLogs.service";

const initialState: ShiftLogState = {
    guardStatus: [],
    guardStatusSummary: {
        total_guards: 0,
        on_duty: 0,
        on_break: 0,
        completed: 0,
        not_assigned: 0
    },
    logs: [],
    logStats: {
        total_logs: 0,
        check_ins: 0,
        check_outs: 0,
        breaks: 0,
        patrols: 0,
        incidents: 0
    },
    currentGuardStatus: null,
    assignmentSummary: null,
    assignmentLogs: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20
    },
    isLoading: false,
    error: null,
    lastUpdated: null
};

// ============== Thunks for 5 Endpoints ==============

// Thunk 1: Fetch guards status
export const fetchGuardsStatus = createAsyncThunk(
    "shiftLogs/fetchGuardsStatus",
    async (params: GuardStatusParams, { rejectWithValue }) => {
        try {
            const response = await shiftLogService.getGuardsStatus(params);
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch guards status";
            return rejectWithValue(message);
        }
    }
);

// Thunk 2: Fetch shift logs
export const fetchShiftLogs = createAsyncThunk(
    "shiftLogs/fetchShiftLogs",
    async (params: ShiftLogParams, { rejectWithValue }) => {
        try {
            const response = await shiftLogService.getShiftLogs(params);
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch shift logs";
            return rejectWithValue(message);
        }
    }
);

// Thunk 3: Fetch guard current status
export const fetchGuardCurrentStatus = createAsyncThunk(
    "shiftLogs/fetchGuardCurrentStatus",
    async (guardId: number, { rejectWithValue }) => {
        try {
            const response = await shiftLogService.getGuardCurrentStatus(guardId);
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch guard status";
            return rejectWithValue(message);
        }
    }
);

// Thunk 4: Fetch assignment summary
export const fetchAssignmentSummary = createAsyncThunk(
    "shiftLogs/fetchAssignmentSummary",
    async (assignmentId: number, { rejectWithValue }) => {
        try {
            const response = await shiftLogService.getAssignmentSummary(assignmentId);
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch assignment summary";
            return rejectWithValue(message);
        }
    }
);

// Thunk 5: Fetch assignment logs
export const fetchAssignmentLogs = createAsyncThunk(
    "shiftLogs/fetchAssignmentLogs",
    async (payload: { assignmentId: number; params?: { page?: number; per_page?: number } }, { rejectWithValue }) => {
        try {
            const { assignmentId, params } = payload;
            const response = await shiftLogService.getAssignmentLogs(assignmentId, params);
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch assignment logs";
            return rejectWithValue(message);
        }
    }
);

// ============== Slice ==============

const shiftLogsSlice = createSlice({
    name: "shiftLogs",
    initialState,
    reducers: {
        clearShiftLogError: (state) => {
            state.error = null;
        },
        clearShiftLogs: (state) => {
            state.logs = [];
            state.pagination = {
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 20
            };
        },
        clearAssignmentData: (state) => {
            state.assignmentSummary = null;
            state.assignmentLogs = null;
        },
        clearGuardStatus: (state) => {
            state.currentGuardStatus = null;
        },
        updateGuardStatus: (state, action: PayloadAction<{ guardId: number; status: string }>) => {
            const guard = state.guardStatus.find(g => g.guard.id === action.payload.guardId);
            if (guard) {
                guard.current_status = action.payload.status as any;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // ===== Thunk 1: Fetch Guards Status =====
            .addCase(fetchGuardsStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGuardsStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.guardStatus = action.payload.guards;
                state.guardStatusSummary = action.payload.summary;
                state.lastUpdated = action.payload.last_updated;
            })
            .addCase(fetchGuardsStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Thunk 2: Fetch Shift Logs =====
            .addCase(fetchShiftLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchShiftLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.logs;
                state.logStats = action.payload.stats;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchShiftLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Thunk 3: Fetch Guard Current Status =====
            .addCase(fetchGuardCurrentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGuardCurrentStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGuardStatus = action.payload;
            })
            .addCase(fetchGuardCurrentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Thunk 4: Fetch Assignment Summary =====
            .addCase(fetchAssignmentSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignmentSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignmentSummary = action.payload;
            })
            .addCase(fetchAssignmentSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Thunk 5: Fetch Assignment Logs =====
            .addCase(fetchAssignmentLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignmentLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignmentLogs = action.payload;
            })
            .addCase(fetchAssignmentLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearShiftLogError,
    clearShiftLogs,
    clearAssignmentData,
    clearGuardStatus,
    updateGuardStatus
} = shiftLogsSlice.actions;

export default shiftLogsSlice.reducer;