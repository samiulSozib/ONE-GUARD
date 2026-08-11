// store/slices/client-contract-service-component.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { clientContractServiceComponentService } from "@/service/client-contract-service-component.service";
import {
  ClientContractServiceComponent,
  ClientContractServiceComponentParams,
  ClientContractServiceComponentState,
  CreateClientContractServiceComponentDto,
  UpdateClientContractServiceComponentDto,
} from "@/app/types/client-contract-service-component";

/* ------------------ Initial State ------------------ */

const initialState: ClientContractServiceComponentState = {
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

// Fetch all client contract service components
export const fetchClientContractServiceComponents = createAsyncThunk(
  "clientContractServiceComponent/fetchAll",
  async (params: ClientContractServiceComponentParams = {}, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceComponentService.getClientContractServiceComponents(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contract service components";
      return rejectWithValue(message);
    }
  }
);

// Fetch single client contract service component
export const fetchClientContractServiceComponent = createAsyncThunk(
  "clientContractServiceComponent/fetchOne",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceComponentService.getClientContractServiceComponent(id);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contract service component";
      return rejectWithValue(message);
    }
  }
);

// Create client contract service component
export const createClientContractServiceComponent = createAsyncThunk(
  "clientContractServiceComponent/create",
  async (data: CreateClientContractServiceComponentDto, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceComponentService.createClientContractServiceComponent(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create client contract service component";
      return rejectWithValue(message);
    }
  }
);

// Update client contract service component
export const updateClientContractServiceComponent = createAsyncThunk(
  "clientContractServiceComponent/update",
  async (
    { id, data }: { id: number; data: UpdateClientContractServiceComponentDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await clientContractServiceComponentService.updateClientContractServiceComponent(id, data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update client contract service component";
      return rejectWithValue(message);
    }
  }
);

// Toggle client contract service component status
export const toggleClientContractServiceComponentStatus = createAsyncThunk(
  "clientContractServiceComponent/toggleStatus",
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await clientContractServiceComponentService.toggleStatus(id, isActive);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle client contract service component status";
      return rejectWithValue(message);
    }
  }
);

// Delete client contract service component
export const deleteClientContractServiceComponent = createAsyncThunk(
  "clientContractServiceComponent/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await clientContractServiceComponentService.deleteClientContractServiceComponent(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete client contract service component";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const clientContractServiceComponentSlice = createSlice({
  name: "clientContractServiceComponent",
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
    updateItemInList: (state, action: PayloadAction<ClientContractServiceComponent>) => {
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
      .addCase(fetchClientContractServiceComponents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientContractServiceComponents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchClientContractServiceComponents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single
      .addCase(fetchClientContractServiceComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientContractServiceComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.item;
      })
      .addCase(fetchClientContractServiceComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createClientContractServiceComponent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createClientContractServiceComponent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = [action.payload.item, ...state.items];
        state.currentItem = action.payload.item;
        state.pagination.total += 1;
        state.successMessage = action.payload.message || "Client contract service component created successfully";
      })
      .addCase(createClientContractServiceComponent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateClientContractServiceComponent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateClientContractServiceComponent.fulfilled, (state, action) => {
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
        state.successMessage = action.payload.message || "Client contract service component updated successfully";
      })
      .addCase(updateClientContractServiceComponent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleClientContractServiceComponentStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(toggleClientContractServiceComponentStatus.fulfilled, (state, action) => {
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
      .addCase(toggleClientContractServiceComponentStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteClientContractServiceComponent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteClientContractServiceComponent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.successMessage = "Client contract service component deleted successfully";
      })
      .addCase(deleteClientContractServiceComponent.rejected, (state, action) => {
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
} = clientContractServiceComponentSlice.actions;

export default clientContractServiceComponentSlice.reducer;
