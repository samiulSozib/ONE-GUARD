/* =========================================================
   Attendance Policy Types  (matches One Guard API doc v1.0)
   ========================================================= */

export type PolicyScopeType = "global" | "site" | "site_location" | "duty";
export type PolicyValueType = "boolean" | "integer" | "string" | "json";
export type PolicyControlType =
  | "toggle"
  | "number"
  | "select"
  | "repeater"
  | "rule_builder"
  | "template_editor";

export interface LocalizedString {
  en: string;
  fa?: string;
  ps?: string;
  [locale: string]: string | undefined;
}

export interface PolicyOption {
  value: string | number | boolean;
  label: LocalizedString;
}

/* ---------- Definition (§4.1) ---------- */
export interface PolicyDefinition {
  id: number;
  group: string;
  section: string;
  key: string;
  label: LocalizedString;
  description: LocalizedString | null;
  value_type: PolicyValueType;
  control_type: PolicyControlType;
  options: PolicyOption[] | null;
  validation_rules: Record<string, any> | null;
  allowed_scopes: PolicyScopeType[];
  metadata: {
    supported_locales?: string[];
    supported_placeholders?: string[];
    decision_options?: { value: string; label: LocalizedString }[];
    payroll_mode_options?: { value: string; label: LocalizedString }[];
    completion_options?: { value: string; label: LocalizedString }[];
    client_detail_options?: { value: string; label: LocalizedString }[];
    template_fields?: string[];
    [key: string]: any;
  } | null;
  is_inheritable: boolean;
  is_editable: boolean;
  sort_order: number;
}

/* ---------- Effective item (§4.2) ---------- */
export interface PolicyItem {
  key: string;
  group: string;
  section: string;
  label: LocalizedString;
  description?: LocalizedString | null;
  value_type: PolicyValueType;
  control_type: PolicyControlType;
  options?: PolicyOption[] | null;
  validation_rules?: Record<string, any> | null;
  allowed_scopes: PolicyScopeType[];
  metadata?: Record<string, any> | null;
  is_editable: boolean;
  is_inheritable: boolean;

  scope_type: PolicyScopeType;
  scope_id: number | null;
  can_override: boolean;

  global_value: unknown;
  has_override: boolean;
  override_value: unknown | null;
  inherited_value: unknown | null;
  inherited_source: PolicyScopeType | null;
  inherited_source_id: number | null;
  effective_value: unknown;
  effective_source: PolicyScopeType;
  effective_source_id: number | null;
  effective_is_override: boolean;
}

/* ---------- rule_builder shape (§6) ---------- */
export interface RuleBand {
  id: string;
  label: LocalizedString;
  min_minutes_early: number;
  max_minutes_early: number | null;
  decision: "immediate" | "approval" | "block";
  guard: { require_reason: boolean; require_confirmation: boolean };
  approval?: {
    completion_mode?: string;
    valid_minutes?: number;
    allow_resubmit_after_rejection?: boolean;
    resubmit_cooldown_minutes?: number;
  };
  payroll?: {
    mode?: string;
    paid_grace_minutes?: number;
    rounding_minutes?: number;
    allow_admin_override?: boolean;
  };
  notifications?: {
    operations?: { on_request?: boolean; on_approval?: boolean; on_rejection?: boolean; on_completion?: boolean };
    supervisor?: { on_request?: boolean; on_approval?: boolean; on_rejection?: boolean; on_completion?: boolean };
    client?: {
      on_request?: boolean; on_approval?: boolean; on_rejection?: boolean;
      on_completion?: boolean; on_approval_expired?: boolean;
      detail_level?: string;
    };
    guard?: {
      on_submission?: boolean; on_approval?: boolean; on_rejection?: boolean;
      on_expiry?: boolean; on_completion?: boolean;
    };
  };
}

/* ---------- repeater shape (§6) ---------- */
export interface ReasonCatalogItem {
  code: string;
  label: LocalizedString;
  requires_note: boolean;
  is_active: boolean;
}

/* ---------- template shape (§6) ---------- */
export type TemplateLocaleValue = {
  title?: string; message?: string;
  reason_label?: string; reason_placeholder?: string;
  primary_action?: string; secondary_action?: string;
  [key: string]: string | undefined;
};
export type TemplateValue = Record<string, TemplateLocaleValue>;

/* ---------- API bodies ---------- */
export type PolicySettingsMap = Record<string, unknown>;
export interface UpdatePolicyPayload { settings: PolicySettingsMap }

export interface DefinitionsBody { group: string; items: PolicyDefinition[]; total: number }
export interface ScopeBody {
  group: string;
  scope: { type: PolicyScopeType; id: number | null };
  items: PolicyItem[];
  total: number;
}
export interface DeleteOverrideBody {
  message: string;
  key: string;
  scope_type: PolicyScopeType;
  scope_id: number | null;
  has_override: boolean;
  effective_value: unknown;
  effective_source: PolicyScopeType;
  effective_source_id: number | null;
}

/* ---------- Params / requests ---------- */
export interface PolicyParams { group?: string }
export interface FetchScopeParams {
  scopeType: PolicyScopeType;
  scopeId?: number | null;
  group?: string;
}
export interface UpdateScopeRequest {
  scopeType: PolicyScopeType;
  scopeId?: number | null;
  settings: PolicySettingsMap;
}
export interface DeleteOverrideRequest {
  scopeType: PolicyScopeType;
  scopeId: number;
  key: string;
}

/* ---------- Redux state ---------- */
export interface AttendancePolicyState {
  definitions: PolicyDefinition[];
  definitionsTotal: number;
  definitionsLoaded: boolean;

  activeScopeType: PolicyScopeType;
  activeScopeId: number | null;
  items: PolicyItem[];

  isLoading: boolean;
  isSaving: boolean;
  deletingKey: string | null;
  error: string | null;
  notFound: boolean;
  forbidden: boolean;
  fieldErrors: Record<string, string[]>;

  draftValues: PolicySettingsMap;
  overriddenKeys: Record<string, true>;
  lastFetchedAt: number | null;
}
