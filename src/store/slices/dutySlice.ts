
import { Duty, DutyParams, DutyState } from "@/app/types/duty";
import { dutyService } from "@/service/duty.service";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const initialState: DutyState = {
  duties: [],
  currentDuty: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  error: null,
};

/* ------------------ Thunks ------------------ */

export const fetchDuties = createAsyncThunk(
  "duty/fetchDuties",
  async (params: DutyParams = {}, { rejectWithValue }) => {
    try {
      return await dutyService.getDuties(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duties";
      return rejectWithValue(message);
    }
  }
);

export const fetchDuty = createAsyncThunk(
  "duty/fetchDuty",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await dutyService.getDuty(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty";
      return rejectWithValue(message);
    }
  }
);

export const createDuty = createAsyncThunk(
  "duty/createDuty",
  async (
    data: Partial<Duty>,
    { rejectWithValue }
  ) => {
    try {
      return await dutyService.createDuty(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create duty";
      return rejectWithValue(message);
    }
  }
);

export const updateDuty = createAsyncThunk(
  "duty/updateDuty",
  async (
    { id, data }: { id: number; data: Partial<Duty> },
    { rejectWithValue }
  ) => {
    try {
      return await dutyService.updateDuty(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty";
      return rejectWithValue(message);
    }
  }
);

export const deleteDuty = createAsyncThunk(
  "duty/deleteDuty",
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyService.deleteDuty(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete duty";
      return rejectWithValue(message);
    }
  }
);

/** Update duty workflow status (pending | approved | completed) */
export const updateDutyWorkflowStatus = createAsyncThunk(
  "duty/updateWorkflowStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await dutyService.updateWorkflowStatus(id, status);
      if (response?.item) return response.item;
      const refreshed = await dutyService.getDuty(id);
      return refreshed.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty workflow status";
      return rejectWithValue(message);
    }
  }
);

/** Enable / disable duty (is_active) */
export const setDutyActive = createAsyncThunk(
  "duty/setActive",
  async (
    { id, is_active }: { id: number; is_active: boolean },
    { rejectWithValue }
  ) => {
    try {
      await dutyService.setActive(id, is_active);
      const refreshed = await dutyService.getDuty(id);
      return refreshed.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty active flag";
      return rejectWithValue(message);
    }
  }
);

/** @deprecated Prefer updateDutyWorkflowStatus */
export const toggleDutyStatus = createAsyncThunk(
  "duty/toggleStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await dutyService.updateWorkflowStatus(id, status);
      if (response?.item) return response.item;
      const updatedDuty = await dutyService.getDuty(id);
      return updatedDuty.item;
    } catch (error: unknown) {
      console.log(error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle duty status";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const dutySlice = createSlice({
  name: "duty",
  initialState,
  reducers: {
    clearDutyError: (state) => {
      state.error = null;
    },
    clearCurrentDuty: (state) => {
      state.currentDuty = null;
    },
    setDuties: (state, action: PayloadAction<Duty[]>) => {
      state.duties = action.payload;
    },
    updateDutyInList: (state, action: PayloadAction<Duty>) => {
      const index = state.duties.findIndex(
        (duty) => duty.id === action.payload.id
      );
      if (index !== -1) {
        state.duties[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch duties
      .addCase(fetchDuties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDuties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.duties = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchDuties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single duty
      .addCase(fetchDuty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDuty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDuty = action.payload.item;
      })
      .addCase(fetchDuty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create duty
      .addCase(createDuty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDuty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.duties = [action.payload.item, ...state.duties];
        state.currentDuty = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createDuty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update duty
      .addCase(updateDuty.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.duties.findIndex(
          (duty) => duty.id === action.payload.item.id
        );
        if (index !== -1) {
          state.duties[index] = action.payload.item;
        }
        if (state.currentDuty?.id === action.payload.item.id) {
          state.currentDuty = action.payload.item;
        }
      })

      // Delete duty
      .addCase(deleteDuty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.duties = state.duties.filter(
          (duty) => duty.id !== action.payload
        );
        if (state.currentDuty?.id === action.payload) {
          state.currentDuty = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })

      // Workflow / active status updates
      .addCase(toggleDutyStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.duties.findIndex(
          (duty) => duty.id === action.payload.id
        );
        if (index !== -1) {
          state.duties[index] = action.payload;
        }
        if (state.currentDuty?.id === action.payload.id) {
          state.currentDuty = action.payload;
        }
      })
      .addCase(updateDutyWorkflowStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.duties.findIndex(
          (duty) => duty.id === action.payload.id
        );
        if (index !== -1) {
          state.duties[index] = action.payload;
        }
        if (state.currentDuty?.id === action.payload.id) {
          state.currentDuty = action.payload;
        }
      })
      .addCase(setDutyActive.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.duties.findIndex(
          (duty) => duty.id === action.payload.id
        );
        if (index !== -1) {
          state.duties[index] = action.payload;
        }
        if (state.currentDuty?.id === action.payload.id) {
          state.currentDuty = action.payload;
        }
      });
  },
});

export const {
  clearDutyError,
  clearCurrentDuty,
  setDuties,
  updateDutyInList,
} = dutySlice.actions;

export default dutySlice.reducer;
