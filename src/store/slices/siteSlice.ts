import { Site, SiteParams, SiteState } from '@/app/types/site';
import { siteService } from '@/service/site.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: SiteState = {
  sites: [],
  currentSite: null,
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
export const fetchSites = createAsyncThunk(
  'site/fetchSites',
  async (params: SiteParams = {}, { rejectWithValue }) => {
    try {
      const response = await siteService.getSites(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sites';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSite = createAsyncThunk(
  'site/fetchSite',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await siteService.getSite(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createSite = createAsyncThunk(
  'site/createSite',
  async (data: FormData | Omit<Site, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await siteService.createSite(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create site';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSite = createAsyncThunk(
  'site/updateSite',
  async ({ id, data }: { id: number; data: FormData | Partial<Site> }, { rejectWithValue }) => {
    try {
      return await siteService.updateSite(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSite = createAsyncThunk(
  'site/deleteSite',
  async (id: number, { rejectWithValue }) => {
    try {
      await siteService.deleteSite(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleSiteStatus = createAsyncThunk(
  'site/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await siteService.toggleStatus(id, is_active);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle site status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    clearSiteError: (state) => {
      state.error = null;
    },
    clearCurrentSite: (state) => {
      state.currentSite = null;
    },
    setSites: (state, action: PayloadAction<Site[]>) => {
      state.sites = action.payload;
    },
    updateSiteInList: (state, action: PayloadAction<Site>) => {
      const index = state.sites.findIndex(site => site.id === action.payload.id);
      if (index !== -1) {
        state.sites[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sites
      .addCase(fetchSites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sites = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Single Site
      .addCase(fetchSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSite = action.payload;
      })
      .addCase(fetchSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Site
      .addCase(createSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sites.unshift(action.payload);
        state.currentSite = action.payload;
      })
      .addCase(createSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Site
      .addCase(updateSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSite.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sites.findIndex(site => site.id === action.payload.id);
        if (index !== -1) {
          state.sites[index] = action.payload;
        }
        if (state.currentSite?.id === action.payload.id) {
          state.currentSite = action.payload;
        }
      })
      .addCase(updateSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Site
      .addCase(deleteSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sites = state.sites.filter(site => site.id !== action.payload);
        if (state.currentSite?.id === action.payload) {
          state.currentSite = null;
        }
      })
      .addCase(deleteSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleSiteStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleSiteStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sites.findIndex(site => site.id === action.payload.id);
        if (index !== -1) {
          state.sites[index] = action.payload;
        }
        if (state.currentSite?.id === action.payload.id) {
          state.currentSite = action.payload;
        }
      })
      .addCase(toggleSiteStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSiteError, 
  clearCurrentSite, 
  setSites,
  updateSiteInList 
} = siteSlice.actions;
export default siteSlice.reducer;