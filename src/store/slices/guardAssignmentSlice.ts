import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { guardAssignmentService } from "@/service/guardAssignment.service";
import { 
    CreateGuardAssignmentDto,
  GuardAssignment, 
  GuardAssignmentParams, 
  GuardAssignmentState 
} from "@/app/types/guardAssignment"; // Fixed import path

const initialState: GuardAssignmentState = {
  assignments: [],
  currentAssignment: null,
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

export const fetchAssignments = createAsyncThunk(
  "guardAssignment/fetchAssignments",
  async (params: GuardAssignmentParams = {}, { rejectWithValue }) => {
    try {
      const response=await guardAssignmentService.getAssignments(params);
      console.log(response)
      return response
    } catch (error: unknown) {
      console.log(error)
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch guard assignments";
      return rejectWithValue(message);
    }
  }
);

export const fetchAssignment = createAsyncThunk(
  "guardAssignment/fetchAssignment",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await guardAssignmentService.getAssignment(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch guard assignment";
      return rejectWithValue(message);
    }
  }
);

export const createAssignment = createAsyncThunk(
  "guardAssignment/createAssignment",
  async (
    data:CreateGuardAssignmentDto,
    { rejectWithValue }
  ) => {
    try {
      return await guardAssignmentService.createAssignment(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create guard assignment";
      return rejectWithValue(message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  "guardAssignment/updateAssignment",
  async (
    { id, data }: { id: number; data: CreateGuardAssignmentDto },
    { rejectWithValue }
  ) => {
    try {
      return await guardAssignmentService.updateAssignment(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update guard assignment";
      return rejectWithValue(message);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  "guardAssignment/deleteAssignment",
  async (id: number, { rejectWithValue }) => {
    try {
      await guardAssignmentService.deleteAssignment(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete guard assignment";
      return rejectWithValue(message);
    }
  }
);

export const toggleAssignmentStatus = createAsyncThunk(
  "guardAssignment/toggleStatus",
  async (
    { id, status }: { id: number; status: string }, // Fixed: changed 'stauts' to 'status'
    { rejectWithValue }
  ) => {
    try {
      return await guardAssignmentService.toggleStatus(id, status);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle guard assignment status";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const guardAssignmentSlice = createSlice({
  name: "guardAssignment",
  initialState,
  reducers: {
    clearAssignmentError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    setAssignments: (state, action: PayloadAction<GuardAssignment[]>) => {
      state.assignments = action.payload;
    },
    updateAssignmentInList: (state, action: PayloadAction<GuardAssignment>) => {
      const index = state.assignments.findIndex(
        (assignment) => assignment.id === action.payload.id
      );
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single assignment
      .addCase(fetchAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssignment = action.payload.item;
      })
      .addCase(fetchAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = [action.payload.item, ...state.assignments];
        state.currentAssignment = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === action.payload.item.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload.item;
        }
        if (state.currentAssignment?.id === action.payload.item.id) {
          state.currentAssignment = action.payload.item;
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = state.assignments.filter(
          (assignment) => assignment.id !== action.payload
        );
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleAssignmentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleAssignmentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === action.payload.item.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload.item;
        }
        if (state.currentAssignment?.id === action.payload.item.id) {
          state.currentAssignment = action.payload.item;
        }
      })
      .addCase(toggleAssignmentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAssignmentError,
  clearCurrentAssignment,
  setAssignments,
  updateAssignmentInList,
} = guardAssignmentSlice.actions;

export default guardAssignmentSlice.reducer;