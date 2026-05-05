// store/slices/jobApplication.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobApplicationService } from "@/service/job.applications.service";
import {
    JobApplication,
    JobApplicationParams,
    JobApplicationState,
    JobApplicationStats,
    UpdateApplicationStatusDto,
    ScheduleInterviewDto,
    AddNoteDto,
    ConvertToGuardDto,
} from "@/app/types/job-applications";

/* ------------------ Initial State ------------------ */

const initialState: JobApplicationState = {
    items: [],
    currentItem: null,
    statistics: null,
    applicationsByJob: [],
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

// Fetch all job applications
export const fetchJobApplications = createAsyncThunk(
    "jobApplication/fetchJobApplications",
    async (params: JobApplicationParams = {}, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.getJobApplications(params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job applications";
            return rejectWithValue(message);
        }
    }
);

// Fetch job application statistics
export const fetchJobApplicationStats = createAsyncThunk(
    "jobApplication/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.getStatistics();
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch statistics";
            return rejectWithValue(message);
        }
    }
);

// Fetch applications by job
export const fetchApplicationsByJob = createAsyncThunk(
    "jobApplication/fetchByJob",
    async (jobId: number, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.getApplicationsByJob(jobId);
            return { jobId, items: response.items };
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch applications for this job";
            return rejectWithValue(message);
        }
    }
);

// Fetch single job application
export const fetchJobApplication = createAsyncThunk(
    "jobApplication/fetchJobApplication",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.getJobApplication(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job application";
            return rejectWithValue(message);
        }
    }
);

// Download resume
export const downloadResume = createAsyncThunk(
    "jobApplication/downloadResume",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.downloadResume(id);

            // Create a blob URL and trigger download
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to download resume";
            return rejectWithValue(message);
        }
    }
);

// Add note to application
export const addNote = createAsyncThunk(
    "jobApplication/addNote",
    async ({ id, data }: { id: number; data: AddNoteDto }, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.addNote(id, data);
            return { id, response };
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add note";
            return rejectWithValue(message);
        }
    }
);

// Update application status
export const updateApplicationStatus = createAsyncThunk(
    "jobApplication/updateStatus",
    async ({ id, data }: { id: number; data: UpdateApplicationStatusDto }, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.updateStatus(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update status";
            return rejectWithValue(message);
        }
    }
);

// Schedule interview
export const scheduleInterview = createAsyncThunk(
    "jobApplication/scheduleInterview",
    async ({ id, data }: { id: number; data: ScheduleInterviewDto }, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.scheduleInterview(id, data);
            return { id, response };
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to schedule interview";
            return rejectWithValue(message);
        }
    }
);

// Convert to guard
export const convertToGuard = createAsyncThunk(
    "jobApplication/convertToGuard",
    async ({ id, data }: { id: number; data?: ConvertToGuardDto }, { rejectWithValue }) => {
        try {
            const response = await jobApplicationService.convertToGuard(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to convert to guard";
            return rejectWithValue(message);
        }
    }
);

// Delete job application
export const deleteJobApplication = createAsyncThunk(
    "jobApplication/deleteJobApplication",
    async (id: number, { rejectWithValue }) => {
        try {
            await jobApplicationService.deleteJobApplication(id);
            return id;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete job application";
            return rejectWithValue(message);
        }
    }
);

/* ------------------ Slice ------------------ */

const jobApplicationSlice = createSlice({
    name: "jobApplication",
    initialState,
    reducers: {
        clearJobApplicationError: (state) => {
            state.error = null;
        },
        clearJobApplicationSuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentApplication: (state) => {
            state.currentItem = null;
        },
        clearApplicationsByJob: (state) => {
            state.applicationsByJob = [];
        },
        updateApplicationInList: (state, action: PayloadAction<JobApplication>) => {
            const index = state.items.findIndex(
                (app) => app.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.currentItem?.id === action.payload.id) {
                state.currentItem = action.payload;
            }
            const jobIndex = state.applicationsByJob.findIndex(
                (app) => app.id === action.payload.id
            );
            if (jobIndex !== -1) {
                state.applicationsByJob[jobIndex] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- Fetch job applications ---------- */
            .addCase(fetchJobApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.data;
            })
            .addCase(fetchJobApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch statistics ---------- */
            .addCase(fetchJobApplicationStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobApplicationStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchJobApplicationStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch applications by job ---------- */
            .addCase(fetchApplicationsByJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationsByJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applicationsByJob = action.payload.items;
            })
            .addCase(fetchApplicationsByJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch single application ---------- */
            .addCase(fetchJobApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchJobApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Update status ---------- */
            .addCase(updateApplicationStatus.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const updatedItem = action.payload.item;

                // Update in items list
                const index = state.items.findIndex(
                    (app) => app.id === updatedItem.id
                );
                if (index !== -1) {
                    state.items[index] = updatedItem;
                }

                // Update current item if it's the same
                if (state.currentItem?.id === updatedItem.id) {
                    state.currentItem = updatedItem;
                }

                // Update in applicationsByJob list
                const jobIndex = state.applicationsByJob.findIndex(
                    (app) => app.id === updatedItem.id
                );
                if (jobIndex !== -1) {
                    state.applicationsByJob[jobIndex] = updatedItem;
                }

                // Update statistics if needed
                if (state.statistics) {
                    const oldStatus = state.items.find(app => app.id === updatedItem.id)?.status;
                    if (oldStatus && oldStatus !== updatedItem.status) {
                        // Decrement old status count
                        if (oldStatus === 'pending') state.statistics.pending--;
                        else if (oldStatus === 'reviewed') state.statistics.reviewed--;
                        else if (oldStatus === 'shortlisted') state.statistics.shortlisted--;
                        else if (oldStatus === 'interviewed') state.statistics.interviewed--;
                        else if (oldStatus === 'hired') state.statistics.hired--;
                        else if (oldStatus === 'rejected') state.statistics.rejected--;

                        // Increment new status count
                        if (updatedItem.status === 'pending') state.statistics.pending++;
                        else if (updatedItem.status === 'reviewed') state.statistics.reviewed++;
                        else if (updatedItem.status === 'shortlisted') state.statistics.shortlisted++;
                        else if (updatedItem.status === 'interviewed') state.statistics.interviewed++;
                        else if (updatedItem.status === 'hired') state.statistics.hired++;
                        else if (updatedItem.status === 'rejected') state.statistics.rejected++;
                    }
                }

                state.successMessage = action.payload.message || "Status updated successfully";
            })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Add note ---------- */
            .addCase(addNote.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(addNote.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.successMessage = action.payload.response.message || "Note added successfully";
            })
            .addCase(addNote.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Schedule interview ---------- */
            .addCase(scheduleInterview.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(scheduleInterview.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.successMessage = action.payload.response.message || "Interview scheduled successfully";
            })
            .addCase(scheduleInterview.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Convert to guard ---------- */
            .addCase(convertToGuard.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(convertToGuard.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.successMessage = action.payload.message || "Applicant converted to guard successfully";
            })
            .addCase(convertToGuard.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Delete application ---------- */
            .addCase(deleteJobApplication.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteJobApplication.fulfilled, (state, action) => {
                state.isSubmitting = false;

                // Get the deleted application to update statistics
                const deletedApp = state.items.find(app => app.id === action.payload);
                if (deletedApp && state.statistics) {
                    if (deletedApp.status === 'pending') state.statistics.pending--;
                    else if (deletedApp.status === 'reviewed') state.statistics.reviewed--;
                    else if (deletedApp.status === 'shortlisted') state.statistics.shortlisted--;
                    else if (deletedApp.status === 'interviewed') state.statistics.interviewed--;
                    else if (deletedApp.status === 'hired') state.statistics.hired--;
                    else if (deletedApp.status === 'rejected') state.statistics.rejected--;
                    state.statistics.total_applications--;
                }

                state.items = state.items.filter(
                    (app) => app.id !== action.payload
                );
                state.applicationsByJob = state.applicationsByJob.filter(
                    (app) => app.id !== action.payload
                );
                if (state.currentItem?.id === action.payload) {
                    state.currentItem = null;
                }
                state.pagination.total = Math.max(
                    0,
                    state.pagination.total - 1
                );
                state.successMessage = "Application deleted successfully";
            })
            .addCase(deleteJobApplication.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

/* ------------------ Exports ------------------ */

export const {
    clearJobApplicationError,
    clearJobApplicationSuccess,
    clearCurrentApplication,
    clearApplicationsByJob,
    updateApplicationInList,
} = jobApplicationSlice.actions;

export default jobApplicationSlice.reducer;