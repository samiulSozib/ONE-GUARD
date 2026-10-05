import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import {
  PatrolAssignmentDetailsResponse,
  PatrolAssignmentListResponse,
  PatrolAssignmentSummary,
  PatrolVisit,
  PatrolVisitOverview,
  PatrolVisitParams,
  PatrolVisitState,
} from "@/app/types/patrolVisit";

import patrolVisitService from "@/service/patrolVisit.service";

/* =========================================================
   Helpers
   ========================================================= */

const getErrorMessage = (
  error: unknown
): string => {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const maybeAxiosError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

    return (
      maybeAxiosError.response?.data
        ?.message ||
      maybeAxiosError.message ||
      "Something went wrong."
    );
  }

  return "Something went wrong.";
};

/* =========================================================
   Initial State
   ========================================================= */

const initialState: PatrolVisitState = {
  overview: null,

  assignments: [],

  currentAssignment: null,

  currentVisit: null,

  visits: [],

  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },

  isLoading: false,
  isOverviewLoading: false,
  isDetailsLoading: false,

  error: null,
};

/* =========================================================
   Fetch Patrol Overview
   ========================================================= */

export const fetchPatrolVisitOverview =
  createAsyncThunk<
    PatrolVisitOverview,
    void,
    {
      rejectValue: string;
    }
  >(
    "patrolVisits/fetchOverview",

    async (_, { rejectWithValue }) => {
      try {
        return await patrolVisitService.getOverview();
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* =========================================================
   Fetch Patrol Assignment List
   ========================================================= */

export const fetchPatrolAssignments =
  createAsyncThunk<
    PatrolAssignmentListResponse,
    PatrolVisitParams | undefined,
    {
      rejectValue: string;
    }
  >(
    "patrolVisits/fetchAssignments",

    async (
      params,
      { rejectWithValue }
    ) => {
      try {
        return await patrolVisitService.getAll(
          params
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* =========================================================
   Fetch Visits For Assignment
   ========================================================= */

export const fetchPatrolVisitsByAssignment =
  createAsyncThunk<
    PatrolAssignmentDetailsResponse,
    {
      assignmentId: number;
      params?: PatrolVisitParams;
    },
    {
      rejectValue: string;
    }
  >(
    "patrolVisits/fetchByAssignment",

    async (
      {
        assignmentId,
        params,
      },
      { rejectWithValue }
    ) => {
      try {
        return await patrolVisitService.getByAssignment(
          assignmentId,
          params
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* =========================================================
   Fetch Individual Patrol Visit
   ========================================================= */

export const fetchPatrolVisit =
  createAsyncThunk<
    PatrolVisit,
    number,
    {
      rejectValue: string;
    }
  >(
    "patrolVisits/fetchVisit",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        return await patrolVisitService.getById(
          id
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* =========================================================
   Slice
   ========================================================= */

const patrolVisitSlice =
  createSlice({
    name: "patrolVisits",

    initialState,

    reducers: {
      clearPatrolVisitError(
        state
      ) {
        state.error = null;
      },

      clearCurrentPatrolAssignment(
        state
      ) {
        state.currentAssignment =
          null;

        state.visits = [];

        state.currentVisit = null;
      },

      clearCurrentPatrolVisit(
        state
      ) {
        state.currentVisit = null;
      },

      setCurrentPatrolAssignment(
        state,
        action: PayloadAction<
          PatrolAssignmentSummary | null
        >
      ) {
        state.currentAssignment =
          action.payload;

        state.visits =
          action.payload?.visits ?? [];
      },

      setCurrentPatrolVisit(
        state,
        action: PayloadAction<
          PatrolVisit | null
        >
      ) {
        state.currentVisit =
          action.payload;
      },
    },

    extraReducers: (builder) => {
      builder

        /* =================================================
           Overview
           ================================================= */

        .addCase(
          fetchPatrolVisitOverview.pending,
          (state) => {
            state.isOverviewLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          fetchPatrolVisitOverview.fulfilled,
          (state, action) => {
            state.isOverviewLoading =
              false;

            state.overview =
              action.payload;
          }
        )

        .addCase(
          fetchPatrolVisitOverview.rejected,
          (state, action) => {
            state.isOverviewLoading =
              false;

            state.error =
              typeof action.payload ===
                "string"
                ? action.payload
                : "Unable to load patrol overview.";
          }
        )

        /* =================================================
           Assignment List
           ================================================= */

        .addCase(
          fetchPatrolAssignments.pending,
          (state) => {
            state.isLoading = true;

            state.error = null;
          }
        )

        .addCase(
          fetchPatrolAssignments.fulfilled,
          (state, action) => {
            state.isLoading = false;

            state.assignments =
              action.payload.items ?? [];

            const pagination =
              action.payload.data;

            if (pagination) {
              state.pagination = {
                current_page:
                  pagination.current_page ??
                  1,

                last_page:
                  pagination.last_page ??
                  1,

                total:
                  pagination.total ??
                  state.assignments.length,

                per_page:
                  pagination.per_page ??
                  10,
              };
            } else {
              state.pagination = {
                current_page: 1,
                last_page: 1,

                total:
                  state.assignments.length,

                per_page:
                  state.assignments.length ||
                  10,
              };
            }
          }
        )

        .addCase(
          fetchPatrolAssignments.rejected,
          (state, action) => {
            state.isLoading = false;

            state.error =
              typeof action.payload ===
                "string"
                ? action.payload
                : "Unable to load patrol visits.";
          }
        )

        /* =================================================
           Assignment Details
           ================================================= */

        .addCase(
          fetchPatrolVisitsByAssignment.pending,
          (state) => {
            state.isDetailsLoading =
              true;

            state.error = null;

            state.currentVisit = null;
          }
        )

        .addCase(
          fetchPatrolVisitsByAssignment.fulfilled,
          (state, action) => {
            state.isDetailsLoading =
              false;

            state.currentAssignment =
              action.payload.assignment;

            state.visits =
              action.payload.visits ??
              [];

            const assignmentId =
              action.payload.assignment
                .assignment_id;

            const index =
              state.assignments.findIndex(
                (assignment) =>
                  assignment.assignment_id ===
                  assignmentId
              );

            if (index !== -1) {
              state.assignments[index] = {
                ...state.assignments[index],
                ...action.payload.assignment,
              };
            }
          }
        )

        .addCase(
          fetchPatrolVisitsByAssignment.rejected,
          (state, action) => {
            state.isDetailsLoading =
              false;

            state.error =
              typeof action.payload ===
                "string"
                ? action.payload
                : "Unable to load patrol visit details.";
          }
        )

        /* =================================================
           Individual Visit
           ================================================= */

        .addCase(
          fetchPatrolVisit.pending,
          (state) => {
            state.isDetailsLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          fetchPatrolVisit.fulfilled,
          (state, action) => {
            state.isDetailsLoading =
              false;

            state.currentVisit =
              action.payload;

            const index =
              state.visits.findIndex(
                (visit) =>
                  visit.id ===
                  action.payload.id
              );

            if (index !== -1) {
              state.visits[index] =
                action.payload;
            }
          }
        )

        .addCase(
          fetchPatrolVisit.rejected,
          (state, action) => {
            state.isDetailsLoading =
              false;

            state.error =
              typeof action.payload ===
                "string"
                ? action.payload
                : "Unable to load patrol visit.";
          }
        );
    },
  });

/* =========================================================
   Actions
   ========================================================= */

export const {
  clearPatrolVisitError,
  clearCurrentPatrolAssignment,
  clearCurrentPatrolVisit,
  setCurrentPatrolAssignment,
  setCurrentPatrolVisit,
} = patrolVisitSlice.actions;

/* =========================================================
   Reducer
   ========================================================= */

export default patrolVisitSlice.reducer;