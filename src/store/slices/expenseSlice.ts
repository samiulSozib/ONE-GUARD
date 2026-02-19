import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { expenseService } from "@/service/expense.service";
import {
  Expense,
  ExpenseParams,
  ExpenseState,
  CreateExpenseDto,
} from "@/app/types/expense";

/* ------------------ Initial State ------------------ */

const initialState: ExpenseState = {
  expenses: [],
  currentExpense: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  error: null,
};

/* ------------------ Thunks ------------------ */

// Fetch all expenses
export const fetchExpenses = createAsyncThunk(
  "expense/fetchExpenses",
  async (params: ExpenseParams = {}, { rejectWithValue }) => {
    try {
      return await expenseService.getExpenses(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch expenses";
      return rejectWithValue(message);
    }
  }
);

// Fetch single expense
export const fetchExpense = createAsyncThunk(
  "expense/fetchExpense",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await expenseService.getExpense(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch expense";
      return rejectWithValue(message);
    }
  }
);

// Create expense
export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (
    data: CreateExpenseDto,
    { rejectWithValue }
  ) => {
    try {
      return await expenseService.createExpense(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create expense";
      return rejectWithValue(message);
    }
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (
    { id, data }: { id: number; data: CreateExpenseDto },
    { rejectWithValue }
  ) => {
    try {
      return await expenseService.updateExpense(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update expense";
      return rejectWithValue(message);
    }
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (id: number, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete expense";
      return rejectWithValue(message);
    }
  }
);

// Toggle expense visibility
export const toggleExpenseVisibility = createAsyncThunk(
  "expense/toggleVisibility",
  async (
    {
      id,
      payload,
    }: {
      id: number;
      payload: {
        is_visible_to_client?: boolean;
        is_visible_to_guard?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await expenseService.toggleVisibility(id, payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle expense visibility";
      return rejectWithValue(message);
    }
  }
);

// Change expense status via query param
export const changeExpenseStatus = createAsyncThunk(
  "expense/changeStatus",
  async (
    { id, status }: { id: number; status: 'pending' | 'approved' | 'rejected' },
    { rejectWithValue }
  ) => {
    try {
      return await expenseService.changeStatus(id, status);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to change expense status";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    updateExpenseInList: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch expenses ---------- */
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch single expense ---------- */
      .addCase(fetchExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpense = action.payload.item;
      })
      .addCase(fetchExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Create expense ---------- */
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = [
          action.payload.item,
          ...state.expenses,
        ];
        state.currentExpense = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update expense ---------- */
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenses.findIndex(
          (c) => c.id === action.payload.item.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload.item;
        }
        if (state.currentExpense?.id === action.payload.item.id) {
          state.currentExpense = action.payload.item;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Delete expense ---------- */
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = state.expenses.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentExpense?.id === action.payload) {
          state.currentExpense = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Toggle visibility ---------- */
      .addCase(toggleExpenseVisibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleExpenseVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(toggleExpenseVisibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Change expense status via query param ---------- */
      .addCase(changeExpenseStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeExpenseStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(changeExpenseStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearExpenseError,
  clearCurrentExpense,
  setExpenses,
  updateExpenseInList,
} = expenseSlice.actions;

export default expenseSlice.reducer;