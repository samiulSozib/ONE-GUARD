// store/slices/company-service-component.slice.ts
import { CompanyServiceComponent, CompanyServiceComponentParams, CompanyServiceComponentState } from '@/app/types/company-service-component';
import { companyServiceComponentService } from '@/service/company-service-component.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: CompanyServiceComponentState = {
  companyServiceComponents: [],
  currentCompanyServiceComponent: null,
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
export const fetchCompanyServiceComponents = createAsyncThunk(
  'companyServiceComponent/fetchCompanyServiceComponents',
  async (params: CompanyServiceComponentParams = {}, { rejectWithValue }) => {
    try {
      const response = await companyServiceComponentService.getCompanyServiceComponents(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch components';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCompanyServiceComponent = createAsyncThunk(
  'companyServiceComponent/fetchCompanyServiceComponent',
  async (id: number, { rejectWithValue }) => {
    try {
      return await companyServiceComponentService.getCompanyServiceComponent(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch component';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyServiceComponent = createAsyncThunk(
  'companyServiceComponent/createCompanyServiceComponent',
  async (data: Omit<CompanyServiceComponent, 'id' | 'created_at' | 'updated_at' | 'parent_service' | 'component_service'>, { rejectWithValue }) => {
    try {
      return await companyServiceComponentService.createCompanyServiceComponent(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create component';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyServiceComponent = createAsyncThunk(
  'companyServiceComponent/updateCompanyServiceComponent',
  async ({ id, data }: { id: number; data: Partial<CompanyServiceComponent> }, { rejectWithValue }) => {
    try {
      return await companyServiceComponentService.updateCompanyServiceComponent(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update component';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyServiceComponent = createAsyncThunk(
  'companyServiceComponent/deleteCompanyServiceComponent',
  async (id: number, { rejectWithValue }) => {
    try {
      await companyServiceComponentService.deleteCompanyServiceComponent(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete component';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleCompanyServiceComponentStatus = createAsyncThunk(
  'companyServiceComponent/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await companyServiceComponentService.toggleStatus(id, is_active);
      const updatedComponent = await companyServiceComponentService.getCompanyServiceComponent(id);
      return updatedComponent.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle component status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const companyServiceComponentSlice = createSlice({
  name: 'companyServiceComponent',
  initialState,
  reducers: {
    clearCompanyServiceComponentError: (state) => {
      state.error = null;
    },
    clearCurrentCompanyServiceComponent: (state) => {
      state.currentCompanyServiceComponent = null;
    },
    setCompanyServiceComponents: (state, action: PayloadAction<CompanyServiceComponent[]>) => {
      state.companyServiceComponents = action.payload;
    },
    updateCompanyServiceComponentInList: (state, action: PayloadAction<CompanyServiceComponent>) => {
      const index = state.companyServiceComponents.findIndex(component => component.id === action.payload.id);
      if (index !== -1) {
        state.companyServiceComponents[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Components
      .addCase(fetchCompanyServiceComponents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceComponents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceComponents = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchCompanyServiceComponents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Component
      .addCase(fetchCompanyServiceComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompanyServiceComponent = action.payload.item;
      })
      .addCase(fetchCompanyServiceComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Component
      .addCase(createCompanyServiceComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyServiceComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceComponents = [action.payload.item, ...state.companyServiceComponents];
        state.currentCompanyServiceComponent = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createCompanyServiceComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Component
      .addCase(updateCompanyServiceComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyServiceComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceComponents.findIndex(component => component.id === action.payload.item.id);
        if (index !== -1) {
          state.companyServiceComponents[index] = action.payload.item;
        }
        if (state.currentCompanyServiceComponent?.id === action.payload.item.id) {
          state.currentCompanyServiceComponent = action.payload.item;
        }
      })
      .addCase(updateCompanyServiceComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Component
      .addCase(deleteCompanyServiceComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompanyServiceComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceComponents = state.companyServiceComponents.filter(component => component.id !== action.payload);
        if (state.currentCompanyServiceComponent?.id === action.payload) {
          state.currentCompanyServiceComponent = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCompanyServiceComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleCompanyServiceComponentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCompanyServiceComponentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceComponents.findIndex(component => component.id === action.payload.id);
        if (index !== -1) {
          state.companyServiceComponents[index] = action.payload;
        }
        if (state.currentCompanyServiceComponent?.id === action.payload.id) {
          state.currentCompanyServiceComponent = action.payload;
        }
      })
      .addCase(toggleCompanyServiceComponentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCompanyServiceComponentError,
  clearCurrentCompanyServiceComponent,
  setCompanyServiceComponents,
  updateCompanyServiceComponentInList
} = companyServiceComponentSlice.actions;

export default companyServiceComponentSlice.reducer;
