import {
  AttendancePolicyState,
  DeleteOverrideRequest,
  FetchScopeParams,
  PolicyParams,
  PolicyScopeType,
  UpdateScopeRequest,
} from "@/app/types/attendancePolicy";
import { attendancePolicyService } from "@/service/attendancePolicy.service";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const initialState: AttendancePolicyState = {
  definitions: [],
  definitionsTotal: 0,
  definitionsLoaded: false,

  activeScopeType: "global",
  activeScopeId: null,
  items: [],

  isLoading: false,
  isSaving: false,
  deletingKey: null,
  error: null,
  notFound: false,
  forbidden: false,
  fieldErrors: {},

  draftValues: {},
  overriddenKeys: {},
  lastFetchedAt: null,
};

export const fetchPolicyDefinitions = createAsyncThunk(
  "attendancePolicy/fetchDefinitions",
  async (params: PolicyParams = {}, { rejectWithValue }) => {
    try { return await attendancePolicyService.getDefinitions(params); }
    catch (e: any) {
      if (e && typeof e === "object" && "kind" in e) return rejectWithValue(e);
      return rejectWithValue({ kind: "unknown", message: e?.message ?? "Failed to fetch definitions" });
    }
  }
);

export const fetchPolicyScope = createAsyncThunk(
  "attendancePolicy/fetchScope",
  async (params: FetchScopeParams, { rejectWithValue }) => {
    try {
      const { scopeType, scopeId, group } = params;
      switch (scopeType) {
        case "global": return await attendancePolicyService.getGlobal({ group });
        case "site": return await attendancePolicyService.getSite(scopeId as number, { group });
        case "site_location": return await attendancePolicyService.getSiteLocation(scopeId as number, { group });
        case "duty": return await attendancePolicyService.getDuty(scopeId as number, { group });
        default: throw new Error(`Unknown scope: ${scopeType}`);
      }
    } catch (e: any) {
      if (e && typeof e === "object" && "kind" in e) return rejectWithValue(e);
      return rejectWithValue({ kind: "unknown", message: e?.message ?? "Failed to fetch policy scope" });
    }
  }
);

export const updatePolicyScope = createAsyncThunk(
  "attendancePolicy/updateScope",
  async (payload: UpdateScopeRequest, { rejectWithValue }) => {
    try {
      const { scopeType, scopeId, settings } = payload;
      const body = { settings };
      switch (scopeType) {
        case "global": return await attendancePolicyService.updateGlobal(body);
        case "site": return await attendancePolicyService.updateSite(scopeId as number, body);
        case "site_location": return await attendancePolicyService.updateSiteLocation(scopeId as number, body);
        case "duty": return await attendancePolicyService.updateDuty(scopeId as number, body);
        default: throw new Error(`Unknown scope: ${scopeType}`);
      }
    } catch (e: any) {
      if (e && typeof e === "object" && "kind" in e) return rejectWithValue(e);
      return rejectWithValue({ kind: "unknown", message: typeof e === "string" ? e : "Failed to update policy" });
    }
  }
);

export const deletePolicyOverride = createAsyncThunk(
  "attendancePolicy/deleteOverride",
  async (payload: DeleteOverrideRequest, { rejectWithValue }) => {
    try {
      const { scopeType, scopeId, key } = payload;
      return await attendancePolicyService.deleteOverride(scopeType, scopeId, key);
    } catch (e: any) {
      if (e && typeof e === "object" && "kind" in e) return rejectWithValue(e);
      return rejectWithValue({ kind: "unknown", message: e?.message ?? "Failed to delete override" });
    }
  }
);

const attendancePolicySlice = createSlice({
  name: "attendancePolicy",
  initialState,
  reducers: {
    setActiveScope: (
      state, action: PayloadAction<{ scopeType: PolicyScopeType; scopeId?: number | null }>
    ) => {
      state.activeScopeType = action.payload.scopeType;
      state.activeScopeId = action.payload.scopeId ?? null;
      state.draftValues = {};
      state.overriddenKeys = {};
      state.fieldErrors = {};
      state.error = null;
      state.notFound = false;
      state.forbidden = false;
    },
    enableOverride: (state, action: PayloadAction<{ key: string; inheritedValue: unknown }>) => {
      state.overriddenKeys[action.payload.key] = true;
      state.draftValues[action.payload.key] = action.payload.inheritedValue;
    },
    disableOverrideLocal: (state, action: PayloadAction<string>) => {
      delete state.overriddenKeys[action.payload];
      delete state.draftValues[action.payload];
    },
    setDraftValue: (state, action: PayloadAction<{ key: string; value: unknown }>) => {
      state.draftValues[action.payload.key] = action.payload.value;
    },
    clearDraftValue: (state, action: PayloadAction<string>) => {
      delete state.draftValues[action.payload];
    },
    clearAllDrafts: (state) => {
      state.draftValues = {};
      state.overriddenKeys = {};
      state.fieldErrors = {};
    },
    clearFieldError: (state, action: PayloadAction<string>) => {
      delete state.fieldErrors[action.payload];
    },
    clearAttendancePolicyError: (state) => {
      state.error = null; state.fieldErrors = {};
      state.notFound = false; state.forbidden = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicyDefinitions.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchPolicyDefinitions.fulfilled, (s, a) => {
        s.isLoading = false;
        s.definitions = a.payload.items;
        s.definitionsTotal = a.payload.total;
        s.definitionsLoaded = true;
      })
      .addCase(fetchPolicyDefinitions.rejected, (s, a: any) => {
        s.isLoading = false; s.error = a.payload?.message ?? "Failed to fetch definitions";
      })

      .addCase(fetchPolicyScope.pending, (s) => {
        s.isLoading = true; s.error = null; s.fieldErrors = {};
        s.notFound = false; s.forbidden = false;
      })
      .addCase(fetchPolicyScope.fulfilled, (s, a) => {
        s.isLoading = false;
        s.items = a.payload.items;
        s.activeScopeType = a.payload.scope.type;
        s.activeScopeId = a.payload.scope.id;
        s.draftValues = {};
        s.overriddenKeys = {};
        s.lastFetchedAt = Date.now();
      })
      .addCase(fetchPolicyScope.rejected, (s, a: any) => {
        s.isLoading = false;
        s.notFound = a.payload?.kind === "not_found";
        s.forbidden = a.payload?.kind === "forbidden";
        s.error = a.payload?.message ?? "Failed to fetch policy scope";
      })

      .addCase(updatePolicyScope.pending, (s) => {
        s.isSaving = true; s.error = null; s.fieldErrors = {};
      })
      .addCase(updatePolicyScope.fulfilled, (s, a) => {
        s.isSaving = false;
        s.items = a.payload.items;          // §7.11 — refreshed PUT response is authoritative
        s.activeScopeType = a.payload.scope.type;
        s.activeScopeId = a.payload.scope.id;
        s.draftValues = {};
        s.overriddenKeys = {};
        s.fieldErrors = {};
        s.lastFetchedAt = Date.now();
      })
      .addCase(updatePolicyScope.rejected, (s, a: any) => {
        s.isSaving = false;
        s.notFound = a.payload?.kind === "not_found";
        s.forbidden = a.payload?.kind === "forbidden";
        s.error = a.payload?.message ?? "Failed to update policy";
        s.fieldErrors = a.payload?.errors ?? {};
      })

      .addCase(deletePolicyOverride.pending, (s, a) => {
        s.deletingKey = a.meta.arg.key; s.error = null;
      })
      .addCase(deletePolicyOverride.fulfilled, (s, a) => {
        s.deletingKey = null;
        const item = s.items.find((i) => i.key === a.payload.key);
        if (item) {
          item.has_override = false;
          item.override_value = null;
          item.effective_value = a.payload.effective_value;
          item.effective_source = a.payload.effective_source;
          item.effective_source_id = a.payload.effective_source_id;
          item.effective_is_override = false;
        }
        delete s.draftValues[a.payload.key];
        delete s.overriddenKeys[a.payload.key];
      })
      .addCase(deletePolicyOverride.rejected, (s, a: any) => {
        s.deletingKey = null; s.error = a.payload?.message ?? "Failed to delete override";
      });
  },
});

export const {
  setActiveScope, enableOverride, disableOverrideLocal,
  setDraftValue, clearDraftValue, clearAllDrafts,
  clearFieldError, clearAttendancePolicyError,
} = attendancePolicySlice.actions;

export default attendancePolicySlice.reducer;
