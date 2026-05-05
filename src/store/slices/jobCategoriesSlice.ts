// store/slices/jobCategory.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobCategoryService } from "@/service/job.categories.service";
import {
    JobCategory,
    JobCategoryParams,
    JobCategoryState,
    CreateJobCategoryDto,
    UpdateJobCategoryDto,
} from "@/app/types/jobCategories";

/* ------------------ Initial State ------------------ */

const initialState: JobCategoryState = {
    items: [],
    currentItem: null,
    activeItems: [],
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

// Fetch all job categories
export const fetchJobCategories = createAsyncThunk(
    "jobCategory/fetchJobCategories",
    async (params: JobCategoryParams = {}, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.getJobCategories(params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job categories";
            return rejectWithValue(message);
        }
    }
);

// Fetch single job category
export const fetchJobCategory = createAsyncThunk(
    "jobCategory/fetchJobCategory",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.getJobCategory(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job category";
            return rejectWithValue(message);
        }
    }
);

// Fetch active job categories
export const fetchActiveJobCategories = createAsyncThunk(
    "jobCategory/fetchActiveJobCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.getActiveJobCategories();
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch active job categories";
            return rejectWithValue(message);
        }
    }
);

// Create job category
export const createJobCategory = createAsyncThunk(
    "jobCategory/createJobCategory",
    async (data: CreateJobCategoryDto, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.createJobCategory(data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to create job category";
            return rejectWithValue(message);
        }
    }
);

// Update job category
export const updateJobCategory = createAsyncThunk(
    "jobCategory/updateJobCategory",
    async ({ id, data }: { id: number; data: UpdateJobCategoryDto }, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.updateJobCategory(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update job category";
            return rejectWithValue(message);
        }
    }
);

// Toggle job category status
export const toggleJobCategoryStatus = createAsyncThunk(
    "jobCategory/toggleStatus",
    async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
        try {
            const response = await jobCategoryService.toggleStatus(id, isActive);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to toggle job category status";
            return rejectWithValue(message);
        }
    }
);

// Delete job category
export const deleteJobCategory = createAsyncThunk(
    "jobCategory/deleteJobCategory",
    async (id: number, { rejectWithValue }) => {
        try {
            await jobCategoryService.deleteJobCategory(id);
            return id;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete job category";
            return rejectWithValue(message);
        }
    }
);

/* ------------------ Slice ------------------ */

const jobCategorySlice = createSlice({
    name: "jobCategory",
    initialState,
    reducers: {
        clearJobCategoryError: (state) => {
            state.error = null;
        },
        clearJobCategorySuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentJobCategory: (state) => {
            state.currentItem = null;
        },
        setJobCategories: (state, action: PayloadAction<JobCategory[]>) => {
            state.items = action.payload;
        },
        updateJobCategoryInList: (state, action: PayloadAction<JobCategory>) => {
            const index = state.items.findIndex(
                (c) => c.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- Fetch job categories ---------- */
            .addCase(fetchJobCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.data;
            })
            .addCase(fetchJobCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch single job category ---------- */
            .addCase(fetchJobCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchJobCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch active job categories ---------- */
            .addCase(fetchActiveJobCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveJobCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeItems = action.payload.items;
            })
            .addCase(fetchActiveJobCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Create job category ---------- */
            .addCase(createJobCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createJobCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = [action.payload.item, ...state.items];
                state.currentItem = action.payload.item;
                state.pagination.total += 1;
                state.successMessage = action.payload.message || "Job category created successfully";
            })
            .addCase(createJobCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Update job category ---------- */
            .addCase(updateJobCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateJobCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const index = state.items.findIndex(
                    (c) => c.id === action.payload.item.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload.item;
                }
                if (state.currentItem?.id === action.payload.item.id) {
                    state.currentItem = action.payload.item;
                }
                if (state.activeItems.findIndex(c => c.id === action.payload.item.id) !== -1) {
                    const activeIndex = state.activeItems.findIndex(c => c.id === action.payload.item.id);
                    if (activeIndex !== -1) {
                        state.activeItems[activeIndex] = action.payload.item;
                    }
                }
                state.successMessage = action.payload.message || "Job category updated successfully";
            })
            .addCase(updateJobCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Toggle status ---------- */
            .addCase(toggleJobCategoryStatus.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(toggleJobCategoryStatus.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const index = state.items.findIndex(
                    (c) => c.id === action.payload.item.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload.item;
                }
                if (state.currentItem?.id === action.payload.item.id) {
                    state.currentItem = action.payload.item;
                }
                // Update active items list
                if (action.payload.item.is_active) {
                    if (!state.activeItems.find(c => c.id === action.payload.item.id)) {
                        state.activeItems.push(action.payload.item);
                    }
                } else {
                    state.activeItems = state.activeItems.filter(c => c.id !== action.payload.item.id);
                }
                state.successMessage = action.payload.message || "Status updated successfully";
            })
            .addCase(toggleJobCategoryStatus.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Delete job category ---------- */
            .addCase(deleteJobCategory.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteJobCategory.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = state.items.filter(
                    (c) => c.id !== action.payload
                );
                state.activeItems = state.activeItems.filter(
                    (c) => c.id !== action.payload
                );
                if (state.currentItem?.id === action.payload) {
                    state.currentItem = null;
                }
                state.pagination.total = Math.max(
                    0,
                    state.pagination.total - 1
                );
                state.successMessage = "Job category deleted successfully";
            })
            .addCase(deleteJobCategory.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

/* ------------------ Exports ------------------ */

export const {
    clearJobCategoryError,
    clearJobCategorySuccess,
    clearCurrentJobCategory,
    setJobCategories,
    updateJobCategoryInList,
} = jobCategorySlice.actions;

export default jobCategorySlice.reducer;