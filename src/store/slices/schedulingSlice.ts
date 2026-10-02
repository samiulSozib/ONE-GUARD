import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";

import {
  SchedulingSettings,
  SchedulingSettingsState,
  UpdateSchedulingSettingsDto,
  GuardAssignmentPlan,
  AssignmentPlanParams,
  AssignmentPlanState,
  CreateAssignmentPlanDto,
  UpdateAssignmentPlanDto,
  ToggleAssignmentPlanStatusDto,
} from "@/app/types/scheduling";

import {
  schedulingSettingsService,
  assignmentPlanService,
} from "@/service/scheduling.service";

// ============================================
// INITIAL STATES
// ============================================

const initialSettingsState: SchedulingSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

const initialAssignmentPlanState: AssignmentPlanState = {
  plans: [],
  currentPlan: null,

  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },

  isLoading: false,
  error: null,

  generationInfo: null,
};

// ============================================
// SCHEDULING SETTINGS THUNKS
// ============================================

export const fetchSchedulingSettings = createAsyncThunk(
  "scheduling/fetchSettings",

  async (_, { rejectWithValue }) => {
    try {
      const response =
        await schedulingSettingsService.getSettings();

      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch scheduling settings";

      return rejectWithValue(message);
    }
  }
);

export const updateSchedulingSettings = createAsyncThunk(
  "scheduling/updateSettings",

  async (
    data: UpdateSchedulingSettingsDto,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await schedulingSettingsService.updateSettings(
          data
        );

      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update scheduling settings";

      return rejectWithValue(message);
    }
  }
);

// ============================================
// ASSIGNMENT PLAN THUNKS
// ============================================

/**
 * Get assignment plans.
 */
export const fetchAssignmentPlans = createAsyncThunk(
  "scheduling/fetchPlans",

  async (
    params: AssignmentPlanParams = {},
    { rejectWithValue }
  ) => {
    try {
      const response =
        await assignmentPlanService.getPlans(
          params
        );

      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch assignment plans";

      return rejectWithValue(message);
    }
  }
);

/**
 * Get one assignment plan.
 *
 * The returned plan can contain:
 *
 * guards: [
 *   {
 *     guard_id: 41,
 *     weekdays: [1, 3, 5],
 *     guard: {...}
 *   }
 * ]
 */
export const fetchAssignmentPlan = createAsyncThunk(
  "scheduling/fetchPlan",

  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await assignmentPlanService.getPlan(
          id
        );

      return response.item;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch assignment plan";

      return rejectWithValue(message);
    }
  }
);

/**
 * Create assignment plan.
 *
 * New DTO:
 *
 * {
 *   duty_schedule_id: 1,
 *   start_date: "2026-10-02",
 *   end_date: "2026-10-31",
 *   guards: [
 *     {
 *       guard_id: 41,
 *       weekdays: [1, 3, 5]
 *     },
 *     {
 *       guard_id: 40,
 *       weekdays: [2, 4]
 *     }
 *   ]
 * }
 */
export const createAssignmentPlan = createAsyncThunk(
  "scheduling/createPlan",

  async (
    data: CreateAssignmentPlanDto,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await assignmentPlanService.createPlan(
          data
        );

      return {
        item: response.item,

        generation:
          response.generation,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create assignment plan";

      return rejectWithValue(message);
    }
  }
);

/**
 * Update assignment plan.
 *
 * guards[] can also be supplied here.
 */
export const updateAssignmentPlan = createAsyncThunk(
  "scheduling/updatePlan",

  async (
    {
      id,
      data,
    }: {
      id: number;

      data: UpdateAssignmentPlanDto;
    },

    { rejectWithValue }
  ) => {
    try {
      const response =
        await assignmentPlanService.updatePlan(
          id,
          data
        );

      return {
        item: response.item,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update assignment plan";

      return rejectWithValue(message);
    }
  }
);

/**
 * Enable / disable assignment plan.
 */
export const toggleAssignmentPlanStatus =
  createAsyncThunk(
    "scheduling/togglePlanStatus",

    async (
      {
        id,
        data,
      }: {
        id: number;

        data: ToggleAssignmentPlanStatusDto;
      },

      { rejectWithValue }
    ) => {
      try {
        const response =
          await assignmentPlanService.togglePlanStatus(
            id,
            data
          );

        return response.item;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to toggle assignment plan status";

        return rejectWithValue(
          message
        );
      }
    }
  );

/**
 * Delete assignment plan.
 */
export const deleteAssignmentPlan = createAsyncThunk(
  "scheduling/deletePlan",

  async (
    id: number,
    { rejectWithValue }
  ) => {
    try {
      await assignmentPlanService.deletePlan(
        id
      );

      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete assignment plan";

      return rejectWithValue(message);
    }
  }
);

// ============================================
// SLICE STATE
// ============================================

interface SchedulingSliceState {
  settings: SchedulingSettingsState;

  plans: AssignmentPlanState;
}

const initialState: SchedulingSliceState = {
  settings: initialSettingsState,

  plans: initialAssignmentPlanState,
};

// ============================================
// SLICE
// ============================================

const schedulingSlice = createSlice({
  name: "scheduling",

  initialState,

  reducers: {
    // ==========================================
    // CLEAR ERRORS
    // ==========================================

    clearSchedulingError: (state) => {
      state.settings.error = null;

      state.plans.error = null;
    },

    // ==========================================
    // CLEAR CURRENT PLAN
    // ==========================================

    clearCurrentPlan: (state) => {
      state.plans.currentPlan = null;
    },

    // ==========================================
    // CLEAR GENERATION INFO
    // ==========================================

    clearGenerationInfo: (state) => {
      state.plans.generationInfo = null;
    },

    // ==========================================
    // MANUALLY SET PLAN LIST
    // ==========================================

    setPlans: (
      state,
      action: PayloadAction<
        GuardAssignmentPlan[]
      >
    ) => {
      state.plans.plans =
        action.payload;
    },

    // ==========================================
    // MANUALLY UPDATE ONE PLAN IN LIST
    // ==========================================

    updatePlanInList: (
      state,
      action: PayloadAction<
        GuardAssignmentPlan
      >
    ) => {
      const index =
        state.plans.plans.findIndex(
          (plan) =>
            plan.id ===
            action.payload.id
        );

      if (index !== -1) {
        state.plans.plans[index] =
          action.payload;
      }
    },
  },

  // ============================================
  // EXTRA REDUCERS
  // ============================================

  extraReducers: (builder) => {
    // ==========================================
    // FETCH SETTINGS
    // ==========================================

    builder
      .addCase(
        fetchSchedulingSettings.pending,
        (state) => {
          state.settings.isLoading =
            true;

          state.settings.error =
            null;
        }
      )

      .addCase(
        fetchSchedulingSettings.fulfilled,
        (state, action) => {
          state.settings.isLoading =
            false;

          state.settings.settings =
            action.payload;
        }
      )

      .addCase(
        fetchSchedulingSettings.rejected,
        (state, action) => {
          state.settings.isLoading =
            false;

          state.settings.error =
            action.payload as string;
        }
      );

    // ==========================================
    // UPDATE SETTINGS
    // ==========================================

    builder
      .addCase(
        updateSchedulingSettings.pending,
        (state) => {
          state.settings.isLoading =
            true;

          state.settings.error =
            null;
        }
      )

      .addCase(
        updateSchedulingSettings.fulfilled,
        (state, action) => {
          state.settings.isLoading =
            false;

          state.settings.settings =
            action.payload;
        }
      )

      .addCase(
        updateSchedulingSettings.rejected,
        (state, action) => {
          state.settings.isLoading =
            false;

          state.settings.error =
            action.payload as string;
        }
      );

    // ==========================================
    // FETCH ASSIGNMENT PLANS
    // ==========================================

    builder
      .addCase(
        fetchAssignmentPlans.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;
        }
      )

      .addCase(
        fetchAssignmentPlans.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.plans =
            action.payload.items;

          state.plans.pagination = {
            current_page:
              action.payload.data
                .current_page,

            last_page:
              action.payload.data
                .last_page,

            total:
              action.payload.data
                .total,

            per_page:
              action.payload.data
                .per_page,
          };
        }
      )

      .addCase(
        fetchAssignmentPlans.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );

    // ==========================================
    // FETCH SINGLE ASSIGNMENT PLAN
    // ==========================================

    builder
      .addCase(
        fetchAssignmentPlan.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;
        }
      )

      .addCase(
        fetchAssignmentPlan.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.currentPlan =
            action.payload;
        }
      )

      .addCase(
        fetchAssignmentPlan.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );

    // ==========================================
    // CREATE ASSIGNMENT PLAN
    // ==========================================

    builder
      .addCase(
        createAssignmentPlan.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;

          state.plans.generationInfo =
            null;
        }
      )

      .addCase(
        createAssignmentPlan.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          const newPlan =
            action.payload.item;

          /*
           * The returned plan already contains the
           * backend's guards[] relationship.
           *
           * Put it directly at the top of the list.
           */
          state.plans.plans = [
            newPlan,

            ...state.plans.plans,
          ];

          state.plans.currentPlan =
            newPlan;

          state.plans.pagination.total +=
            1;

          /*
           * Automatic assignment generation information.
           */
          state.plans.generationInfo =
            action.payload
              .generation || null;
        }
      )

      .addCase(
        createAssignmentPlan.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );

    // ==========================================
    // UPDATE ASSIGNMENT PLAN
    // ==========================================

    builder
      .addCase(
        updateAssignmentPlan.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;
        }
      )

      .addCase(
        updateAssignmentPlan.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          const updatedPlan =
            action.payload.item;

          const index =
            state.plans.plans.findIndex(
              (plan) =>
                plan.id ===
                updatedPlan.id
            );

          /*
           * Replace the complete plan.
           *
           * This is important because guards[] may have
           * changed completely.
           */
          if (index !== -1) {
            state.plans.plans[index] =
              updatedPlan;
          }

          if (
            state.plans.currentPlan
              ?.id ===
            updatedPlan.id
          ) {
            state.plans.currentPlan =
              updatedPlan;
          }
        }
      )

      .addCase(
        updateAssignmentPlan.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );

    // ==========================================
    // TOGGLE ASSIGNMENT PLAN STATUS
    // ==========================================

    builder
      .addCase(
        toggleAssignmentPlanStatus.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;
        }
      )

      .addCase(
        toggleAssignmentPlanStatus.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          const updatedPlan =
            action.payload;

          const index =
            state.plans.plans.findIndex(
              (plan) =>
                plan.id ===
                updatedPlan.id
            );

          if (index !== -1) {
            state.plans.plans[index] =
              updatedPlan;
          }

          if (
            state.plans.currentPlan
              ?.id ===
            updatedPlan.id
          ) {
            state.plans.currentPlan =
              updatedPlan;
          }
        }
      )

      .addCase(
        toggleAssignmentPlanStatus.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );

    // ==========================================
    // DELETE ASSIGNMENT PLAN
    // ==========================================

    builder
      .addCase(
        deleteAssignmentPlan.pending,
        (state) => {
          state.plans.isLoading =
            true;

          state.plans.error =
            null;
        }
      )

      .addCase(
        deleteAssignmentPlan.fulfilled,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.plans =
            state.plans.plans.filter(
              (plan) =>
                plan.id !==
                action.payload
            );

          if (
            state.plans.currentPlan
              ?.id ===
            action.payload
          ) {
            state.plans.currentPlan =
              null;
          }

          state.plans.pagination.total =
            Math.max(
              0,

              state.plans.pagination
                .total - 1
            );
        }
      )

      .addCase(
        deleteAssignmentPlan.rejected,
        (state, action) => {
          state.plans.isLoading =
            false;

          state.plans.error =
            action.payload as string;
        }
      );
  },
});

// ============================================
// ACTIONS
// ============================================

export const {
  clearSchedulingError,

  clearCurrentPlan,

  clearGenerationInfo,

  setPlans,

  updatePlanInList,
} = schedulingSlice.actions;

// ============================================
// REDUCER
// ============================================

export default schedulingSlice.reducer;