import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { dutyStatusReportService } from "@/service/dutyStatusReport.service";
import { 
  DutyStatusReport, 
  DutyStatusReportParams, 
  DutyStatusReportState,
  CreateDutyStatusReportDto,
  UpdateDutyStatusReportDto
} from "@/app/types/dutyStatusReport";

const initialState: DutyStatusReportState = {
  reports: [],
  currentReport: null,
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

export const fetchReports = createAsyncThunk(
  "dutyStatusReport/fetchReports",
  async (params: DutyStatusReportParams = {}, { rejectWithValue }) => {
    try {
      return await dutyStatusReportService.getReports(params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty status reports";
      return rejectWithValue(message);
    }
  }
);

export const fetchReport = createAsyncThunk(
  "dutyStatusReport/fetchReport",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await dutyStatusReportService.getReport(id, params);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch duty status report";
      return rejectWithValue(message);
    }
  }
);

export const createReport = createAsyncThunk(
  "dutyStatusReport/createReport",
  async (
    data: CreateDutyStatusReportDto,
    { rejectWithValue }
  ) => {
    try {
      return await dutyStatusReportService.createReport(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create duty status report";
      return rejectWithValue(message);
    }
  }
);

export const updateReport = createAsyncThunk(
  "dutyStatusReport/updateReport",
  async (
    { id, data }: { id: number; data: UpdateDutyStatusReportDto },
    { rejectWithValue }
  ) => {
    try {
      return await dutyStatusReportService.updateReport(id, data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duty status report";
      return rejectWithValue(message);
    }
  }
);

export const deleteReport = createAsyncThunk(
  "dutyStatusReport/deleteReport",
  async (id: number, { rejectWithValue }) => {
    try {
      await dutyStatusReportService.deleteReport(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete duty status report";
      return rejectWithValue(message);
    }
  }
);

export const toggleVisibility = createAsyncThunk(
  "dutyStatusReport/toggleVisibility",
  async (
    { id, visible_to_client }: { id: number; visible_to_client: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await dutyStatusReportService.toggleVisibility(id, visible_to_client);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle report visibility";
      return rejectWithValue(message);
    }
  }
);

export const addMedia = createAsyncThunk(
  "dutyStatusReport/addMedia",
  async (
    { id, files }: { id: number; files: File[] },
    { rejectWithValue }
  ) => {
    try {
      return await dutyStatusReportService.addMedia(id, files);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add media to report";
      return rejectWithValue(message);
    }
  }
);

export const deleteMedia = createAsyncThunk(
  "dutyStatusReport/deleteMedia",
  async (
    { reportId, mediaId }: { reportId: number; mediaId: number },
    { rejectWithValue }
  ) => {
    try {
      await dutyStatusReportService.deleteMedia(reportId, mediaId);
      return { reportId, mediaId };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete media from report";
      return rejectWithValue(message);
    }
  }
);

/* ------------------ Slice ------------------ */

const dutyStatusReportSlice = createSlice({
  name: "dutyStatusReport",
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    setReports: (state, action: PayloadAction<DutyStatusReport[]>) => {
      state.reports = action.payload;
    },
    updateReportInList: (state, action: PayloadAction<DutyStatusReport>) => {
      const index = state.reports.findIndex(
        (report) => report.id === action.payload.id
      );
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeMediaFromCurrentReport: (state, action: PayloadAction<number>) => {
      if (state.currentReport?.media) {
        state.currentReport.media = state.currentReport.media.filter(
          (media) => media.id !== action.payload
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single report
      .addCase(fetchReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload.item;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create report
      .addCase(createReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = [action.payload.item, ...state.reports];
        state.currentReport = action.payload.item;
        state.pagination.total += 1;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update report
      .addCase(updateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(
          (report) => report.id === action.payload.item.id
        );
        if (index !== -1) {
          state.reports[index] = action.payload.item;
        }
        if (state.currentReport?.id === action.payload.item.id) {
          state.currentReport = action.payload.item;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete report
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = state.reports.filter(
          (report) => report.id !== action.payload
        );
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
        }
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1
        );
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle visibility
      .addCase(toggleVisibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(
          (report) => report.id === action.payload.item.id
        );
        if (index !== -1) {
          state.reports[index] = action.payload.item;
        }
        if (state.currentReport?.id === action.payload.item.id) {
          state.currentReport = action.payload.item;
        }
      })
      .addCase(toggleVisibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add media
      .addCase(addMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(
          (report) => report.id === action.payload.item.id
        );
        if (index !== -1) {
          state.reports[index] = action.payload.item;
        }
        if (state.currentReport?.id === action.payload.item.id) {
          state.currentReport = action.payload.item;
        }
      })
      .addCase(addMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete media
      .addCase(deleteMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reportId, mediaId } = action.payload;
        
        // Update report in list
        const reportIndex = state.reports.findIndex(
          (report) => report.id === reportId
        );
        if (reportIndex !== -1 && state.reports[reportIndex].media) {
          state.reports[reportIndex].media = state.reports[reportIndex].media!.filter(
            (media) => media.id !== mediaId
          );
        }
        
        // Update current report if it matches
        if (state.currentReport?.id === reportId && state.currentReport.media) {
          state.currentReport.media = state.currentReport.media.filter(
            (media) => media.id !== mediaId
          );
        }
      })
      .addCase(deleteMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearReportError,
  clearCurrentReport,
  setReports,
  updateReportInList,
  removeMediaFromCurrentReport,
} = dutyStatusReportSlice.actions;

export default dutyStatusReportSlice.reducer;