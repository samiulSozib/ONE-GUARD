import { 
  SiteLocation, 
  SiteLocationParams, 
  SiteLocationState 
} from '@/app/types/siteLocation.types';
import { siteLocationService } from '@/service/siteLocation.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: SiteLocationState = {
  siteLocations: [],
  currentSiteLocation: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSiteLocations = createAsyncThunk(
  'siteLocation/fetchSiteLocations',
  async (params: SiteLocationParams = {}, { rejectWithValue }) => {
    try {
      const response = await siteLocationService.getSiteLocations(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site locations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSiteLocation = createAsyncThunk(
  'siteLocation/fetchSiteLocation',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await siteLocationService.getSiteLocation(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createSiteLocation = createAsyncThunk(
  'siteLocation/createSiteLocation',
  async (data: Omit<SiteLocation, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await siteLocationService.createSiteLocation(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSiteLocation = createAsyncThunk(
  'siteLocation/updateSiteLocation',
  async ({ id, data }: { id: number; data: Partial<SiteLocation> }, { rejectWithValue }) => {
    try {
      return await siteLocationService.updateSiteLocation(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSiteLocation = createAsyncThunk(
  'siteLocation/deleteSiteLocation',
  async (id: number, { rejectWithValue }) => {
    try {
      await siteLocationService.deleteSiteLocation(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleSiteLocationStatus = createAsyncThunk(
  'siteLocation/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await siteLocationService.toggleStatus(id, is_active);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle site location status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const siteLocationSlice = createSlice({
  name: 'siteLocation',
  initialState,
  reducers: {
    clearSiteLocationError: (state) => {
      state.error = null;
    },
    clearCurrentSiteLocation: (state) => {
      state.currentSiteLocation = null;
    },
    setSiteLocations: (state, action: PayloadAction<SiteLocation[]>) => {
      state.siteLocations = action.payload;
    },
    updateSiteLocationInList: (state, action: PayloadAction<SiteLocation>) => {
      const index = state.siteLocations.findIndex(location => location.id === action.payload.id);
      if (index !== -1) {
        state.siteLocations[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Site Locations
      .addCase(fetchSiteLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiteLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.siteLocations = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchSiteLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Site Location
      .addCase(fetchSiteLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiteLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSiteLocation = action.payload;
      })
      .addCase(fetchSiteLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Site Location
      .addCase(createSiteLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSiteLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new site location to the beginning of the array
        state.siteLocations = [action.payload, ...state.siteLocations];
        state.currentSiteLocation = action.payload;
        // Increment total count
        state.pagination.total += 1;
      })
      .addCase(createSiteLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Site Location
      .addCase(updateSiteLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSiteLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.siteLocations.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.siteLocations[index] = action.payload;
        }
        if (state.currentSiteLocation?.id === action.payload.id) {
          state.currentSiteLocation = action.payload;
        }
      })
      .addCase(updateSiteLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Site Location
      .addCase(deleteSiteLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSiteLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.siteLocations = state.siteLocations.filter(location => location.id !== action.payload);
        if (state.currentSiteLocation?.id === action.payload) {
          state.currentSiteLocation = null;
        }
        // Decrement total count
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteSiteLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleSiteLocationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleSiteLocationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.siteLocations.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.siteLocations[index] = action.payload;
        }
        if (state.currentSiteLocation?.id === action.payload.id) {
          state.currentSiteLocation = action.payload;
        }
      })
      .addCase(toggleSiteLocationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSiteLocationError,
  clearCurrentSiteLocation,
  setSiteLocations,
  updateSiteLocationInList
} = siteLocationSlice.actions;
export default siteLocationSlice.reducer;