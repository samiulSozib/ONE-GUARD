// store/slices/dutyInstruction.slice.ts

import { 
  DutyInstruction, 
  DutyInstructionParams, 
  DutyInstructionState,
  CreateDutyInstructionData,
  UpdateDutyInstructionData
} from "@/app/types/shiftInstruction";
import { dutyInstructionService } from "@/service/shiftInstruction";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const initialState: DutyInstructionState = {
  instructions: [],
  currentInstruction: null,
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

export const fetchInstructions = createAsyncThunk(
  "dutyInstruction/fetchInstructions",
  async (params: DutyInstructionParams = {}, { rejectWithValue }) => {
    try {
      return await dutyInstructionService.getInstructions(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty instructions";
      return rejectWithValue(message);
    }
  }
);

export const fetchInstruction = createAsyncThunk(
  "dutyInstruction/fetchInstruction",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await dutyInstructionService.getInstruction(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty instruction";
      return rejectWithValue(message);
    }
  }
);

export const createInstruction = createAsyncThunk(
  "dutyInstruction/createInstruction",
  async (
    data: CreateDutyInstructionData,
    { rejectWithValue }
  ) => {
    try {
      return await dutyInstructionService.createInstruction(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create duty instruction";
      return rejectWithValue(message);
    }
  }
);

export const updateInstruction = createAsyncThunk(
  "dutyInstruction/updateInstruction",
  async (
    { id, data }: { id: number; data: UpdateDutyInstructionData },
    { rejectWithValue }
  ) => {
    try {
      return await dutyInstructionService.updateInstruction(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty instruction";
      return rejectWithValue(message);
    }
  }
);

export const deleteInstruction = createAsyncThunk(
  "dutyInstruction/deleteInstruction",
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyInstructionService.deleteInstruction(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete duty instruction";
      return rejectWithValue(message);
    }
  }
);

export const toggleInstructionStatus = createAsyncThunk(
  "dutyInstruction/toggleStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      await dutyInstructionService.toggleInstructionStatus(id, status);
      const updatedInstruction = await dutyInstructionService.getInstruction(id);
      return updatedInstruction.item;
    } catch (error: unknown) {
      console.log(error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle instruction status";
      return rejectWithValue(message);
    }
  }
);

export const bulkUpdateInstructionOrder = createAsyncThunk(
  "dutyInstruction/bulkUpdateOrder",
  async (
    items: { id: number; order: number }[],
    { rejectWithValue, dispatch }
  ) => {
    try {
      await dutyInstructionService.bulkUpdateOrder(items);
      // Refetch instructions to get updated order
      await dispatch(fetchInstructions({}));
      return items;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update instruction order";
      return rejectWithValue(message);
    }
  }
);

export const fetchInstructionsByInstructionable = createAsyncThunk(
  "dutyInstruction/fetchInstructionsByInstructionable",
  async (
    { instructionableType, instructionableId }: { instructionableType: string; instructionableId: number },
    { rejectWithValue }
  ) => {
    try {
      return await dutyInstructionService.getInstructionsByInstructionable(instructionableType, instructionableId);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch instructions by instructionable";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const dutyInstructionSlice = createSlice({
  name: "dutyInstruction",
  initialState,
  reducers: {
    clearInstructionError: (state) => {
      state.error = null;
    },
    clearCurrentInstruction: (state) => {
      state.currentInstruction = null;
    },
    setInstructions: (state, action: PayloadAction<DutyInstruction[]>) => {
      state.instructions = action.payload;
    },
    updateInstructionInList: (state, action: PayloadAction<DutyInstruction>) => {
      const index = state.instructions.findIndex(
        (instruction) => instruction.id === action.payload.id
      );
      if (index !== -1) {
        state.instructions[index] = action.payload;
      }
    },
    updateInstructionOrder: (state, action: PayloadAction<{ id: number; order: number }[]>) => {
      action.payload.forEach(({ id, order }) => {
        const instruction = state.instructions.find(i => i.id === id);
        if (instruction) {
          instruction.order = order;
        }
      });
      // Re-sort instructions by order
      state.instructions.sort((a, b) => a.order - b.order);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch instructions
      .addCase(fetchInstructions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructions = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchInstructions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch instructions by instructionable
      .addCase(fetchInstructionsByInstructionable.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructionsByInstructionable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructions = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchInstructionsByInstructionable.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single instruction
      .addCase(fetchInstruction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstruction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInstruction = action.payload.item;
      })
      .addCase(fetchInstruction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create instruction
      .addCase(createInstruction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInstruction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructions = [action.payload.item, ...state.instructions];
        state.currentInstruction = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createInstruction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update instruction
      .addCase(updateInstruction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInstruction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.instructions.findIndex(
          (instruction) => instruction.id === action.payload.item.id
        );
        if (index !== -1) {
          state.instructions[index] = action.payload.item;
        }
        if (state.currentInstruction?.id === action.payload.item.id) {
          state.currentInstruction = action.payload.item;
        }
      })
      .addCase(updateInstruction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete instruction
      .addCase(deleteInstruction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInstruction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructions = state.instructions.filter(
          (instruction) => instruction.id !== action.payload
        );
        if (state.currentInstruction?.id === action.payload) {
          state.currentInstruction = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteInstruction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle status
      .addCase(toggleInstructionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleInstructionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.instructions.findIndex(
          (instruction) => instruction.id === action.payload.id
        );
        if (index !== -1) {
          state.instructions[index] = action.payload;
        }
        if (state.currentInstruction?.id === action.payload.id) {
          state.currentInstruction = action.payload;
        }
      })
      .addCase(toggleInstructionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearInstructionError,
  clearCurrentInstruction,
  setInstructions,
  updateInstructionInList,
  updateInstructionOrder,
} = dutyInstructionSlice.actions;

export default dutyInstructionSlice.reducer;