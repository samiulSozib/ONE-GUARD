// store/slices/company-service-unit-type.slice.ts
import { CompanyServiceUnitType, CompanyServiceUnitTypeParams, CompanyServiceUnitTypeState } from '@/app/types/company-service-unit-type';
import { companyServiceUnitTypeService } from '@/service/company-service-unit-type.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: CompanyServiceUnitTypeState = {
  companyServiceUnitTypes: [],
  currentCompanyServiceUnitType: null,
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
export const fetchCompanyServiceUnitTypes = createAsyncThunk(
  'companyServiceUnitType/fetchCompanyServiceUnitTypes',
  async (params: CompanyServiceUnitTypeParams = {}, { rejectWithValue }) => {
    try {
      const response = await companyServiceUnitTypeService.getCompanyServiceUnitTypes(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unit types';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCompanyServiceUnitType = createAsyncThunk(
  'companyServiceUnitType/fetchCompanyServiceUnitType',
  async (id: number, { rejectWithValue }) => {
    try {
      return await companyServiceUnitTypeService.getCompanyServiceUnitType(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unit type';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyServiceUnitType = createAsyncThunk(
  'companyServiceUnitType/createCompanyServiceUnitType',
  async (data: Omit<CompanyServiceUnitType, 'id' | 'created_at' | 'updated_at' | 'services_count'>, { rejectWithValue }) => {
    try {
      return await companyServiceUnitTypeService.createCompanyServiceUnitType(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create unit type';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyServiceUnitType = createAsyncThunk(
  'companyServiceUnitType/updateCompanyServiceUnitType',
  async ({ id, data }: { id: number; data: Partial<CompanyServiceUnitType> }, { rejectWithValue }) => {
    try {
      return await companyServiceUnitTypeService.updateCompanyServiceUnitType(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update unit type';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyServiceUnitType = createAsyncThunk(
  'companyServiceUnitType/deleteCompanyServiceUnitType',
  async (id: number, { rejectWithValue }) => {
    try {
      await companyServiceUnitTypeService.deleteCompanyServiceUnitType(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete unit type';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleCompanyServiceUnitTypeStatus = createAsyncThunk(
  'companyServiceUnitType/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await companyServiceUnitTypeService.toggleStatus(id, is_active);
      const updatedUnitType = await companyServiceUnitTypeService.getCompanyServiceUnitType(id);
      return updatedUnitType.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle unit type status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const companyServiceUnitTypeSlice = createSlice({
  name: 'companyServiceUnitType',
  initialState,
  reducers: {
    clearCompanyServiceUnitTypeError: (state) => {
      state.error = null;
    },
    clearCurrentCompanyServiceUnitType: (state) => {
      state.currentCompanyServiceUnitType = null;
    },
    setCompanyServiceUnitTypes: (state, action: PayloadAction<CompanyServiceUnitType[]>) => {
      state.companyServiceUnitTypes = action.payload;
    },
    updateCompanyServiceUnitTypeInList: (state, action: PayloadAction<CompanyServiceUnitType>) => {
      const index = state.companyServiceUnitTypes.findIndex(unitType => unitType.id === action.payload.id);
      if (index !== -1) {
        state.companyServiceUnitTypes[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Unit Types
      .addCase(fetchCompanyServiceUnitTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceUnitTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceUnitTypes = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchCompanyServiceUnitTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Unit Type
      .addCase(fetchCompanyServiceUnitType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceUnitType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompanyServiceUnitType = action.payload.item;
      })
      .addCase(fetchCompanyServiceUnitType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Unit Type
      .addCase(createCompanyServiceUnitType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyServiceUnitType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceUnitTypes = [action.payload.item, ...state.companyServiceUnitTypes];
        state.currentCompanyServiceUnitType = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createCompanyServiceUnitType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Unit Type
      .addCase(updateCompanyServiceUnitType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyServiceUnitType.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceUnitTypes.findIndex(unitType => unitType.id === action.payload.item.id);
        if (index !== -1) {
          state.companyServiceUnitTypes[index] = action.payload.item;
        }
        if (state.currentCompanyServiceUnitType?.id === action.payload.item.id) {
          state.currentCompanyServiceUnitType = action.payload.item;
        }
      })
      .addCase(updateCompanyServiceUnitType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Unit Type
      .addCase(deleteCompanyServiceUnitType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompanyServiceUnitType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceUnitTypes = state.companyServiceUnitTypes.filter(unitType => unitType.id !== action.payload);
        if (state.currentCompanyServiceUnitType?.id === action.payload) {
          state.currentCompanyServiceUnitType = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCompanyServiceUnitType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleCompanyServiceUnitTypeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCompanyServiceUnitTypeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceUnitTypes.findIndex(unitType => unitType.id === action.payload.id);
        if (index !== -1) {
          state.companyServiceUnitTypes[index] = action.payload;
        }
        if (state.currentCompanyServiceUnitType?.id === action.payload.id) {
          state.currentCompanyServiceUnitType = action.payload;
        }
      })
      .addCase(toggleCompanyServiceUnitTypeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCompanyServiceUnitTypeError,
  clearCurrentCompanyServiceUnitType,
  setCompanyServiceUnitTypes,
  updateCompanyServiceUnitTypeInList
} = companyServiceUnitTypeSlice.actions;

export default companyServiceUnitTypeSlice.reducer;
