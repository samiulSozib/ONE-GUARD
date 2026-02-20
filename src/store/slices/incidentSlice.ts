import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { incidentService } from "@/service/incident.service";
import {
  Incident,
  IncidentParams,
  IncidentState,
  CreateIncidentDto,
} from "@/app/types/incident";

/* ------------------ Initial State ------------------ */

const initialState: IncidentState = {
  incidents: [],
  currentIncident: null,
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

// Fetch all incidents
export const fetchIncidents = createAsyncThunk(
  "incident/fetchIncidents",
  async (params: IncidentParams = {}, { rejectWithValue }) => {
    try {
      const response = await incidentService.getIncidents(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch incidents";
      return rejectWithValue(message);
    }
  }
);

// Fetch single incident
export const fetchIncident = createAsyncThunk(
  "incident/fetchIncident",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await incidentService.getIncident(id);
      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch incident";
      return rejectWithValue(message);
    }
  }
);

// Create incident
export const createIncident = createAsyncThunk(
  "incident/createIncident",
  async (
    data: FormData | CreateIncidentDto,
    { rejectWithValue }
  ) => {
    try {
      const response = await incidentService.createIncident(data);
      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create incident";
      return rejectWithValue(message);
    }
  }
);

// Update incident
export const updateIncident = createAsyncThunk(
  "incident/updateIncident",
  async (
    { id, data }: { id: number; data: FormData | CreateIncidentDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await incidentService.updateIncident(id, data);
      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update incident";
      return rejectWithValue(message);
    }
  }
);

// Delete incident
export const deleteIncident = createAsyncThunk(
  "incident/deleteIncident",
  async (id: number, { rejectWithValue }) => {
    try {
      await incidentService.deleteIncident(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete incident";
      return rejectWithValue(message);
    }
  }
);

// Update incident status
export const updateIncidentStatus = createAsyncThunk(
  "incident/updateStatus",
  async (
    { id, status }: { id: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await incidentService.updateIncidentStatus(id, status);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update incident status";
      return rejectWithValue(message);
    }
  }
);

// Toggle incident client visibility
export const toggleClientVisibility = createAsyncThunk(
  "incident/toggleClientVisibility",
  async (
    { id, visible_to_client }: { id: number; visible_to_client: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await incidentService.toggleClientVisibility(id, visible_to_client);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle client visibility";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    clearIncidentError: (state) => {
      state.error = null;
    },
    clearCurrentIncident: (state) => {
      state.currentIncident = null;
    },
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
    },
    updateIncidentInList: (state, action: PayloadAction<Incident>) => {
      const index = state.incidents.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.incidents[index] = action.payload;
      }
    },
    removeIncidentFromList: (state, action: PayloadAction<number>) => {
      state.incidents = state.incidents.filter(
        (incident) => incident.id !== action.payload
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- Fetch incidents ---------- */
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = action.payload.items;
        state.pagination = {
          current_page: action.payload.data.current_page,
          last_page: action.payload.data.last_page,
          total: action.payload.data.total,
          per_page: action.payload.data.per_page,
        };
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Fetch single incident ---------- */
      .addCase(fetchIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentIncident = action.payload;
      })
      .addCase(fetchIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Create incident ---------- */
      .addCase(createIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = [action.payload, ...state.incidents];
        state.currentIncident = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update incident ---------- */
      .addCase(updateIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.incidents.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Delete incident ---------- */
      .addCase(deleteIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = state.incidents.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentIncident?.id === action.payload) {
          state.currentIncident = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Update incident status ---------- */
      .addCase(updateIncidentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.incidents.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.incidents[index] = {
            ...state.incidents[index],
            ...action.payload,
          };
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = {
            ...state.currentIncident,
            ...action.payload,
          };
        }
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- Toggle client visibility ---------- */
      .addCase(toggleClientVisibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleClientVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.incidents.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.incidents[index] = {
            ...state.incidents[index],
            ...action.payload,
          };
        }
        if (state.currentIncident?.id === action.payload.id) {
          state.currentIncident = {
            ...state.currentIncident,
            ...action.payload,
          };
        }
      })
      .addCase(toggleClientVisibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

/* ------------------ Exports ------------------ */

export const {
  clearIncidentError,
  clearCurrentIncident,
  setIncidents,
  updateIncidentInList,
  removeIncidentFromList,
} = incidentSlice.actions;

export default incidentSlice.reducer;