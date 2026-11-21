import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CreateInvoiceDto,
  GenerateInvoiceDto,
  InvoiceDetail,
  InvoiceFilters,
  InvoiceListItem,
  InvoiceSummary,
  RecordPaymentDto,
  InvoiceStatus,
  UpdateInvoiceDto,
} from "@/app/types/invoice";
import { invoiceService } from "@/service/invoice.service";

interface InvoiceState {
  items: InvoiceListItem[];
  summary: InvoiceSummary | null;
  detail: InvoiceDetail | null;
  filters: InvoiceFilters;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  items: [],
  summary: null,
  detail: null,
  filters: { page: 1, per_page: 20 },
  pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",
  async (filters: InvoiceFilters, { rejectWithValue }) => {
    try {
      return await invoiceService.getInvoices(filters);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load invoices");
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  "invoice/fetchInvoice",
  async (id: number, { rejectWithValue }) => {
    try {
      return await invoiceService.getInvoice(id);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load invoice");
    }
  }
);

export const generateInvoices = createAsyncThunk(
  "invoice/generateInvoices",
  async (data: GenerateInvoiceDto, { rejectWithValue }) => {
    try {
      return await invoiceService.generate(data);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to generate invoices");
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (data: CreateInvoiceDto, { rejectWithValue }) => {
    try {
      return await invoiceService.createInvoice(data);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to create invoice");
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoice/updateInvoice",
  async (
    payload: { id: number; data: UpdateInvoiceDto },
    { rejectWithValue }
  ) => {
    try {
      return await invoiceService.updateInvoice(payload.id, payload.data);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to update invoice");
    }
  }
);

export const updateInvoiceStatus = createAsyncThunk<
  InvoiceDetail,
  { id: number; status: InvoiceStatus; notes?: string | null },
  { rejectValue: string }
>(
  "invoice/updateStatus",
  async (payload, { rejectWithValue }) => {
    try {
      return await invoiceService.updateStatus(
        payload.id,
        payload.status,
        payload.notes
      );
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to update status");
    }
  }
);

export const recordInvoicePayment = createAsyncThunk<
  InvoiceDetail,
  { id: number; data: RecordPaymentDto },
  { rejectValue: string }
>(
  "invoice/recordPayment",
  async (payload, { rejectWithValue }) => {
    try {
      return await invoiceService.recordPayment(payload.id, payload.data);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record payment");
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoiceDetail: (state) => {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.filters = action.payload.filters;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload || action.error.message);
      })
      .addCase(fetchInvoice.pending, (state) => {
        state.isDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = String(action.payload || action.error.message);
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.detail = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.detail = action.payload;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        );
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.detail = action.payload;
      })
      .addCase(recordInvoicePayment.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export const { clearInvoiceDetail } = invoiceSlice.actions;
export default invoiceSlice.reducer;
