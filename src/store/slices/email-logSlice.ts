// store/slices/emailLog.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { emailLogService } from "@/service/email-log.service";
import {
    EmailLog,
    EmailLogParams,
    EmailLogState,
    ClearOldLogsDto,
} from "@/app/types/emailLog";

/* ------------------ Initial State ------------------ */

const initialState: EmailLogState = {
    items: [],
    currentItem: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
    },
    isLoading: false,
    isSubmitting: false,
    error: null,
    successMessage: null,
};

/* ------------------ Thunks ------------------ */

// Fetch all email logs
export const fetchEmailLogs = createAsyncThunk(
    "emailLog/fetchEmailLogs",
    async (params: EmailLogParams = {}, { rejectWithValue }) => {
        try {
            const response = await emailLogService.getEmailLogs(params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email logs";
            return rejectWithValue(message);
        }
    }
);



// Fetch single email log
export const fetchEmailLog = createAsyncThunk(
    "emailLog/fetchEmailLog",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await emailLogService.getEmailLog(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email log";
            return rejectWithValue(message);
        }
    }
);

// Clear old logs
export const clearOldLogs = createAsyncThunk(
    "emailLog/clearOldLogs",
    async (data: ClearOldLogsDto, { rejectWithValue }) => {
        try {
            const response = await emailLogService.clearOldLogs(data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to clear old logs";
            return rejectWithValue(message);
        }
    }
);

// Delete email log
export const deleteEmailLog = createAsyncThunk(
    "emailLog/deleteEmailLog",
    async (id: number, { rejectWithValue }) => {
        try {
            await emailLogService.deleteEmailLog(id);
            return id;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete email log";
            return rejectWithValue(message);
        }
    }
);




/* ------------------ Slice ------------------ */

const emailLogSlice = createSlice({
    name: "emailLog",
    initialState,
    reducers: {
        clearEmailLogError: (state) => {
            state.error = null;
        },
        clearEmailLogSuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentLog: (state) => {
            state.currentItem = null;
        },
        clearLogs: (state) => {
            state.items = [];
            state.pagination = {
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 10,
            };
        },
        updateLogInList: (state, action: PayloadAction<EmailLog>) => {
            const index = state.items.findIndex(
                (log) => log.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.currentItem?.id === action.payload.id) {
                state.currentItem = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- Fetch email logs ---------- */
            .addCase(fetchEmailLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.data;
            })
            .addCase(fetchEmailLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            

            /* ---------- Fetch single log ---------- */
            .addCase(fetchEmailLog.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailLog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchEmailLog.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Clear old logs ---------- */
            .addCase(clearOldLogs.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(clearOldLogs.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.successMessage = action.payload.message || "Old logs cleared successfully";
                
                // Update statistics if available
                // if (state.statistics) {
                //     if (action.payload.deleted_count) {
                //         state.statistics.total = Math.max(0, state.statistics.total - action.payload.deleted_count);
                //     }
                // }
            })
            .addCase(clearOldLogs.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Delete log ---------- */
            .addCase(deleteEmailLog.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteEmailLog.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = state.items.filter(
                    (log) => log.id !== action.payload
                );
                if (state.currentItem?.id === action.payload) {
                    state.currentItem = null;
                }
                state.pagination.total = Math.max(0, state.pagination.total - 1);
                // if (state.statistics) {
                //     state.statistics.total = Math.max(0, state.statistics.total - 1);
                // }
                state.successMessage = "Email log deleted successfully";
            })
            .addCase(deleteEmailLog.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

           

           
    },
});

/* ------------------ Exports ------------------ */

export const {
    clearEmailLogError,
    clearEmailLogSuccess,
    clearCurrentLog,
    clearLogs,
    updateLogInList,
} = emailLogSlice.actions;

export default emailLogSlice.reducer;