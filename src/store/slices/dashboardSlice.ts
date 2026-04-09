// store/slices/adminDashboard.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminDashboardService } from "@/service/dashboard.service";
import { DashboardData, DashboardState } from "@/app/types/dashboard";

const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

/* ------------------ Thunks ------------------ */

// Fetch dashboard data
export const fetchDashboard = createAsyncThunk(
  "adminDashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getDashboard();
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
      return rejectWithValue(message);
    }
  }
);



/* ------------------ Slice ------------------ */

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
    updateDashboardData: (state, action: PayloadAction<Partial<DashboardData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
  },
});

export const { 
  clearDashboardError, 
  resetDashboard, 
  updateDashboardData 
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;