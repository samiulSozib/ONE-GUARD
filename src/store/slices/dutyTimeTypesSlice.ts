
import { DutyTimeType, DutyTimeTypeParams, DutyTimeTypeState } from '@/app/types/dutyTimeType';
import { dutyTimeTypeService } from '@/service/dutyTimeTypes.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: DutyTimeTypeState = {
  dutyTimeTypes: [],
  currentDutyTimeType: null,
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
export const fetchDutyTimeTypes = createAsyncThunk(
  'dutyTimeType/fetchDutyTimeTypes',
  async (params: DutyTimeTypeParams = {}, { rejectWithValue }) => {
    try {
      const response = await dutyTimeTypeService.getDutyTimeTypes(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site locations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDutyTimeType = createAsyncThunk(
  'dutyTimeType/fetchDutyTimeType',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await dutyTimeTypeService.getDutyTimeType(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createDutyTimeType = createAsyncThunk(
  'dutyTimeType/createDutyTimeType',
  async (data: Omit<DutyTimeType, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await dutyTimeTypeService.createDutyTimeType(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDutyTimeType = createAsyncThunk(
  'dutyTimeType/updateDutyTimeType',
  async ({ id, data }: { id: number; data: Partial<DutyTimeType> }, { rejectWithValue }) => {
    try {
      return await dutyTimeTypeService.updateDutyTimeType(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDutyTimeType = createAsyncThunk(
  'dutyTimeType/deleteDutyTimeType',
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyTimeTypeService.deleteDutyTimeType(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleDutyTimeTypeStatus = createAsyncThunk(
  'dutyTimeType/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await dutyTimeTypeService.toggleStatus(id, is_active);
      const updatedDutyTimeType=await dutyTimeTypeService.getDutyTimeType(id)
      return updatedDutyTimeType.item
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle site location status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const dutyTimeTypeSlice = createSlice({
  name: 'dutyTimeType',
  initialState,
  reducers: {
    clearDutyTimeTypeError: (state) => {
      state.error = null;
    },
    clearCurrentDutyTimeType: (state) => {
      state.currentDutyTimeType = null;
    },
    setDutyTimeTypes: (state, action: PayloadAction<DutyTimeType[]>) => {
      state.dutyTimeTypes = action.payload;
    },
    updateDutyTimeTypeInList: (state, action: PayloadAction<DutyTimeType>) => {
      const index = state.dutyTimeTypes.findIndex(location => location.id === action.payload.id);
      if (index !== -1) {
        state.dutyTimeTypes[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Site Locations
      .addCase(fetchDutyTimeTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDutyTimeTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dutyTimeTypes = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchDutyTimeTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Site Location
      .addCase(fetchDutyTimeType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDutyTimeType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDutyTimeType = action.payload.item;
      })
      .addCase(fetchDutyTimeType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Site Location
      .addCase(createDutyTimeType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDutyTimeType.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new site location to the beginning of the array
        state.dutyTimeTypes = [action.payload.item, ...state.dutyTimeTypes];
        state.currentDutyTimeType = action.payload.item;
        // Increment total count
        state.pagination.total += 1;
      })
      .addCase(createDutyTimeType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Site Location
      .addCase(updateDutyTimeType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDutyTimeType.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.dutyTimeTypes.findIndex(location => location.id === action.payload.item.id);
        if (index !== -1) {
          state.dutyTimeTypes[index] = action.payload.item;
        }
        if (state.currentDutyTimeType?.id === action.payload.item.id) {
          state.currentDutyTimeType = action.payload.item;
        }
      })
      .addCase(updateDutyTimeType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Site Location
      .addCase(deleteDutyTimeType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDutyTimeType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dutyTimeTypes = state.dutyTimeTypes.filter(location => location.id !== action.payload);
        if (state.currentDutyTimeType?.id === action.payload) {
          state.currentDutyTimeType = null;
        }
        // Decrement total count
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteDutyTimeType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleDutyTimeTypeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleDutyTimeTypeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.dutyTimeTypes.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.dutyTimeTypes[index] = action.payload;
        }
        if (state.currentDutyTimeType?.id === action.payload.id) {
          state.currentDutyTimeType = action.payload;
        }
      })
      .addCase(toggleDutyTimeTypeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearDutyTimeTypeError,
  clearCurrentDutyTimeType,
  setDutyTimeTypes,
  updateDutyTimeTypeInList
} = dutyTimeTypeSlice.actions;
export default dutyTimeTypeSlice.reducer;