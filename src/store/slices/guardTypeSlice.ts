
import { GuardType, GuardTypeParams, GuardTypeState } from '@/app/types/guard-type';
import { guardTypeService } from '@/service/guardType.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: GuardTypeState = {
  guardTypes: [],
  currentGuardType: null,
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
export const fetchGuardTypes = createAsyncThunk(
  'guardType/fetchGuardTypes',
  async (params: GuardTypeParams = {}, { rejectWithValue }) => {
    try {
      const response = await guardTypeService.getGuardTypes(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site locations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGuardType = createAsyncThunk(
  'guardType/fetchGuardType',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await guardTypeService.getGuardType(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createGuardType = createAsyncThunk(
  'guardType/createGuardType',
  async (data: Omit<GuardType, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await guardTypeService.createGuardType(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGuardType = createAsyncThunk(
  'guardType/updateGuardType',
  async ({ id, data }: { id: number; data: Partial<GuardType> }, { rejectWithValue }) => {
    try {
      return await guardTypeService.updateGuardType(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteGuardType = createAsyncThunk(
  'guardType/deleteGuardType',
  async (id: number, { rejectWithValue }) => {
    try {
      await guardTypeService.deleteGuardType(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleGuardTypeStatus = createAsyncThunk(
  'guardType/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      return await guardTypeService.toggleStatus(id, is_active);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle site location status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const guardTypeSlice = createSlice({
  name: 'guardType',
  initialState,
  reducers: {
    clearGuardTypeError: (state) => {
      state.error = null;
    },
    clearCurrentGuardType: (state) => {
      state.currentGuardType = null;
    },
    setGuardTypes: (state, action: PayloadAction<GuardType[]>) => {
      state.guardTypes = action.payload;
    },
    updateGuardTypeInList: (state, action: PayloadAction<GuardType>) => {
      const index = state.guardTypes.findIndex(location => location.id === action.payload.id);
      if (index !== -1) {
        state.guardTypes[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Site Locations
      .addCase(fetchGuardTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuardTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guardTypes = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchGuardTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Site Location
      .addCase(fetchGuardType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuardType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGuardType = action.payload.item;
      })
      .addCase(fetchGuardType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Site Location
      .addCase(createGuardType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGuardType.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new site location to the beginning of the array
        state.guardTypes = [action.payload, ...state.guardTypes];
        state.currentGuardType = action.payload;
        // Increment total count
        state.pagination.total += 1;
      })
      .addCase(createGuardType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Site Location
      .addCase(updateGuardType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGuardType.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.guardTypes.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.guardTypes[index] = action.payload;
        }
        if (state.currentGuardType?.id === action.payload.id) {
          state.currentGuardType = action.payload;
        }
      })
      .addCase(updateGuardType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Site Location
      .addCase(deleteGuardType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGuardType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guardTypes = state.guardTypes.filter(location => location.id !== action.payload);
        if (state.currentGuardType?.id === action.payload) {
          state.currentGuardType = null;
        }
        // Decrement total count
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteGuardType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleGuardTypeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleGuardTypeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.guardTypes.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.guardTypes[index] = action.payload;
        }
        if (state.currentGuardType?.id === action.payload.id) {
          state.currentGuardType = action.payload;
        }
      })
      .addCase(toggleGuardTypeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearGuardTypeError,
  clearCurrentGuardType,
  setGuardTypes,
  updateGuardTypeInList
} = guardTypeSlice.actions;
export default guardTypeSlice.reducer;