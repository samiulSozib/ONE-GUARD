// store/slices/company-service-billing-method.slice.ts
import { CompanyServiceBillingMethod, CompanyServiceBillingMethodParams, CompanyServiceBillingMethodState, CreateCompanyServiceBillingMethodDto, UpdateCompanyServiceBillingMethodDto } from '@/app/types/company-service-billing-method';
import { companyServiceBillingMethodService } from '@/service/company-service-billing-method.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: CompanyServiceBillingMethodState = {
  companyServiceBillingMethods: [],
  currentCompanyServiceBillingMethod: null,
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
export const fetchCompanyServiceBillingMethods = createAsyncThunk(
  'companyServiceBillingMethod/fetchCompanyServiceBillingMethods',
  async (params: CompanyServiceBillingMethodParams = {}, { rejectWithValue }) => {
    try {
      const response = await companyServiceBillingMethodService.getCompanyServiceBillingMethods(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch billing methods';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCompanyServiceBillingMethod = createAsyncThunk(
  'companyServiceBillingMethod/fetchCompanyServiceBillingMethod',
  async (id: number, { rejectWithValue }) => {
    try {
      return await companyServiceBillingMethodService.getCompanyServiceBillingMethod(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch billing method';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyServiceBillingMethod = createAsyncThunk(
  'companyServiceBillingMethod/createCompanyServiceBillingMethod',
  async (data: CreateCompanyServiceBillingMethodDto, { rejectWithValue }) => {
    try {
      return await companyServiceBillingMethodService.createCompanyServiceBillingMethod(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create billing method';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyServiceBillingMethod = createAsyncThunk(
  'companyServiceBillingMethod/updateCompanyServiceBillingMethod',
  async ({ id, data }: { id: number; data: UpdateCompanyServiceBillingMethodDto }, { rejectWithValue }) => {
    try {
      return await companyServiceBillingMethodService.updateCompanyServiceBillingMethod(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update billing method';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyServiceBillingMethod = createAsyncThunk(
  'companyServiceBillingMethod/deleteCompanyServiceBillingMethod',
  async (id: number, { rejectWithValue }) => {
    try {
      await companyServiceBillingMethodService.deleteCompanyServiceBillingMethod(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete billing method';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleCompanyServiceBillingMethodStatus = createAsyncThunk(
  'companyServiceBillingMethod/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await companyServiceBillingMethodService.toggleStatus(id, is_active);
      const updatedBillingMethod = await companyServiceBillingMethodService.getCompanyServiceBillingMethod(id);
      return updatedBillingMethod.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle billing method status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const companyServiceBillingMethodSlice = createSlice({
  name: 'companyServiceBillingMethod',
  initialState,
  reducers: {
    clearCompanyServiceBillingMethodError: (state) => {
      state.error = null;
    },
    clearCurrentCompanyServiceBillingMethod: (state) => {
      state.currentCompanyServiceBillingMethod = null;
    },
    setCompanyServiceBillingMethods: (state, action: PayloadAction<CompanyServiceBillingMethod[]>) => {
      state.companyServiceBillingMethods = action.payload;
    },
    updateCompanyServiceBillingMethodInList: (state, action: PayloadAction<CompanyServiceBillingMethod>) => {
      const index = state.companyServiceBillingMethods.findIndex(billingMethod => billingMethod.id === action.payload.id);
      if (index !== -1) {
        state.companyServiceBillingMethods[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Billing Methods
      .addCase(fetchCompanyServiceBillingMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceBillingMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceBillingMethods = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchCompanyServiceBillingMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Billing Method
      .addCase(fetchCompanyServiceBillingMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceBillingMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompanyServiceBillingMethod = action.payload.item;
      })
      .addCase(fetchCompanyServiceBillingMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Billing Method
      .addCase(createCompanyServiceBillingMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyServiceBillingMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceBillingMethods = [action.payload.item, ...state.companyServiceBillingMethods];
        state.currentCompanyServiceBillingMethod = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createCompanyServiceBillingMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Billing Method
      .addCase(updateCompanyServiceBillingMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyServiceBillingMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceBillingMethods.findIndex(billingMethod => billingMethod.id === action.payload.item.id);
        if (index !== -1) {
          state.companyServiceBillingMethods[index] = action.payload.item;
        }
        if (state.currentCompanyServiceBillingMethod?.id === action.payload.item.id) {
          state.currentCompanyServiceBillingMethod = action.payload.item;
        }
      })
      .addCase(updateCompanyServiceBillingMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Billing Method
      .addCase(deleteCompanyServiceBillingMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompanyServiceBillingMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceBillingMethods = state.companyServiceBillingMethods.filter(billingMethod => billingMethod.id !== action.payload);
        if (state.currentCompanyServiceBillingMethod?.id === action.payload) {
          state.currentCompanyServiceBillingMethod = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCompanyServiceBillingMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleCompanyServiceBillingMethodStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCompanyServiceBillingMethodStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceBillingMethods.findIndex(billingMethod => billingMethod.id === action.payload.id);
        if (index !== -1) {
          state.companyServiceBillingMethods[index] = action.payload;
        }
        if (state.currentCompanyServiceBillingMethod?.id === action.payload.id) {
          state.currentCompanyServiceBillingMethod = action.payload;
        }
      })
      .addCase(toggleCompanyServiceBillingMethodStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCompanyServiceBillingMethodError,
  clearCurrentCompanyServiceBillingMethod,
  setCompanyServiceBillingMethods,
  updateCompanyServiceBillingMethodInList
} = companyServiceBillingMethodSlice.actions;

export default companyServiceBillingMethodSlice.reducer;
