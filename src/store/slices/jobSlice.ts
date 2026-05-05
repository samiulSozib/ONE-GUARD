// store/slices/job.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobService } from "@/service/job.service";
import {
    Job,
    JobParams,
    JobState,
    CreateJobDto,
    UpdateJobDto,
} from "@/app/types/job";

/* ------------------ Initial State ------------------ */

const initialState: JobState = {
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

// Fetch all jobs
export const fetchJobs = createAsyncThunk(
    "job/fetchJobs",
    async (params: JobParams = {}, { rejectWithValue }) => {
        try {
            const response = await jobService.getJobs(params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch jobs";
            return rejectWithValue(message);
        }
    }
);

// Fetch single job
export const fetchJob = createAsyncThunk(
    "job/fetchJob",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await jobService.getJob(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job";
            return rejectWithValue(message);
        }
    }
);

// Create job
export const createJob = createAsyncThunk(
    "job/createJob",
    async (data: CreateJobDto, { rejectWithValue }) => {
        try {
            const response = await jobService.createJob(data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to create job";
            return rejectWithValue(message);
        }
    }
);

// Update job
export const updateJob = createAsyncThunk(
    "job/updateJob",
    async ({ id, data }: { id: number; data: UpdateJobDto }, { rejectWithValue }) => {
        try {
            const response = await jobService.updateJob(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update job";
            return rejectWithValue(message);
        }
    }
);

// Duplicate job
export const duplicateJob = createAsyncThunk(
    "job/duplicateJob",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await jobService.duplicateJob(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to duplicate job";
            return rejectWithValue(message);
        }
    }
);

// Toggle job status
export const toggleJobStatus = createAsyncThunk(
    "job/toggleStatus",
    async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
        try {
            const response = await jobService.toggleStatus(id, isActive);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to toggle job status";
            return rejectWithValue(message);
        }
    }
);

// Delete job
export const deleteJob = createAsyncThunk(
    "job/deleteJob",
    async (id: number, { rejectWithValue }) => {
        try {
            await jobService.deleteJob(id);
            return id;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete job";
            return rejectWithValue(message);
        }
    }
);

/* ------------------ Slice ------------------ */

const jobSlice = createSlice({
    name: "job",
    initialState,
    reducers: {
        clearJobError: (state) => {
            state.error = null;
        },
        clearJobSuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentJob: (state) => {
            state.currentItem = null;
        },
        setJobs: (state, action: PayloadAction<Job[]>) => {
            state.items = action.payload;
        },
        updateJobInList: (state, action: PayloadAction<Job>) => {
            const index = state.items.findIndex(
                (j) => j.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- Fetch jobs ---------- */
            .addCase(fetchJobs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.data;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch single job ---------- */
            .addCase(fetchJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Create job ---------- */
            .addCase(createJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = [action.payload.item, ...state.items];
                state.currentItem = action.payload.item;
                state.pagination.total += 1;
                state.successMessage = action.payload.message || "Job created successfully";
            })
            .addCase(createJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Update job ---------- */
            .addCase(updateJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const index = state.items.findIndex(
                    (j) => j.id === action.payload.item.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload.item;
                }
                if (state.currentItem?.id === action.payload.item.id) {
                    state.currentItem = action.payload.item;
                }
                state.successMessage = action.payload.message || "Job updated successfully";
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Duplicate job ---------- */
            .addCase(duplicateJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(duplicateJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = [action.payload.item, ...state.items];
                state.pagination.total += 1;
                state.successMessage = action.payload.message || "Job duplicated successfully";
            })
            .addCase(duplicateJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Toggle status ---------- */
            .addCase(toggleJobStatus.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(toggleJobStatus.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const index = state.items.findIndex(
                    (j) => j.id === action.payload.item.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload.item;
                }
                if (state.currentItem?.id === action.payload.item.id) {
                    state.currentItem = action.payload.item;
                }
                state.successMessage = action.payload.message || "Status updated successfully";
            })
            .addCase(toggleJobStatus.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Delete job ---------- */
            .addCase(deleteJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = state.items.filter(
                    (j) => j.id !== action.payload
                );
                if (state.currentItem?.id === action.payload) {
                    state.currentItem = null;
                }
                state.pagination.total = Math.max(
                    0,
                    state.pagination.total - 1
                );
                state.successMessage = "Job deleted successfully";
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

/* ------------------ Exports ------------------ */

export const {
    clearJobError,
    clearJobSuccess,
    clearCurrentJob,
    setJobs,
    updateJobInList,
} = jobSlice.actions;

export default jobSlice.reducer;