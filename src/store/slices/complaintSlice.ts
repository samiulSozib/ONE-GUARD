import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { complaintService } from "@/service/complaint.service";
import {
  Complaint,
  ComplaintParams,
  ComplaintState,
  CreateComplaintDto,
} from "@/app/types/complaint";

/* ------------------ Initial State ------------------ */

const initialState: ComplaintState = {
  complaints: [],
  currentComplaint: null,
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

// Fetch all complaints
export const fetchComplaints = createAsyncThunk(
  "complaint/fetchComplaints",
  async (params: ComplaintParams = {}, { rejectWithValue }) => {
    try {
      return await complaintService.getComplaints(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch complaints";
      return rejectWithValue(message);
    }
  }
);

// Fetch single complaint
export const fetchComplaint = createAsyncThunk(
  "complaint/fetchComplaint",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await complaintService.getComplaint(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch complaint";
      return rejectWithValue(message);
    }
  }
);

// Create complaint
export const createComplaint = createAsyncThunk(
  "complaint/createComplaint",
  async (
    data: CreateComplaintDto,
    { rejectWithValue }
  ) => {
    try {
      return await complaintService.createComplaint(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create complaint";
      return rejectWithValue(message);
    }
  }
);

// Update complaint
export const updateComplaint = createAsyncThunk(
  "complaint/updateComplaint",
  async (
    { id, data }: { id: number; data: CreateComplaintDto },
    { rejectWithValue }
  ) => {
    try {
      return await complaintService.updateComplaint(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update complaint";
      return rejectWithValue(message);
    }
  }
);

// Delete complaint
export const deleteComplaint = createAsyncThunk(
  "complaint/deleteComplaint",
  async (id: number, { rejectWithValue }) => {
    try {
      await complaintService.deleteComplaint(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete complaint";
      return rejectWithValue(message);
    }
  }
);

// Toggle complaint visibility
export const toggleComplaintVisibility = createAsyncThunk(
  "complaint/toggleVisibility",
  async (
    {
      id,
      payload,
    }: {
      id: number;
      payload: {
        is_visible_to_client?: boolean;
        is_visible_to_guard?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await complaintService.toggleVisibility(id, payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle complaint visibility";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    },
    clearCurrentComplaint: (state) => {
      state.currentComplaint = null;
    },
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.complaints = action.payload;
    },
    updateComplaintInList: (state, action: PayloadAction<Complaint>) => {
      const index = state.complaints.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.complaints[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch complaints ---------- */
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.complaints = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch single complaint ---------- */
      .addCase(fetchComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentComplaint = action.payload.item;
      })
      .addCase(fetchComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Create complaint ---------- */
      .addCase(createComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.complaints = [
          action.payload.item,
          ...state.complaints,
        ];
        state.currentComplaint = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update complaint ---------- */
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.complaints.findIndex(
          (c) => c.id === action.payload.item.id
        );
        if (index !== -1) {
          state.complaints[index] = action.payload.item;
        }
        if (state.currentComplaint?.id === action.payload.item.id) {
          state.currentComplaint = action.payload.item;
        }
      })

      /* ---------- Delete complaint ---------- */
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.complaints = state.complaints.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentComplaint?.id === action.payload) {
          state.currentComplaint = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })

      /* ---------- Toggle visibility ---------- */
      .addCase(toggleComplaintVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.complaints.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
        if (state.currentComplaint?.id === action.payload.id) {
          state.currentComplaint = action.payload;
        }
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearComplaintError,
  clearCurrentComplaint,
  setComplaints,
  updateComplaintInList,
} = complaintSlice.actions;

export default complaintSlice.reducer;
