// store/slices/company-service-category.slice.ts
import { CompanyServiceCategory, CompanyServiceCategoryParams, CompanyServiceCategoryState, CreateCompanyServiceCategoryDto, UpdateCompanyServiceCategoryDto } from '@/app/types/company-service-category';
import { companyServiceCategoryService } from '@/service/company-service-category.service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: CompanyServiceCategoryState = {
  companyServiceCategories: [],
  currentCompanyServiceCategory: null,
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
export const fetchCompanyServiceCategories = createAsyncThunk(
  'companyServiceCategory/fetchCompanyServiceCategories',
  async (params: CompanyServiceCategoryParams = {}, { rejectWithValue }) => {
    try {
      const response = await companyServiceCategoryService.getCompanyServiceCategories(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCompanyServiceCategory = createAsyncThunk(
  'companyServiceCategory/fetchCompanyServiceCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      return await companyServiceCategoryService.getCompanyServiceCategory(id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyServiceCategory = createAsyncThunk(
  'companyServiceCategory/createCompanyServiceCategory',
  async (data: CreateCompanyServiceCategoryDto, { rejectWithValue }) => {
    try {
      return await companyServiceCategoryService.createCompanyServiceCategory(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyServiceCategory = createAsyncThunk(
  'companyServiceCategory/updateCompanyServiceCategory',
  async ({ id, data }: { id: number; data: UpdateCompanyServiceCategoryDto }, { rejectWithValue }) => {
    try {
      return await companyServiceCategoryService.updateCompanyServiceCategory(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyServiceCategory = createAsyncThunk(
  'companyServiceCategory/deleteCompanyServiceCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await companyServiceCategoryService.deleteCompanyServiceCategory(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleCompanyServiceCategoryStatus = createAsyncThunk(
  'companyServiceCategory/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      await companyServiceCategoryService.toggleStatus(id, is_active);
      const updatedCategory = await companyServiceCategoryService.getCompanyServiceCategory(id);
      return updatedCategory.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle category status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const companyServiceCategorySlice = createSlice({
  name: 'companyServiceCategory',
  initialState,
  reducers: {
    clearCompanyServiceCategoryError: (state) => {
      state.error = null;
    },
    clearCurrentCompanyServiceCategory: (state) => {
      state.currentCompanyServiceCategory = null;
    },
    setCompanyServiceCategories: (state, action: PayloadAction<CompanyServiceCategory[]>) => {
      state.companyServiceCategories = action.payload;
    },
    updateCompanyServiceCategoryInList: (state, action: PayloadAction<CompanyServiceCategory>) => {
      const index = state.companyServiceCategories.findIndex(category => category.id === action.payload.id);
      if (index !== -1) {
        state.companyServiceCategories[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCompanyServiceCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceCategories = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchCompanyServiceCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Category
      .addCase(fetchCompanyServiceCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyServiceCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCompanyServiceCategory = action.payload.item;
      })
      .addCase(fetchCompanyServiceCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Category
      .addCase(createCompanyServiceCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyServiceCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceCategories = [action.payload.item, ...state.companyServiceCategories];
        state.currentCompanyServiceCategory = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createCompanyServiceCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Category
      .addCase(updateCompanyServiceCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyServiceCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceCategories.findIndex(category => category.id === action.payload.item.id);
        if (index !== -1) {
          state.companyServiceCategories[index] = action.payload.item;
        }
        if (state.currentCompanyServiceCategory?.id === action.payload.item.id) {
          state.currentCompanyServiceCategory = action.payload.item;
        }
      })
      .addCase(updateCompanyServiceCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Category
      .addCase(deleteCompanyServiceCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCompanyServiceCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyServiceCategories = state.companyServiceCategories.filter(category => category.id !== action.payload);
        if (state.currentCompanyServiceCategory?.id === action.payload) {
          state.currentCompanyServiceCategory = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCompanyServiceCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleCompanyServiceCategoryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCompanyServiceCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companyServiceCategories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.companyServiceCategories[index] = action.payload;
        }
        if (state.currentCompanyServiceCategory?.id === action.payload.id) {
          state.currentCompanyServiceCategory = action.payload;
        }
      })
      .addCase(toggleCompanyServiceCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCompanyServiceCategoryError,
  clearCurrentCompanyServiceCategory,
  setCompanyServiceCategories,
  updateCompanyServiceCategoryInList
} = companyServiceCategorySlice.actions;

export default companyServiceCategorySlice.reducer;
