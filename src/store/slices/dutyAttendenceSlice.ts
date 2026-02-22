import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  DutyAttendance, 
  DutyAttendanceParams, 
  DutyAttendanceState,
  CreateDutyAttendanceDto
} from "@/app/types/dutyAttendance";
import { dutyAttendanceService } from "@/service/dutyAttendence.service";

const initialState: DutyAttendanceState = {
  attendences: [],
  currentAttendence: null,
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

export const fetchAttendances = createAsyncThunk(
  "dutyAttendance/fetchAttendances",
  async (params: DutyAttendanceParams = {}, { rejectWithValue }) => {
    try {
      return await dutyAttendanceService.getAttendances(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty attendances";
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  "dutyAttendance/fetchAttendance",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await dutyAttendanceService.getAttendance(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty attendance";
      return rejectWithValue(message);
    }
  }
);

export const createAttendance = createAsyncThunk(
  "dutyAttendance/createAttendance",
  async (
    data: CreateDutyAttendanceDto,
    { rejectWithValue }
  ) => {
    try {
      return await dutyAttendanceService.createAttendance(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create duty attendance";
      return rejectWithValue(message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  "dutyAttendance/updateAttendance",
  async (
    { id, data }: { id: number; data: CreateDutyAttendanceDto },
    { rejectWithValue }
  ) => {
    try {
      return await dutyAttendanceService.updateAttendance(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty attendance";
      return rejectWithValue(message);
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  "dutyAttendance/deleteAttendance",
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyAttendanceService.deleteAttendance(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete duty attendance";
      return rejectWithValue(message);
    }
  }
);

export const toggleAttendanceStatus = createAsyncThunk(
  "dutyAttendance/toggleStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
       await dutyAttendanceService.toggleStatus(id, status);
       const updatedDutyAttendence=await dutyAttendanceService.getAttendance(id)
       return updatedDutyAttendence.item
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle duty attendance status";
      return rejectWithValue(message);
    }
  }
);

export const markCheckIn = createAsyncThunk(
  "dutyAttendance/markCheckIn",
  async (
    data: { guard_id: number; duty_id: number; latitude?: string; longitude?: string; remarks?: string },
    { rejectWithValue }
  ) => {
    try {
      return await dutyAttendanceService.markCheckIn(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark check-in";
      return rejectWithValue(message);
    }
  }
);

export const markCheckOut = createAsyncThunk(
  "dutyAttendance/markCheckOut",
  async (
    { id, data }: { id: number; data: { remarks?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await dutyAttendanceService.markCheckOut(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark check-out";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const dutyAttendanceSlice = createSlice({
  name: "dutyAttendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendence = null;
    },
    setAttendances: (state, action: PayloadAction<DutyAttendance[]>) => {
      state.attendences = action.payload;
    },
    updateAttendanceInList: (state, action: PayloadAction<DutyAttendance>) => {
      const index = state.attendences.findIndex(
        (attendance) => attendance.id === action.payload.id
      );
      if (index !== -1) {
        state.attendences[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendances
      .addCase(fetchAttendances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendences = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAttendence = action.payload.item;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create attendance
      .addCase(createAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendences = [action.payload.item, ...state.attendences];
        state.currentAttendence = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.attendences.findIndex(
          (attendance) => attendance.id === action.payload.item.id
        );
        if (index !== -1) {
          state.attendences[index] = action.payload.item;
        }
        if (state.currentAttendence?.id === action.payload.item.id) {
          state.currentAttendence = action.payload.item;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendences = state.attendences.filter(
          (attendance) => attendance.id !== action.payload
        );
        if (state.currentAttendence?.id === action.payload) {
          state.currentAttendence = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleAttendanceStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleAttendanceStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.attendences.findIndex(
          (attendance) => attendance.id === action.payload.id
        );
        if (index !== -1) {
          state.attendences[index] = action.payload;
        }
        if (state.currentAttendence?.id === action.payload.id) {
          state.currentAttendence = action.payload;
        }
      })
      .addCase(toggleAttendanceStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark check-in
      .addCase(markCheckIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markCheckIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendences = [action.payload.item, ...state.attendences];
        state.currentAttendence = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(markCheckIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark check-out
      .addCase(markCheckOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markCheckOut.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.attendences.findIndex(
          (attendance) => attendance.id === action.payload.item.id
        );
        if (index !== -1) {
          state.attendences[index] = action.payload.item;
        }
        if (state.currentAttendence?.id === action.payload.item.id) {
          state.currentAttendence = action.payload.item;
        }
      })
      .addCase(markCheckOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAttendanceError,
  clearCurrentAttendance,
  setAttendances,
  updateAttendanceInList,
} = dutyAttendanceSlice.actions;

export default dutyAttendanceSlice.reducer;