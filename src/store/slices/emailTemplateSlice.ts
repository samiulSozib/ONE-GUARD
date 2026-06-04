// store/slices/emailTemplate.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { emailTemplateService } from "@/service/email-template.service";
import {
    EmailTemplate,
    EmailTemplateParams,
    EmailTemplateState,
    EmailTemplateStats,
    CreateEmailTemplateDto,
    UpdateEmailTemplateDto,
    PreviewEmailDto,
    SendTestEmailDto,
    EmailTemplateLog,
    EmailTemplateCategory,
} from "@/app/types/email-template";

/* ------------------ Initial State ------------------ */

const initialState: EmailTemplateState = {
    items: [],
    currentItem: null,
    statistics: null,
    logs: [],
    logsPagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
    },
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

// Fetch all email templates
export const fetchEmailTemplates = createAsyncThunk(
    "emailTemplate/fetchEmailTemplates",
    async (params: EmailTemplateParams = {}, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.getEmailTemplates(params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email templates";
            return rejectWithValue(message);
        }
    }
);

// Fetch email template statistics
export const fetchEmailTemplateStats = createAsyncThunk(
    "emailTemplate/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.getStatistics();
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

// Fetch single email template by ID
export const fetchEmailTemplate = createAsyncThunk(
    "emailTemplate/fetchEmailTemplate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.getEmailTemplate(id);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email template";
            return rejectWithValue(message);
        }
    }
);

// Fetch email template by code
export const fetchEmailTemplateByCode = createAsyncThunk(
    "emailTemplate/fetchEmailTemplateByCode",
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.getEmailTemplateByCode(code);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email template by code";
            return rejectWithValue(message);
        }
    }
);

// Create email template
export const createEmailTemplate = createAsyncThunk(
    "emailTemplate/createEmailTemplate",
    async (data: CreateEmailTemplateDto, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.createEmailTemplate(data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to create email template";
            return rejectWithValue(message);
        }
    }
);

// Update email template
export const updateEmailTemplate = createAsyncThunk(
    "emailTemplate/updateEmailTemplate",
    async ({ id, data }: { id: number; data: UpdateEmailTemplateDto }, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.updateEmailTemplate(id, data);
            return { id, response };
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update email template";
            return rejectWithValue(message);
        }
    }
);

// Delete email template
export const deleteEmailTemplate = createAsyncThunk(
    "emailTemplate/deleteEmailTemplate",
    async (id: number, { rejectWithValue }) => {
        try {
            await emailTemplateService.deleteEmailTemplate(id);
            return id;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete email template";
            return rejectWithValue(message);
        }
    }
);

// Preview email template
export const previewEmailTemplate = createAsyncThunk(
    "emailTemplate/previewEmailTemplate",
    async ({ id, data }: { id: number; data: PreviewEmailDto }, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.previewEmailTemplate(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to preview email template";
            return rejectWithValue(message);
        }
    }
);

// Send test email
export const sendTestEmail = createAsyncThunk(
    "emailTemplate/sendTestEmail",
    async ({ id, data }: { id: number; data: SendTestEmailDto }, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.sendTestEmail(id, data);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to send test email";
            return rejectWithValue(message);
        }
    }
);

// Fetch email template logs
export const fetchEmailTemplateLogs = createAsyncThunk(
    "emailTemplate/fetchEmailTemplateLogs",
    async ({ id, params }: { id: number; params?: { page?: number; per_page?: number } }, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.getEmailTemplateLogs(id, params);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch email template logs";
            return rejectWithValue(message);
        }
    }
);

// Toggle template status
export const toggleTemplateStatus = createAsyncThunk(
    "emailTemplate/toggleTemplateStatus",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.toggleTemplateStatus(id);
            return { id, response };
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to toggle template status";
            return rejectWithValue(message);
        }
    }
);

// Duplicate template
export const duplicateTemplate = createAsyncThunk(
    "emailTemplate/duplicateTemplate",
    async ({ id, newCode }: { id: number; newCode: string }, { rejectWithValue }) => {
        try {
            const response = await emailTemplateService.duplicateTemplate(id, newCode);
            return response;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to duplicate template";
            return rejectWithValue(message);
        }
    }
);

/* ------------------ Slice ------------------ */

const emailTemplateSlice = createSlice({
    name: "emailTemplate",
    initialState,
    reducers: {
        clearEmailTemplateError: (state) => {
            state.error = null;
        },
        clearEmailTemplateSuccess: (state) => {
            state.successMessage = null;
        },
        clearCurrentTemplate: (state) => {
            state.currentItem = null;
        },
        clearLogs: (state) => {
            state.logs = [];
            state.logsPagination = {
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 10,
            };
        },
        updateTemplateInList: (state, action: PayloadAction<EmailTemplate>) => {
            const index = state.items.findIndex(
                (template) => template.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.currentItem?.id === action.payload.id) {
                state.currentItem = action.payload;
            }
        },
        setCurrentTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
            state.currentItem = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            /* ---------- Fetch email templates ---------- */
            .addCase(fetchEmailTemplates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.data;
            })
            .addCase(fetchEmailTemplates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch statistics ---------- */
            .addCase(fetchEmailTemplateStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailTemplateStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchEmailTemplateStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch single template ---------- */
            .addCase(fetchEmailTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchEmailTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch template by code ---------- */
            .addCase(fetchEmailTemplateByCode.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailTemplateByCode.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentItem = action.payload.item;
            })
            .addCase(fetchEmailTemplateByCode.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Create template ---------- */
            .addCase(createEmailTemplate.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createEmailTemplate.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items.unshift(action.payload.item);
                state.pagination.total++;
                state.successMessage = action.payload.message || "Email template created successfully";
            })
            .addCase(createEmailTemplate.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Update template ---------- */
            .addCase(updateEmailTemplate.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateEmailTemplate.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const { id, response } = action.payload;
                
                // Update in items list
                const index = state.items.findIndex((item) => item.id === id);
                if (index !== -1) {
                    state.items[index] = response.item;
                }
                
                // Update current item if it's the same
                if (state.currentItem?.id === id) {
                    state.currentItem = response.item;
                }
                
                state.successMessage = response.message || "Email template updated successfully";
            })
            .addCase(updateEmailTemplate.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Delete template ---------- */
            .addCase(deleteEmailTemplate.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(deleteEmailTemplate.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items = state.items.filter(
                    (item) => item.id !== action.payload
                );
                if (state.currentItem?.id === action.payload) {
                    state.currentItem = null;
                }
                state.pagination.total = Math.max(0, state.pagination.total - 1);
                if (state.statistics) {
                    state.statistics.total = Math.max(0, state.statistics.total - 1);
                }
                state.successMessage = "Email template deleted successfully";
            })
            .addCase(deleteEmailTemplate.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Preview email template ---------- */
            .addCase(previewEmailTemplate.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(previewEmailTemplate.fulfilled, (state) => {
                state.isSubmitting = false;
                // Preview handled in component
            })
            .addCase(previewEmailTemplate.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Send test email ---------- */
            .addCase(sendTestEmail.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(sendTestEmail.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.successMessage = action.payload.message;
            })
            .addCase(sendTestEmail.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Fetch logs ---------- */
            .addCase(fetchEmailTemplateLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmailTemplateLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload.items;
                state.logsPagination = action.payload.data;
            })
            .addCase(fetchEmailTemplateLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            /* ---------- Toggle status ---------- */
            .addCase(toggleTemplateStatus.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(toggleTemplateStatus.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const { id, response } = action.payload;
                const updatedItem = response.item;

                const index = state.items.findIndex((item) => item.id === id);
                if (index !== -1) {
                    state.items[index] = updatedItem;
                }
                if (state.currentItem?.id === id) {
                    state.currentItem = updatedItem;
                }
                state.successMessage = response.message || "Template status updated";
            })
            .addCase(toggleTemplateStatus.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            /* ---------- Duplicate template ---------- */
            .addCase(duplicateTemplate.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(duplicateTemplate.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items.unshift(action.payload.item);
                state.pagination.total++;
                if (state.statistics) {
                    state.statistics.total++;
                }
                state.successMessage = action.payload.message || "Template duplicated successfully";
            })
            .addCase(duplicateTemplate.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

/* ------------------ Exports ------------------ */

export const {
    clearEmailTemplateError,
    clearEmailTemplateSuccess,
    clearCurrentTemplate,
    clearLogs,
    updateTemplateInList,
    setCurrentTemplate,
} = emailTemplateSlice.actions;

export default emailTemplateSlice.reducer;