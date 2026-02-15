import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { leaveService } from "@/service/leave.service";
import {
  Leave,
  LeaveParams,
  LeaveState,
  CreateLeaveDto,
  UpdateLeaveDto,
} from "@/app/types/leave";

/* ------------------ Initial State ------------------ */

const initialState: LeaveState = {
  leaves: [],
  currentLeave: null,
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

// Fetch all leaves
export const fetchLeaves = createAsyncThunk(
  "leave/fetchLeaves",
  async (params: LeaveParams = {}, { rejectWithValue }) => {
    try {
      return await leaveService.getLeaves(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch leaves";
      return rejectWithValue(message);
    }
  }
);

// Fetch single leave
export const fetchLeave = createAsyncThunk(
  "leave/fetchLeave",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.getLeave(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch leave";
      return rejectWithValue(message);
    }
  }
);

// Create leave
export const createLeave = createAsyncThunk(
  "leave/createLeave",
  async (
    data: CreateLeaveDto,
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.createLeave(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create leave";
      return rejectWithValue(message);
    }
  }
);

// Update leave
export const updateLeave = createAsyncThunk(
  "leave/updateLeave",
  async (
    { id, data }: { id: number; data: UpdateLeaveDto },
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.updateLeave(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update leave";
      return rejectWithValue(message);
    }
  }
);

// Delete leave
export const deleteLeave = createAsyncThunk(
  "leave/deleteLeave",
  async (id: number, { rejectWithValue }) => {
    try {
      await leaveService.deleteLeave(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete leave";
      return rejectWithValue(message);
    }
  }
);

// Update leave status (approve/reject)
export const updateLeaveStatus = createAsyncThunk(
  "leave/updateStatus",
  async (
    {
      id,
      payload,
    }: {
      id: number;
      payload: {
        status: string;
        review_note?: string | null;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.updateLeaveStatus(id, payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update leave status";
      return rejectWithValue(message);
    }
  }
);



// Fetch leaves by guard
export const fetchLeavesByGuard = createAsyncThunk(
  "leave/fetchLeavesByGuard",
  async (
    { guardId, params }: { guardId: number; params?: LeaveParams },
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.getLeavesByGuard(guardId, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch leaves by guard";
      return rejectWithValue(message);
    }
  }
);

// Fetch leaves by site
export const fetchLeavesBySite = createAsyncThunk(
  "leave/fetchLeavesBySite",
  async (
    { siteId, params }: { siteId: number; params?: LeaveParams },
    { rejectWithValue }
  ) => {
    try {
      return await leaveService.getLeavesBySite(siteId, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch leaves by site";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
    clearCurrentLeave: (state) => {
      state.currentLeave = null;
    },
    setLeaves: (state, action: PayloadAction<Leave[]>) => {
      state.leaves = action.payload;
    },
    updateLeaveInList: (state, action: PayloadAction<Leave>) => {
      const index = state.leaves.findIndex(
        (l) => l.id === action.payload.id
      );
      if (index !== -1) {
        state.leaves[index] = action.payload;
      }
    },
    
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch leaves ---------- */
      .addCase(fetchLeaves.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch leaves by guard ---------- */
      .addCase(fetchLeavesByGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeavesByGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchLeavesByGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch leaves by site ---------- */
      .addCase(fetchLeavesBySite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeavesBySite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchLeavesBySite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch single leave ---------- */
      .addCase(fetchLeave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeave.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLeave = action.payload.item;
      })
      .addCase(fetchLeave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Create leave ---------- */
      .addCase(createLeave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = [
          action.payload.item,
          ...state.leaves,
        ];
        state.currentLeave = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update leave ---------- */
      .addCase(updateLeave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.leaves.findIndex(
          (l) => l.id === action.payload.item.id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload.item;
        }
        if (state.currentLeave?.id === action.payload.item.id) {
          state.currentLeave = action.payload.item;
        }
      })
      .addCase(updateLeave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update leave status (approve/reject) ---------- */
      .addCase(updateLeaveStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.leaves.findIndex(
          (l) => l.id === action.payload.id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave?.id === action.payload.id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Delete leave ---------- */
      .addCase(deleteLeave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = state.leaves.filter(
          (l) => l.id !== action.payload
        );
        if (state.currentLeave?.id === action.payload) {
          state.currentLeave = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearLeaveError,
  clearCurrentLeave,
  setLeaves,
  updateLeaveInList,
} = leaveSlice.actions;

export default leaveSlice.reducer;