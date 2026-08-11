// store/slices/client-contract-service.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { clientContractServiceService } from "@/service/client-contract-service.service";
import {
  ClientContractService,
  ClientContractServiceParams,
  ClientContractServiceState,
  CreateClientContractServiceDto,
  UpdateClientContractServiceDto,
} from "@/app/types/client-contract-service";

/* ------------------ Initial State ------------------ */

const initialState: ClientContractServiceState = {
  items: [],
  currentItem: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
};

/* ------------------ Thunks ------------------ */

// Fetch all client contract services
export const fetchClientContractServices = createAsyncThunk(
  "clientContractService/fetchAll",
  async (params: ClientContractServiceParams = {}, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceService.getClientContractServices(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contract services";
      return rejectWithValue(message);
    }
  }
);

// Fetch single client contract service
export const fetchClientContractService = createAsyncThunk(
  "clientContractService/fetchOne",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceService.getClientContractService(id);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contract service";
      return rejectWithValue(message);
    }
  }
);

// Create client contract service
export const createClientContractService = createAsyncThunk(
  "clientContractService/create",
  async (data: CreateClientContractServiceDto, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceService.createClientContractService(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create client contract service";
      return rejectWithValue(message);
    }
  }
);

// Update client contract service
export const updateClientContractService = createAsyncThunk(
  "clientContractService/update",
  async (
    { id, data }: { id: number; data: UpdateClientContractServiceDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await clientContractServiceService.updateClientContractService(id, data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update client contract service";
      return rejectWithValue(message);
    }
  }
);

// Toggle client contract service status
export const toggleClientContractServiceStatus = createAsyncThunk(
  "clientContractService/toggleStatus",
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceService.toggleStatus(id, isActive);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle client contract service status";
      return rejectWithValue(message);
    }
  }
);

// Delete client contract service
export const deleteClientContractService = createAsyncThunk(
  "clientContractService/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await clientContractServiceService.deleteClientContractService(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete client contract service";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const clientContractServiceSlice = createSlice({
  name: "clientContractService",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearItems: (state) => {
      state.items = [];
      state.pagination = initialState.pagination;
    },
    updateItemInList: (state, action: PayloadAction<ClientContractService>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentItem?.id === action.payload.id) {
        state.currentItem = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchClientContractServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientContractServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchClientContractServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single
      .addCase(fetchClientContractService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientContractService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.item;
      })
      .addCase(fetchClientContractService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createClientContractService.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createClientContractService.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = [action.payload.item, ...state.items];
        state.currentItem = action.payload.item;
        state.pagination.total += 1;
        state.successMessage = action.payload.message || "Client contract service created successfully";
      })
      .addCase(createClientContractService.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateClientContractService.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateClientContractService.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.item.id
        );
        if (index !== -1) {
          state.items[index] = action.payload.item;
        }
        if (state.currentItem?.id === action.payload.item.id) {
          state.currentItem = action.payload.item;
        }
        state.successMessage = action.payload.message || "Client contract service updated successfully";
      })
      .addCase(updateClientContractService.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleClientContractServiceStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(toggleClientContractServiceStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.item.id
        );
        if (index !== -1) {
          state.items[index] = action.payload.item;
        }
        if (state.currentItem?.id === action.payload.item.id) {
          state.currentItem = action.payload.item;
        }
        state.successMessage = action.payload.message || "Status updated successfully";
      })
      .addCase(toggleClientContractServiceStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteClientContractService.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteClientContractService.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.successMessage = "Client contract service deleted successfully";
      })
      .addCase(deleteClientContractService.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearError,
  clearSuccess,
  clearCurrentItem,
  clearItems,
  updateItemInList,
} = clientContractServiceSlice.actions;

export default clientContractServiceSlice.reducer;
