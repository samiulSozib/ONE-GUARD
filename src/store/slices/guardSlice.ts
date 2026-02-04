import { Guard, GuardParams, GuardState } from '@/app/types/guard';
import { guardService } from '@/service/guard.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: GuardState = {
  guards: [],
  currentGuard: null,
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
export const fetchGuards = createAsyncThunk(
  'guard/fetchGuards',
  async (params: GuardParams = {}, { rejectWithValue }) => {
    try {
      const response = await guardService.getGuards(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch guards';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGuard = createAsyncThunk(
  'guard/fetchGuard',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await guardService.getGuard(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch guard';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createGuard = createAsyncThunk(
  'guard/createGuard',
  async (data: FormData | Omit<Guard, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await guardService.createGuard(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create guard';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGuard = createAsyncThunk(
  'guard/updateGuard',
  async ({ id, data }: { id: number; data: FormData | Partial<Guard> }, { rejectWithValue }) => {
    try {
      return await guardService.updateGuard(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update guard';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteGuard = createAsyncThunk(
  'guard/deleteGuard',
  async (id: number, { rejectWithValue }) => {
    try {
      await guardService.deleteGuard(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete guard';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleGuardStatus = createAsyncThunk(
  'guard/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await guardService.toggleStatus(id, is_active);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle guard status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const guardSlice = createSlice({
  name: 'guard',
  initialState,
  reducers: {
    clearGuardError: (state) => {
      state.error = null;
    },
    clearCurrentGuard: (state) => {
      state.currentGuard = null;
    },
    setGuards: (state, action: PayloadAction<Guard[]>) => {
      state.guards = action.payload;
    },
    updateGuardInList: (state, action: PayloadAction<Guard>) => {
      const index = state.guards.findIndex(guard => guard.id === action.payload.id);
      if (index !== -1) {
        state.guards[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Guards
      .addCase(fetchGuards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guards = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchGuards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Single Guard
      .addCase(fetchGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGuard = action.payload;
      })
      .addCase(fetchGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Guard
      .addCase(createGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guards.unshift(action.payload);
        state.currentGuard = action.payload;
      })
      .addCase(createGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Guard
      .addCase(updateGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.guards.findIndex(guard => guard.id === action.payload.id);
        if (index !== -1) {
          state.guards[index] = action.payload;
        }
        if (state.currentGuard?.id === action.payload.id) {
          state.currentGuard = action.payload;
        }
      })
      .addCase(updateGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Guard
      .addCase(deleteGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guards = state.guards.filter(guard => guard.id !== action.payload);
        if (state.currentGuard?.id === action.payload) {
          state.currentGuard = null;
        }
      })
      .addCase(deleteGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleGuardStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleGuardStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.guards.findIndex(guard => guard.id === action.payload.id);
        if (index !== -1) {
          state.guards[index] = action.payload;
        }
        if (state.currentGuard?.id === action.payload.id) {
          state.currentGuard = action.payload;
        }
      })
      .addCase(toggleGuardStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearGuardError, 
  clearCurrentGuard, 
  setGuards,
  updateGuardInList 
} = guardSlice.actions;
export default guardSlice.reducer;