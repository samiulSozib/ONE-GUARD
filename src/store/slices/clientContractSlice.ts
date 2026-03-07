import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  ClientContract,
  ClientContractParams,
  ClientContractState,
  CreateClientContractDto
} from "@/app/types/clientContract";
import { clientContractService } from "@/service/clientContract.service";

const initialState: ClientContractState = {
  contracts: [],
  currentContract: null,
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

export const fetchContracts = createAsyncThunk(
  "clientContract/fetchContracts",
  async (params: ClientContractParams = {}, { rejectWithValue }) => {
    try {
      return await clientContractService.getContracts(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contracts";
      return rejectWithValue(message);
    }
  }
);

export const fetchContract = createAsyncThunk(
  "clientContract/fetchContract",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.getContract(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client contract";
      return rejectWithValue(message);
    }
  }
);

export const createContract = createAsyncThunk(
  "clientContract/createContract",
  async (
    data: CreateClientContractDto | FormData,
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.createContract(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create client contract";
      return rejectWithValue(message);
    }
  }
);

export const updateContract = createAsyncThunk(
  "clientContract/updateContract",
  async (
    { id, data }: { id: number; data: CreateClientContractDto | FormData },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.updateContract(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update client contract";
      return rejectWithValue(message);
    }
  }
);

export const deleteContract = createAsyncThunk(
  "clientContract/deleteContract",
  async (id: number, { rejectWithValue }) => {
    try {
      await clientContractService.deleteContract(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete client contract";
      return rejectWithValue(message);
    }
  }
);

export const activateContract = createAsyncThunk(
  "clientContract/activateContract",
  async (id: number, { rejectWithValue }) => {
    try {
      return await clientContractService.activateContract(id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to activate client contract";
      return rejectWithValue(message);
    }
  }
);

export const suspendContract = createAsyncThunk(
  "clientContract/suspendContract",
  async (
    { id, data }: { id: number; data?: { reason?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.suspendContract(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to suspend client contract";
      return rejectWithValue(message);
    }
  }
);

export const terminateContract = createAsyncThunk(
  "clientContract/terminateContract",
  async (
    { id, data }: { id: number; data?: { reason?: string; effective_date?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.terminateContract(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to terminate client contract";
      return rejectWithValue(message);
    }
  }
);

export const renewContract = createAsyncThunk(
  "clientContract/renewContract",
  async (
    { id, data }: { id: number; data?: { end_date?: string; notes?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.renewContract(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to renew client contract";
      return rejectWithValue(message);
    }
  }
);

export const toggleContractStatus = createAsyncThunk(
  "clientContract/toggleStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      await clientContractService.toggleStatus(id, status);
      const updatedContract = await clientContractService.getContract(id);
      return updatedContract.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle client contract status";
      return rejectWithValue(message);
    }
  }
);

export const addContractSite = createAsyncThunk(
  "clientContract/addContractSite",
  async (
    { id, data }: { id: number; data: { site_id: number; guards_required?: number; site_specific_rate?: number; is_primary?: boolean } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.addContractSite(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add site to contract";
      return rejectWithValue(message);
    }
  }
);

export const removeContractSite = createAsyncThunk(
  "clientContract/removeContractSite",
  async (
    { contractId, siteId }: { contractId: number; siteId: number },
    { rejectWithValue }
  ) => {
    try {
      await clientContractService.removeContractSite(contractId, siteId);
      return { contractId, siteId };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove site from contract";
      return rejectWithValue(message);
    }
  }
);

export const updateContractSite = createAsyncThunk(
  "clientContract/updateContractSite",
  async (
    { contractId, siteId, data }: { contractId: number; siteId: number; data: { guards_required?: number; site_specific_rate?: number; is_primary?: boolean } },
    { rejectWithValue }
  ) => {
    try {
      return await clientContractService.updateContractSite(contractId, siteId, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update contract site";
      return rejectWithValue(message);
    }
  }
);

export const fetchContractStats = createAsyncThunk(
  "clientContract/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await clientContractService.getContractStats();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch contract statistics";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const clientContractSlice = createSlice({
  name: "clientContract",
  initialState,
  reducers: {
    clearContractError: (state) => {
      state.error = null;
    },
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
    setContracts: (state, action: PayloadAction<ClientContract[]>) => {
      state.contracts = action.payload;
    },
    updateContractInList: (state, action: PayloadAction<ClientContract>) => {
      const index = state.contracts.findIndex(
        (contract) => contract.id === action.payload.id
      );
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contracts
      .addCase(fetchContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single contract
      .addCase(fetchContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentContract = action.payload.item;
      })
      .addCase(fetchContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create contract
      .addCase(createContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = [action.payload.item, ...state.contracts];
        state.currentContract = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update contract
      .addCase(updateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete contract
      .addCase(deleteContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = state.contracts.filter(
          (contract) => contract.id !== action.payload
        );
        if (state.currentContract?.id === action.payload) {
          state.currentContract = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Activate contract
      .addCase(activateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(activateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
      })
      .addCase(activateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Suspend contract
      .addCase(suspendContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(suspendContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
      })
      .addCase(suspendContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Terminate contract
      .addCase(terminateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(terminateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
      })
      .addCase(terminateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Renew contract
      .addCase(renewContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(renewContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
      })
      .addCase(renewContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleContractStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleContractStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
        }
      })
      .addCase(toggleContractStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add contract site
      .addCase(addContractSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addContractSite.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
      })
      .addCase(addContractSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Remove contract site
      .addCase(removeContractSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeContractSite.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentContract?.id === action.payload.contractId) {
          state.currentContract = {
            ...state.currentContract,
            sites: state.currentContract.sites?.filter(
              (site) => site.id !== action.payload.siteId
            )
          };
        }
      })
      .addCase(removeContractSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update contract site
      .addCase(updateContractSite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContractSite.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentContract?.id === action.payload.item.id) {
          state.currentContract = action.payload.item;
        }
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.item.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload.item;
        }
      })
      .addCase(updateContractSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch contract stats
      .addCase(fetchContractStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContractStats.fulfilled, (state) => {
        state.isLoading = false;
        // Handle stats if needed - you might want to add a stats property to state
      })
      .addCase(fetchContractStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearContractError,
  clearCurrentContract,
  setContracts,
  updateContractInList,
} = clientContractSlice.actions;

export default clientContractSlice.reducer;