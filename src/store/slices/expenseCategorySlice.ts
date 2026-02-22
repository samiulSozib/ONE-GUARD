
import { ExpenseCategory, ExpenseCategoryParams, ExpenseCategoryState } from '@/app/types/expenseCategory';
import { expenseCategoryService } from '@/service/expenseCategory.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: ExpenseCategoryState = {
  expenseCategories: [],
  currentExpenseCategory: null,
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
export const fetchExpenseCategorys = createAsyncThunk(
  'expenseCategory/fetchExpenseCategorys',
  async (params: ExpenseCategoryParams = {}, { rejectWithValue }) => {
    try {
      const response = await expenseCategoryService.getExpenseCategorys(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site locations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchExpenseCategory = createAsyncThunk(
  'expenseCategory/fetchExpenseCategory',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      return await expenseCategoryService.getExpenseCategory(id, params);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createExpenseCategory = createAsyncThunk(
  'expenseCategory/createExpenseCategory',
  async (data: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await expenseCategoryService.createExpenseCategory(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateExpenseCategory = createAsyncThunk(
  'expenseCategory/updateExpenseCategory',
  async ({ id, data }: { id: number; data: Partial<ExpenseCategory> }, { rejectWithValue }) => {
    try {
      return await expenseCategoryService.updateExpenseCategory(id, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteExpenseCategory = createAsyncThunk(
  'expenseCategory/deleteExpenseCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await expenseCategoryService.deleteExpenseCategory(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site location';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleExpenseCategoryStatus = createAsyncThunk(
  'expenseCategory/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
       await expenseCategoryService.toggleStatus(id, is_active);
       const updatedExpenseCategory=await expenseCategoryService.getExpenseCategory(id)
       return updatedExpenseCategory.item
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle site location status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const expenseCategorySlice = createSlice({
  name: 'expenseCategory',
  initialState,
  reducers: {
    clearExpenseCategoryError: (state) => {
      state.error = null;
    },
    clearCurrentExpenseCategory: (state) => {
      state.currentExpenseCategory = null;
    },
    setExpenseCategorys: (state, action: PayloadAction<ExpenseCategory[]>) => {
      state.expenseCategories = action.payload;
    },
    updateExpenseCategoryInList: (state, action: PayloadAction<ExpenseCategory>) => {
      const index = state.expenseCategories.findIndex(location => location.id === action.payload.id);
      if (index !== -1) {
        state.expenseCategories[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Site Locations
      .addCase(fetchExpenseCategorys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategorys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseCategories = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchExpenseCategorys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Site Location
      .addCase(fetchExpenseCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpenseCategory = action.payload.item;
      })
      .addCase(fetchExpenseCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Site Location
      .addCase(createExpenseCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpenseCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new site location to the beginning of the array
        state.expenseCategories = [action.payload.item, ...state.expenseCategories];
        state.currentExpenseCategory = action.payload.item;
        // Increment total count
        state.pagination.total += 1;
      })
      .addCase(createExpenseCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Site Location
      .addCase(updateExpenseCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpenseCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenseCategories.findIndex(location => location.id === action.payload.item.id);
        if (index !== -1) {
          state.expenseCategories[index] = action.payload.item;
        }
        if (state.currentExpenseCategory?.id === action.payload.item.id) {
          state.currentExpenseCategory = action.payload.item;
        }
      })
      .addCase(updateExpenseCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Site Location
      .addCase(deleteExpenseCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseCategories = state.expenseCategories.filter(location => location.id !== action.payload);
        if (state.currentExpenseCategory?.id === action.payload) {
          state.currentExpenseCategory = null;
        }
        // Decrement total count
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteExpenseCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle Status
      .addCase(toggleExpenseCategoryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleExpenseCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenseCategories.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.expenseCategories[index] = action.payload;
        }
        if (state.currentExpenseCategory?.id === action.payload.id) {
          state.currentExpenseCategory = action.payload;
        }
      })
      .addCase(toggleExpenseCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearExpenseCategoryError,
  clearCurrentExpenseCategory,
  setExpenseCategorys,
  updateExpenseCategoryInList
} = expenseCategorySlice.actions;
export default expenseCategorySlice.reducer;