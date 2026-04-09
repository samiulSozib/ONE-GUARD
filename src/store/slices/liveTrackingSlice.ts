// store/slices/liveTracking.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { liveTrackingService } from "@/service/liveTracking.service";
import { 
  LiveGuard, 
  LiveTrackingState, 
  LiveTrackingParams,
  LocationHistoryPoint 
} from "@/app/types/liveTracking";

const initialState: LiveTrackingState = {
  guards: [],
  totalOnline: 0,
  totalOffline: 0,
  totalGuards: 0,
  lastUpdated: null,
  selectedGuard: null,
  locationHistory: [],
  historyTotalPoints: 0,
  isLoading: false,
  error: null,
};

/* ------------------ Thunks ------------------ */

// Fetch all live tracking guards
export const fetchLiveGuards = createAsyncThunk(
  "liveTracking/fetchGuards",
  async (params: LiveTrackingParams = {}, { rejectWithValue }) => {
    try {
      const response = await liveTrackingService.getGuards(params);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch live guards";
      return rejectWithValue(message);
    }
  }
);

// Fetch guards by status
export const fetchGuardsByStatus = createAsyncThunk(
  "liveTracking/fetchGuardsByStatus",
  async (status: 'online' | 'offline', { rejectWithValue }) => {
    try {
      const response = await liveTrackingService.getGuardsByStatus(status);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch guards by status";
      return rejectWithValue(message);
    }
  }
);

// Fetch guard location history
export const fetchGuardLocationHistory = createAsyncThunk(
  "liveTracking/fetchLocationHistory",
  async ({ guardId, hours = 24 }: { guardId: number; hours?: number }, { rejectWithValue }) => {
    try {
      const response = await liveTrackingService.getGuardLocationHistory(guardId, hours);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch location history";
      return rejectWithValue(message);
    }
  }
);

// Fetch single guard live location
export const fetchGuardLiveLocation = createAsyncThunk(
  "liveTracking/fetchGuardLiveLocation",
  async (guardId: number, { rejectWithValue }) => {
    try {
      const response = await liveTrackingService.getGuardLiveLocation(guardId);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch guard location";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const liveTrackingSlice = createSlice({
  name: "liveTracking",
  initialState,
  reducers: {
    clearTrackingError: (state) => {
      state.error = null;
    },
    resetTrackingState: (state) => {
      state.guards = [];
      state.totalOnline = 0;
      state.totalOffline = 0;
      state.totalGuards = 0;
      state.lastUpdated = null;
      state.selectedGuard = null;
      state.locationHistory = [];
      state.historyTotalPoints = 0;
      state.error = null;
    },
    setSelectedGuard: (state, action: PayloadAction<LiveGuard | null>) => {
      state.selectedGuard = action.payload;
    },
    clearLocationHistory: (state) => {
      state.locationHistory = [];
      state.historyTotalPoints = 0;
    },
    updateGuardLocation: (state, action: PayloadAction<{ guardId: number; location: LiveGuard['location'] }>) => {
      const index = state.guards.findIndex(g => g.id === action.payload.guardId);
      if (index !== -1 && action.payload.location) {
        state.guards[index].location = action.payload.location;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Live Guards
      .addCase(fetchLiveGuards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLiveGuards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guards = action.payload.guards;
        state.totalOnline = action.payload.total_online;
        state.totalOffline = action.payload.total_offline;
        state.totalGuards = action.payload.total_guards;
        state.lastUpdated = action.payload.last_updated;
      })
      .addCase(fetchLiveGuards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Guards by Status
      .addCase(fetchGuardsByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuardsByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guards = action.payload.guards;
        state.totalOnline = action.payload.total_online;
        state.totalOffline = action.payload.total_offline;
        state.totalGuards = action.payload.total_guards;
        state.lastUpdated = action.payload.last_updated;
      })
      .addCase(fetchGuardsByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Guard Location History
      .addCase(fetchGuardLocationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuardLocationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locationHistory = action.payload.locations;
        state.historyTotalPoints = action.payload.total_points;
      })
      .addCase(fetchGuardLocationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Guard Live Location
      .addCase(fetchGuardLiveLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuardLiveLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGuard = action.payload.guard;
      })
      .addCase(fetchGuardLiveLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearTrackingError, 
  resetTrackingState, 
  setSelectedGuard,
  clearLocationHistory,
  updateGuardLocation
} = liveTrackingSlice.actions;

export default liveTrackingSlice.reducer;