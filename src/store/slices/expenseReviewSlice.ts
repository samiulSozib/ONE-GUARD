import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { expenseReviewService } from "@/service/expenseReview.service";
import {
  ExpenseReview,
  ExpenseReviewParams,
  ExpenseReviewState,
  CreateExpenseReviewDto,
} from "@/app/types/expenseReview";

/* ------------------ Initial State ------------------ */

const initialState: ExpenseReviewState = {
  expenseReviews: [],
  currentExpenseReview: null,
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

// Fetch all expense reviews
export const fetchExpenseReviews = createAsyncThunk(
  "expenseReview/fetchExpenseReviews",
  async (params: ExpenseReviewParams = {}, { rejectWithValue }) => {
    try {
      const response = await expenseReviewService.getExpenseReviews(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch expense reviews";
      return rejectWithValue(message);
    }
  }
);

// Fetch single expense review
export const fetchExpenseReview = createAsyncThunk(
  "expenseReview/fetchExpenseReview",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseReviewService.getExpenseReview(id, params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch expense review";
      return rejectWithValue(message);
    }
  }
);

// Create expense review
export const createExpenseReview = createAsyncThunk(
  "expenseReview/createExpenseReview",
  async (
    data: FormData | CreateExpenseReviewDto,
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseReviewService.createExpenseReview(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create expense review";
      return rejectWithValue(message);
    }
  }
);

// Update expense review
export const updateExpenseReview = createAsyncThunk(
  "expenseReview/updateExpenseReview",
  async (
    { id, data }: { id: number; data: FormData | CreateExpenseReviewDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseReviewService.updateExpenseReview(id, data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update expense review";
      return rejectWithValue(message);
    }
  }
);

// Delete expense review
export const deleteExpenseReview = createAsyncThunk(
  "expenseReview/deleteExpenseReview",
  async (id: number, { rejectWithValue }) => {
    try {
      await expenseReviewService.deleteExpenseReview(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete expense review";
      return rejectWithValue(message);
    }
  }
);

// Change expense review status/decision - FIXED: Using correct service method name
export const changeExpenseReviewStatus = createAsyncThunk(
  "expenseReview/changeStatus",
  async (
    { id, decision }: { id: number; decision: 'pending' | 'approved' | 'rejected' },
    { rejectWithValue }
  ) => {
    try {
      // First change the status
      await expenseReviewService.changeStatus(id, decision);
      
      // Then fetch the updated expense review
      const updatedExpenseReview = await expenseReviewService.getExpenseReview(id);
      
      return updatedExpenseReview.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to change expense review status";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const expenseReviewSlice = createSlice({
  name: "expenseReview",
  initialState,
  reducers: {
    clearExpenseReviewError: (state) => {
      state.error = null;
    },
    clearCurrentExpenseReview: (state) => {
      state.currentExpenseReview = null;
    },
    setExpenseReviews: (state, action: PayloadAction<ExpenseReview[]>) => {
      state.expenseReviews = action.payload;
    },
    updateExpenseReviewInList: (state, action: PayloadAction<ExpenseReview>) => {
      const index = state.expenseReviews.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.expenseReviews[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch expense reviews ---------- */
      .addCase(fetchExpenseReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseReviews = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchExpenseReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch single expense review ---------- */
      .addCase(fetchExpenseReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpenseReview = action.payload.item;
      })
      .addCase(fetchExpenseReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Create expense review ---------- */
      .addCase(createExpenseReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpenseReview.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.expenseReviews = [
        //   action.payload.item,
        //   ...state.expenseReviews,
        // ];
        // state.currentExpenseReview = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createExpenseReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update expense review ---------- */
      .addCase(updateExpenseReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpenseReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenseReviews.findIndex(
          (c) => c.id === action.payload.item.id
        );
        if (index !== -1) {
          state.expenseReviews[index] = action.payload.item;
        }
        if (state.currentExpenseReview?.id === action.payload.item.id) {
          state.currentExpenseReview = action.payload.item;
        }
      })
      .addCase(updateExpenseReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Delete expense review ---------- */
      .addCase(deleteExpenseReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpenseReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseReviews = state.expenseReviews.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentExpenseReview?.id === action.payload) {
          state.currentExpenseReview = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteExpenseReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Change expense review status ---------- */
      .addCase(changeExpenseReviewStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeExpenseReviewStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenseReviews.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.expenseReviews[index] = action.payload;
        }
        if (state.currentExpenseReview?.id === action.payload.id) {
          state.currentExpenseReview = action.payload;
        }
      })
      .addCase(changeExpenseReviewStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearExpenseReviewError,
  clearCurrentExpenseReview,
  setExpenseReviews,
  updateExpenseReviewInList,
} = expenseReviewSlice.actions;

export default expenseReviewSlice.reducer;