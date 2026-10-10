// section-config.ts
export const SECTION_CONFIG: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  early_checkin: {
    label: "Early Check-In",
    icon: "🕒",
    description:
      "Control how early guards may check in before a scheduled duty starts",
  },

  early_checkout: {
    label: "Early Checkout Engine",
    icon: "⚙️",
    description: "Advanced early checkout engine controls",
  },

  early_checkout_legacy: {
    label: "Legacy Early Checkout",
    icon: "🕰️",
    description: "Pre-existing early checkout settings",
  },

  early_checkout_reason: {
    label: "Reason Configuration",
    icon: "📝",
    description: "Reason input mode, catalog, and validation",
  },

  early_checkout_rules: {
    label: "Time Band Rules",
    icon: "📋",
    description:
      "Time-based decision, guard, payroll and notification rules",
  },

  early_checkout_guard_ui: {
    label: "Guard UI Messages",
    icon: "📱",
    description: "Guard-facing checkout messages",
  },

  early_checkout_ui: {
    label: "Guard UI Messages",
    icon: "📱",
    description: "Guard-facing checkout messages",
  },

  early_checkout_operations: {
    label: "Operations Notifications",
    icon: "📨",
    description: "Operations team message templates",
  },

  early_checkout_client: {
    label: "Client Notifications",
    icon: "🏢",
    description: "Client message templates",
  },

  early_checkout_supervisor: {
    label: "Supervisor Notifications",
    icon: "👔",
    description: "Supervisor message templates",
  },
};

export const getSectionLabel = (section: string) =>
  SECTION_CONFIG[section]?.label ?? section;

export const getSectionIcon = (section: string) =>
  SECTION_CONFIG[section]?.icon ?? "📄";

export const getSectionDescription = (section: string) =>
  SECTION_CONFIG[section]?.description ?? "";

export const ENGINE_FLAG_KEY =
  "attendance_policy.early_checkout_engine_enabled";

export const EARLY_CHECKIN_ENABLED_KEY =
  "attendance_policy.early_checkin_enabled";

export const EARLY_CHECKIN_MINUTES_KEY =
  "attendance_policy.early_checkin_minutes";
