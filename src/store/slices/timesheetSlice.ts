import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  TimesheetFilters,
  TimesheetGuardReport,
  TimesheetGuardRow,
  TimesheetSummary,
  UpsertManualPayDto,
} from "@/app/types/timesheet";
import { timesheetService } from "@/service/timesheet.service";

interface TimesheetState {
  items: TimesheetGuardRow[];
  summary: TimesheetSummary | null;
  report: TimesheetGuardReport | null;
  filters: TimesheetFilters | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  } | null;
  isLoading: boolean;
  isReportLoading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  items: [],
  summary: null,
  report: null,
  filters: null,
  pagination: null,
  isLoading: false,
  isReportLoading: false,
  error: null,
};

export const fetchTimesheets = createAsyncThunk(
  "timesheet/fetchTimesheets",
  async (filters: TimesheetFilters, { rejectWithValue }) => {
    try {
      return await timesheetService.getTimesheets(filters);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to load timesheets");
    }
  }
);

export const fetchTimesheetGuardReport = createAsyncThunk(
  "timesheet/fetchGuardReport",
  async (
    { guardId, filters }: { guardId: number; filters: TimesheetFilters },
    { rejectWithValue }
  ) => {
    try {
      return await timesheetService.getGuardReport(guardId, filters);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to load guard timesheet");
    }
  }
);

export const saveTimesheetManualPay = createAsyncThunk(
  "timesheet/saveManualPay",
  async (
    { guardId, data }: { guardId: number; data: UpsertManualPayDto },
    { rejectWithValue }
  ) => {
    try {
      return await timesheetService.upsertManualPay(guardId, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to save manual pay");
    }
  }
);

export const clearTimesheetManualPay = createAsyncThunk(
  "timesheet/clearManualPay",
  async (
    {
      guardId,
      filters,
    }: { guardId: number; filters: Pick<TimesheetFilters, "period_start" | "period_end"> },
    { rejectWithValue }
  ) => {
    try {
      return await timesheetService.deleteManualPay(guardId, filters);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to clear manual pay");
    }
  }
);

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState,
  reducers: {
    clearTimesheetError: (state) => {
      state.error = null;
    },
    clearTimesheetReport: (state) => {
      state.report = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.filters = action.payload.filters;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to load timesheets";
      })
      .addCase(fetchTimesheetGuardReport.pending, (state) => {
        state.isReportLoading = true;
        state.error = null;
      })
      .addCase(fetchTimesheetGuardReport.fulfilled, (state, action) => {
        state.isReportLoading = false;
        state.report = action.payload;
      })
      .addCase(fetchTimesheetGuardReport.rejected, (state, action) => {
        state.isReportLoading = false;
        state.error = (action.payload as string) || "Failed to load guard timesheet";
      })
      .addCase(saveTimesheetManualPay.fulfilled, (state, action) => {
        if (state.report) {
          state.report.manual_pay = action.payload.item;
        }
      });
  },
});

export const { clearTimesheetError, clearTimesheetReport } = timesheetSlice.actions;
export default timesheetSlice.reducer;
