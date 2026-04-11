// store/slices/liveTracking.slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { liveTrackingService } from "@/service/liveTracking.service";
import { 
  LiveGuard, 
  LiveTrackingState, 
  LiveTrackingParams,
  LocationHistoryPoint,
  GuardLocation
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
    updateGuardLocation: (state, action: PayloadAction<{
      guard_id: number;
      latitude: number;
      longitude: number;
      accuracy: number;
      speed?: number | null;
      is_moving?: boolean;
      duty_location_match: boolean;
      distance_from_duty_meters: number;
      battery_level: number | null;
      updated_at: string;
    }>) => {
      const { 
        guard_id, 
        latitude, 
        longitude, 
        accuracy, 
        speed, 
        is_moving,
        duty_location_match, 
        distance_from_duty_meters, 
        battery_level, 
        updated_at 
      } = action.payload;
      
      const guard = state.guards.find(g => g.id === guard_id);
      if (guard) {
        // Create the updated location object with all required properties
        const updatedLocation: GuardLocation = {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy: accuracy,
          speed: speed !== undefined ? (speed !== null ? speed.toString() : null) : (guard.location?.speed ?? null),
          is_moving: is_moving !== undefined ? is_moving : (guard.location?.is_moving ?? false),
          updated_at: updated_at,
          updated_ago: 'Just now',
          duty_location_match: duty_location_match,
          distance_from_duty_meters: distance_from_duty_meters,
        };
        
        guard.location = updatedLocation;
        
        if (guard.device_info) {
          guard.device_info.battery_level = battery_level;
        }
        
        guard.last_ping_at = updated_at;
      }
    },
    updateGuardStatus: (state, action: PayloadAction<{
      guard_id: number;
      status: 'online' | 'offline' | 'pending';
      last_ping_at: string;
    }>) => {
      const { guard_id, status, last_ping_at } = action.payload;
      
      const guard = state.guards.find(g => g.id === guard_id);
      if (guard) {
        guard.online_status = status;
        guard.last_ping_at = last_ping_at;
        
        // Update online/offline counts
        state.totalOnline = state.guards.filter(g => g.online_status === 'online').length;
        state.totalOffline = state.guards.filter(g => g.online_status === 'offline').length;
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
  updateGuardLocation,
  updateGuardStatus
} = liveTrackingSlice.actions;

export default liveTrackingSlice.reducer;