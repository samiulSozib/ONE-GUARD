// store/slices/company-service.slice.ts
import { CompanyService, CompanyServiceParams, CompanyServiceState } from '@/app/types/company-service';
import { companyServiceService } from '@/service/company-service.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: CompanyServiceState = {
  companyServices: [],
  currentCompanyService: null,
  packageServices: [],
  standaloneServices: [],
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
export const fetchCompanyServices = createAsyncThunk(
  'companyService/fetchCompanyServices',
  async (params: CompanyServiceParams = {}, { rejectWithValue }) => {
    try {
      const response = await companyServiceService.getCompanyServices(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCompanyService = createAsyncThunk(
  'companyService/fetchCompanyService',
  async (id: number, { rejectWithValue }) => {
    try {
      return await companyServiceService.getCompanyService(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyService = createAsyncThunk(
  'companyService/createCompanyService',
  async (data: Omit<CompanyService, 'id' | 'created_at' | 'updated_at' | 'category' | 'unit_type' | 'billing_method' | 'components'>, { rejectWithValue }) => {
    try {
      return await companyServiceService.createCompanyService(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyService = createAsyncThunk(
  'companyService/updateCompanyService',
  async ({ id, data }: { id: number; data: Partial<CompanyService> }, { rejectWithValue }) => {
    try {
      return await companyServiceService.updateCompanyService(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyService = createAsyncThunk(
  'companyService/deleteCompanyService',
  async (id: number, { rejectWithValue }) => {
    try {
      await companyServiceService.deleteCompanyService(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleCompanyServiceStatus = createAsyncThunk(
  'companyService/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await companyServiceService.toggleStatus(id, is_active);
      const updatedService = await companyServiceService.getCompanyService(id);
      return updatedService.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle service status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const companyServiceSlice = createSlice({
  name: 'companyService',
  initialState,
  reducers: {
    clearCompanyServiceError: (state) => {
      state.error = null;
    },
    clearCurrentCompanyService: (state) => {
      state.currentCompanyService = null;
    },
    setCompanyServices: (state, action: PayloadAction<CompanyService[]>) => {
      state.companyServices = action.payload;
    },
    updateCompanyServiceInList: (state, action: PayloadAction<CompanyService>) => {
      const index = state.companyServices.findIndex(service => service.id === action.payload.id);
      if (index !== -1) {
        state.companyServices[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchCompanyServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServices = action.payload.items;
        state.pagination = action.payload.data;
        // Update categorized lists
        state.packageServices = action.payload.items.filter(
          (service: CompanyService) => service.is_package
        );
        state.standaloneServices = action.payload.items.filter(
          (service: CompanyService) => !service.is_package && service.service_type === 'standalone'
        );
      })
      .addCase(fetchCompanyServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Service
      .addCase(fetchCompanyService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompanyService = action.payload.item;
      })
      .addCase(fetchCompanyService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Service
      .addCase(createCompanyService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServices = [action.payload.item, ...state.companyServices];
        state.currentCompanyService = action.payload.item;
        state.pagination.total += 1;
        // Update categorized lists
        if (action.payload.item.is_package) {
          state.packageServices = [action.payload.item, ...state.packageServices];
        } else {
          state.standaloneServices = [action.payload.item, ...state.standaloneServices];
        }
      })
      .addCase(createCompanyService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Service
      .addCase(updateCompanyService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyService.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServices.findIndex(service => service.id === action.payload.item.id);
        if (index !== -1) {
          state.companyServices[index] = action.payload.item;
        }
        if (state.currentCompanyService?.id === action.payload.item.id) {
          state.currentCompanyService = action.payload.item;
        }
        // Update categorized lists
        const pkgIndex = state.packageServices.findIndex(service => service.id === action.payload.item.id);
        if (pkgIndex !== -1) {
          state.packageServices[pkgIndex] = action.payload.item;
        }
        const stdIndex = state.standaloneServices.findIndex(service => service.id === action.payload.item.id);
        if (stdIndex !== -1) {
          state.standaloneServices[stdIndex] = action.payload.item;
        }
      })
      .addCase(updateCompanyService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Service
      .addCase(deleteCompanyService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompanyService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServices = state.companyServices.filter(service => service.id !== action.payload);
        state.packageServices = state.packageServices.filter(service => service.id !== action.payload);
        state.standaloneServices = state.standaloneServices.filter(service => service.id !== action.payload);
        if (state.currentCompanyService?.id === action.payload) {
          state.currentCompanyService = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCompanyService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleCompanyServiceStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCompanyServiceStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServices.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.companyServices[index] = action.payload;
        }
        if (state.currentCompanyService?.id === action.payload.id) {
          state.currentCompanyService = action.payload;
        }
        // Update categorized lists
        const pkgIndex = state.packageServices.findIndex(service => service.id === action.payload.id);
        if (pkgIndex !== -1) {
          state.packageServices[pkgIndex] = action.payload;
        }
        const stdIndex = state.standaloneServices.findIndex(service => service.id === action.payload.id);
        if (stdIndex !== -1) {
          state.standaloneServices[stdIndex] = action.payload;
        }
      })
      .addCase(toggleCompanyServiceStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCompanyServiceError,
  clearCurrentCompanyService,
  setCompanyServices,
  updateCompanyServiceInList
} = companyServiceSlice.actions;

export default companyServiceSlice.reducer;
