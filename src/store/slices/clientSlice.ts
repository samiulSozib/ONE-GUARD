import { Client, ClientParams, ClientState } from '@/app/types/client';
import { clientService } from '@/service/client.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: ClientState = {
  clients: [],
  currentClient: null,
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
export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (params: ClientParams = {}, { rejectWithValue }) => {
    try {
      const response = await clientService.getClients(params);
      return {
        items: response.items,
        pagination: response.data
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchClient = createAsyncThunk(
  'client/fetchClient',
  async ({ id, params }: { id: number; params?: { include?: string[] } }, { rejectWithValue }) => {
    try {
      const response = await clientService.getClient(id, params);
      return response.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createClient = createAsyncThunk(
  'client/createClient',
  async (data: FormData | Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>, { rejectWithValue }) => {
    try {
      const response = await clientService.createClient(data);
      return response.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async ({ id, data }: { id: number; data: FormData | Partial<Client> }, { rejectWithValue }) => {
    try {
      const response = await clientService.updateClient(id, data);
      return response.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'client/deleteClient',
  async (id: number, { rejectWithValue }) => {
    try {
      await clientService.deleteClient(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleClientStatus = createAsyncThunk(
  'client/toggleStatus',
  async ({ id, is_active }: { id: number; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await clientService.toggleStatus(id, is_active);
      return response.item;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle client status';
      return rejectWithValue(errorMessage);
    }
  }
);


// Slice
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearClientError: (state) => {
      state.error = null;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    clearClients: (state) => {
      state.clients = [];
      state.pagination = initialState.pagination;
    },
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    updateClientInList: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(client => client.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    updatePagination: (state, action: PayloadAction<Partial<ClientState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Single Client
      .addCase(fetchClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients.unshift(action.payload);
        state.currentClient = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Client
      .addCase(updateClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedClient = action.payload;
        const index = state.clients.findIndex(client => client.id === updatedClient.id);
        if (index !== -1) {
          state.clients[index] = updatedClient;
        }
        if (state.currentClient?.id === updatedClient.id) {
          state.currentClient = updatedClient;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Client
      .addCase(deleteClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
        if (state.currentClient?.id === action.payload) {
          state.currentClient = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleClientStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleClientStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedClient = action.payload;
        const index = state.clients.findIndex(client => client.id === updatedClient.id);
        if (index !== -1) {
          state.clients[index] = updatedClient;
        }
        if (state.currentClient?.id === updatedClient.id) {
          state.currentClient = updatedClient;
        }
      })
      .addCase(toggleClientStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
  },
});

export const { 
  clearClientError, 
  clearCurrentClient,
  clearClients,
  setClients,
  updateClientInList,
  updatePagination,
  setLoading
} = clientSlice.actions;

export default clientSlice.reducer;