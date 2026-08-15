// store/slices/duty-schedule.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { dutyScheduleService } from "@/service/duty-schedule.service";
import {
  DutySchedule,
  DutyScheduleParams,
  DutyScheduleState,
  CreateDutyScheduleDto,
  UpdateDutyScheduleDto,
} from "@/app/types/duty-schedule";

/* ------------------ Initial State ------------------ */

const initialState: DutyScheduleState = {
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

// Fetch all duty schedules
export const fetchDutySchedules = createAsyncThunk(
  "dutySchedule/fetchAll",
  async (params: DutyScheduleParams = {}, { rejectWithValue }) => {
    try {
      const response = await dutyScheduleService.getDutySchedules(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty schedules";
      return rejectWithValue(message);
    }
  }
);

// Fetch single duty schedule
export const fetchDutySchedule = createAsyncThunk(
  "dutySchedule/fetchOne",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await dutyScheduleService.getDutySchedule(id);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty schedule";
      return rejectWithValue(message);
    }
  }
);

// Create duty schedule
export const createDutySchedule = createAsyncThunk(
  "dutySchedule/create",
  async (data: CreateDutyScheduleDto, { rejectWithValue }) => {
    try {
      const response = await dutyScheduleService.createDutySchedule(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create duty schedule";
      return rejectWithValue(message);
    }
  }
);

// Update duty schedule
export const updateDutySchedule = createAsyncThunk(
  "dutySchedule/update",
  async (
    { id, data }: { id: number; data: UpdateDutyScheduleDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await dutyScheduleService.updateDutySchedule(id, data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty schedule";
      return rejectWithValue(message);
    }
  }
);

// Toggle duty schedule status
export const toggleDutyScheduleStatus = createAsyncThunk(
  "dutySchedule/toggleStatus",
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await dutyScheduleService.toggleStatus(id, isActive);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle duty schedule status";
      return rejectWithValue(message);
    }
  }
);

// Delete duty schedule
export const deleteDutySchedule = createAsyncThunk(
  "dutySchedule/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyScheduleService.deleteDutySchedule(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete duty schedule";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const dutyScheduleSlice = createSlice({
  name: "dutySchedule",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearItems: (state) => {
      state.items = [];
      state.pagination = initialState.pagination;
    },
    updateItemInList: (state, action: PayloadAction<DutySchedule>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
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
      // Fetch all
      .addCase(fetchDutySchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDutySchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchDutySchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single
      .addCase(fetchDutySchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDutySchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.item;
      })
      .addCase(fetchDutySchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createDutySchedule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createDutySchedule.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = [action.payload.item, ...state.items];
        state.currentItem = action.payload.item;
        state.pagination.total += 1;
        state.successMessage = action.payload.message || "Duty schedule created successfully";
      })
      .addCase(createDutySchedule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateDutySchedule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateDutySchedule.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.item.id
        );
        if (index !== -1) {
          state.items[index] = action.payload.item;
        }
        if (state.currentItem?.id === action.payload.item.id) {
          state.currentItem = action.payload.item;
        }
        state.successMessage = action.payload.message || "Duty schedule updated successfully";
      })
      .addCase(updateDutySchedule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleDutyScheduleStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(toggleDutyScheduleStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.item.id
        );
        if (index !== -1) {
          state.items[index] = action.payload.item;
        }
        if (state.currentItem?.id === action.payload.item.id) {
          state.currentItem = action.payload.item;
        }
        state.successMessage = action.payload.message || "Status updated successfully";
      })
      .addCase(toggleDutyScheduleStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteDutySchedule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteDutySchedule.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.successMessage = "Duty schedule deleted successfully";
      })
      .addCase(deleteDutySchedule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearError,
  clearSuccess,
  clearCurrentItem,
  clearItems,
  updateItemInList,
} = dutyScheduleSlice.actions;

export default dutyScheduleSlice.reducer;
