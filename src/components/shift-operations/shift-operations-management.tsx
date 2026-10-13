"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShiftEntitySearchSelect from "./shift-entity-search-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type {
  ShiftFilters,
  ShiftOperationRow,
  ShiftOperationsList,
  ShiftOperationsOverview,
  ShiftOperationsSummary,
  ShiftAssignmentDetails,
} from "@/app/types/shift-operations";
import {
  shiftOperationsService,
  type ShiftExportFormat,
} from "@/service/shift-operations.service";
/* =====================================================
   Types
===================================================== */
type ViewMode =
  | "all"
  | "assignments"
  | "unfilled";
type FilterKey = Exclude<
  keyof ShiftFilters,
  "from" | "to" | "page" | "per_page" | "search"
>;
type FilterDefinition = {
  key: FilterKey;
  label: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};
const PRIMARY = "#5F0015";
const emptySummary: ShiftOperationsSummary = {
  assignment_rows: 0,
  unfilled_duties: 0,
  unfilled_positions: 0,
  attended_assignments: 0,
  on_duty: 0,
  on_break: 0,
  missing_check_out: 0,
  early_check_ins: 0,
  early_checkouts: 0,
  replaced_assignments: 0,
  patrol_completed: 0,
  patrol_incomplete: 0,
  shifts_with_incidents: 0,
  shifts_with_reports: 0,
};
const fieldClass =
  "h-9 w-full min-w-0 rounded-md border border-input " +
  "bg-background px-3 text-sm text-foreground " +
  "outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#5F0015]/25";
const filterDefinitions: FilterDefinition[] = [
  { key: "client_id", label: "Client", placeholder: "Client ID" },
  { key: "site_id", label: "Site", placeholder: "Site ID" },
  {
    key: "site_location_id",
    label: "Site Location",
    placeholder: "Location ID",
  },
  { key: "guard_id", label: "Security Officer", placeholder: "Guard ID" },
  {
    key: "duty_schedule_id",
    label: "Shift Schedule",
    placeholder: "Schedule ID",
  },
  { key: "duty_id", label: "Duty", placeholder: "Duty ID" },
  {
    key: "service_mode",
    label: "Service Mode",
    options: [
      { value: "continuous_shift", label: "Continuous Shift" },
      { value: "patrol_visits", label: "Patrol Visits" },
    ],
  },
  {
    key: "assignment_status",
    label: "Assignment Status",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "replaced", label: "Replaced" },
    ],
  },
  {
    key: "operational_status",
    label: "Operational Status",
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "on_duty", label: "On Duty" },
      { value: "on_break", label: "On Break" },
      { value: "checked_out", label: "Checked Out" },
      { value: "missing_check_out", label: "Missing Checkout" },
      {
        value: "not_checked_in_after_start",
        label: "Not Checked In",
      },
      { value: "unassigned", label: "Unassigned" },
      { value: "replaced", label: "Replaced" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    options: [
      { value: "attended", label: "Attended" },
      { value: "not_attended", label: "Not Attended" },
      { value: "not_due", label: "Not Due" },
    ],
  },
  {
    key: "check_in_timing",
    label: "Check-In Timing",
    options: [
      { value: "early", label: "Early" },
      { value: "on_time", label: "On Time" },
      { value: "late", label: "Late" },
    ],
  },
  {
    key: "check_out_timing",
    label: "Checkout Timing",
    options: [
      { value: "early", label: "Early" },
      { value: "on_time", label: "On Time" },
      { value: "late", label: "Late" },
    ],
  },
  {
    key: "checkout_source",
    label: "Checkout Source",
    options: [
      { value: "automatic", label: "Automatic" },
      { value: "manual", label: "Manual" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    key: "patrol_status",
    label: "Patrol Status",
    options: [
      { value: "not_applicable", label: "Not Applicable" },
      { value: "not_started", label: "Not Started" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "incomplete", label: "Incomplete" },
      { value: "missed", label: "Missed" },
    ],
  },
  {
    key: "coverage_status",
    label: "Coverage Status",
    options: [
      { value: "covered", label: "Covered" },
      { value: "partial", label: "Partial" },
      { value: "unassigned", label: "Unassigned" },
      { value: "overstaffed", label: "Overstaffed" },
    ],
  },
  ...(
    [
      ["has_incidents", "Has Incidents"],
      ["has_reports", "Has Reports"],
      ["is_replaced", "Is Replaced"],
      ["has_early_checkout_request", "Early Checkout Request"],
    ] as const
  ).map(([key, label]) => ({
    key,
    label,
    options: [
      { value: "1", label: "Yes" },
      { value: "0", label: "No" },
    ],
  })),
];
function dateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function initialFilters(): ShiftFilters {
  const today = new Date();
  const previous = new Date(today);
  previous.setDate(previous.getDate() - 6);
  return {
    from: dateString(previous),
    to: dateString(today),
    page: 1,
    per_page: 20,
  };
}
function readable(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateTime(
  value?: string | null,
  timeZone?: string | null
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || "UTC",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unable to load shift operations.";
}
function badgeClasses(value?: string | null): string {
  switch (value) {
    case "on_duty":
    case "active":
    case "attended":
    case "covered":
    case "completed":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300";
    case "on_break":
    case "upcoming":
    case "pending":
    case "partial":
    case "early":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
    case "unassigned":
    case "not_attended":
    case "not_checked_in_after_start":
    case "missing_check_out":
    case "missed":
    case "incomplete":
    case "late":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
    case "checked_out":
    case "on_time":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
function StatusBadge({
  status,
  label,
}: {
  status?: string | null;
  label?: string;
}) {
  return (
    <span
      className={
        "inline-flex max-w-full items-center rounded-full border " +
        "px-2.5 py-1 text-[11px] font-medium " +
        badgeClasses(status)
      }
    >
      <span className="truncate">
        {label || readable(status)}
      </span>
    </span>
  );
}
function SummaryCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  note?: string;
}) {
  return (
    <Card className="min-w-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-[#5F0015]/10 p-2.5">
          <Icon className="h-4 w-4 text-[#5F0015]" />
        </div>
      </div>
      {note && (
        <p className="mt-2 text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </Card>
  );
}
function DetailValue({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">
        {value === null || value === undefined || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}
/* =====================================================
   Main Component
===================================================== */
export default function ShiftOperationsManagement() {
  const [filters, setFilters] =
    useState<ShiftFilters>(initialFilters);
  const [draftFilters, setDraftFilters] =
    useState<ShiftFilters>(initialFilters);
  const [searchText, setSearchText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("all");
  // The backend wraps its result in body; api.service unwraps it.
  // Validate the unwrapped object before rendering wide table content.
  const [list, setList] =
    useState<ShiftOperationsList | null>(null);
  const [overview, setOverview] =
    useState<ShiftOperationsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] =
    useState<ShiftExportFormat | null>(null);
  const [selectedRow, setSelectedRow] =
    useState<ShiftOperationRow | null>(null);
  const [details, setDetails] =
    useState<ShiftAssignmentDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  /* =====================================================
     API Data
  ===================================================== */
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    shiftOperationsService
      .getOperations(filters)
      .then((response) => {
        if (!active) return;
        if (
          !response ||
          !Array.isArray(response.items) ||
          !response.pagination ||
          typeof response.pagination.total !== "number" ||
          !response.summary
        ) {
          throw new Error(
            "Unexpected Shift Operations response. Expected body.items, body.pagination and body.summary."
          );
        }
        setList(response);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(getErrorMessage(err));
          setList(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, refreshKey]);
  useEffect(() => {
    let active = true;
    setOverviewLoading(true);
    const { page, per_page, ...overviewFilters } = filters;
    void page;
    void per_page;
    shiftOperationsService
      .getOverview(overviewFilters)
      .then((response) => {
        if (active) setOverview(response);
      })
      .catch(() => {
        if (active) setOverview(null);
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, refreshKey]);
  const summary =
    overview?.summary || list?.summary || emptySummary;
  const visibleRows = useMemo(() => {
    const rows = list?.items || [];
    if (view === "assignments") {
      return rows.filter((row) => row.row_type === "assignment");
    }
    if (view === "unfilled") {
      return rows.filter((row) => row.row_type === "unfilled_slots");
    }
    return rows;
  }, [list, view]);
  const currentPage = list?.pagination.current_page || 1;
  const lastPage = list?.pagination.last_page || 1;
  const totalRows = list?.pagination.total || 0;
  const perPage = list?.pagination.per_page || 20;
  const updateDraft = (
    key: keyof ShiftFilters,
    value: string
  ) => {
    setDraftFilters((previous) => ({
      ...previous,
      [key]: value || undefined,
    }));
  };
  const applyFilters = useCallback(() => {
    const from = draftFilters.from;
    const to = draftFilters.to;
    if (!from || !to || to < from) {
      setError("Please select a valid date range.");
      return;
    }
    const milliseconds =
      new Date(`${to}T00:00:00Z`).getTime() -
      new Date(`${from}T00:00:00Z`).getTime();
    if (milliseconds > 30 * 86400000) {
      setError("The maximum reporting range is 31 calendar days.");
      return;
    }
    setError(null);
    setFilters({
      ...draftFilters,
      search: searchText.trim() || undefined,
      page: 1,
      per_page: filters.per_page || 20,
    });
  }, [draftFilters, searchText, filters.per_page]);
  const clearFilters = () => {
    const initial = initialFilters();
    setDraftFilters(initial);
    setFilters(initial);
    setSearchText("");
    setView("all");
    setError(null);
  };
  const changePage = (page: number) => {
    if (page < 1 || page > lastPage) return;
    setFilters((previous) => ({
      ...previous,
      page,
    }));
  };
  const openDetails = async (row: ShiftOperationRow) => {
    if (row.assignment_id === null) return;
    setSelectedRow(row);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const result =
        await shiftOperationsService.getAssignmentDetails(
          row.assignment_id
        );
      setDetails(result);
    } catch (err: unknown) {
      setDetailsError(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };
  const handleExport = async (format: ShiftExportFormat) => {
    setExporting(format);
    try {
      await shiftOperationsService.exportOperations(format, filters);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(null);
    }
  };
  /* =====================================================
     UI
  ===================================================== */
  return (
<div className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-clip p-3 pt-5 sm:p-4 md:p-6">      {/* Header */}
      <Card className="w-full min-w-0 max-w-full overflow-hidden p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10">
              <Shield className="h-5 w-5 text-[#5F0015]" />
            </div>
            <div>
              <h1 className="text-base font-semibold">
                Shift Operations
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor guards, shift attendance, patrols and coverage
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-[#5F0015] text-white hover:bg-[#75001a]"
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <div className="flex min-w-0 items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Summary */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
          label="Guard Assignments"
          value={summary.assignment_rows}
          icon={Users}
        />
        <SummaryCard
          label="Unfilled Positions"
          value={summary.unfilled_positions}
          icon={ShieldAlert}
        />
        <SummaryCard
          label="Attended"
          value={summary.attended_assignments}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="On Duty"
          value={summary.on_duty}
          icon={ShieldCheck}
        />
        <SummaryCard
          label="On Break"
          value={summary.on_break}
          icon={Clock3}
        />
        <SummaryCard
          label="Missing Checkout"
          value={summary.missing_check_out}
          icon={AlertCircle}
        />
        <SummaryCard
          label="Replaced Assignments"
          value={summary.replaced_assignments}
          icon={RefreshCw}
        />
        <SummaryCard
          label="Incomplete Patrols"
          value={summary.patrol_incomplete}
          icon={Activity}
        />
      </div>
      {overviewLoading && (
        <p className="text-xs text-muted-foreground">
          Updating operational summary...
        </p>
      )}
      {/* Filters */}
      <Card className="w-full min-w-0 max-w-full overflow-hidden p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              Search & Filters
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter operations by date, guard, duty, attendance and status
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className={`${fieldClass} pl-9`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder="Search guard, shift, site..."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              From Date (UTC)
            </label>
            <input
              type="date"
              className={fieldClass}
              value={draftFilters.from}
              onChange={(e) => updateDraft("from", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              To Date (UTC)
            </label>
            <input
              type="date"
              className={fieldClass}
              value={draftFilters.to}
              onChange={(e) => updateDraft("to", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${
                advancedOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
          <Button
            size="sm"
            className="bg-[#5F0015] text-white hover:bg-[#75001a]"
            onClick={applyFilters}
          >
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
        {advancedOpen && (
          <div className="mt-4 border-t pt-4">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filterDefinitions.map((definition) => (
                <div key={definition.key}>
                  <label className="mb-1.5 block text-xs font-medium">
                    {definition.label}
                  </label>
                  {definition.options ? (
                    <select
                      className={fieldClass}
                      value={String(
                        draftFilters[definition.key] ?? ""
                      )}
                      onChange={(e) =>
                        updateDraft(definition.key, e.target.value)
                      }
                    >
                      <option value="">All</option>
                      {definition.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <ShiftEntitySearchSelect
                      field={definition.key as "client_id" | "site_id" | "site_location_id" | "guard_id" | "duty_schedule_id" | "duty_id"}
                      value={String(draftFilters[definition.key] ?? "")}
                      clientId={String(draftFilters.client_id ?? "")}
                      siteId={String(draftFilters.site_id ?? "")}
                      onChange={(value) => {
                        setDraftFilters((previous) => ({
                          ...previous,
                          [definition.key]: value || undefined,
                          ...(definition.key === "client_id" ? {
                            site_id: undefined,
                            site_location_id: undefined,
                          } : {}),
                          ...(definition.key === "site_id" ? {
                            site_location_id: undefined,
                          } : {}),
                        }));
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      {/* Operations */}
      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <div className="border-b p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">
                Operational Shift List
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalRows.toLocaleString()} operational rows
                across all pages
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {filters.from} — {filters.to}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["all", "All Operations"],
                ["assignments", "Guard Assignments"],
                ["unfilled", "Unfilled Positions"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={view === value ? "default" : "outline"}
                className={
                  view === value
                    ? "bg-[#5F0015] text-white hover:bg-[#75001a]"
                    : ""
                }
                onClick={() => setView(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          {view !== "all" && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              This view filters the current server page only.
              Counts and pagination still refer to all operational rows.
            </p>
          )}
        </div>
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6">
            <Loader2 className="h-7 w-7 animate-spin text-[#5F0015]" />
            <p className="text-sm font-medium">
              Loading Shift Operations
            </p>
            <p className="text-xs text-muted-foreground">
              Retrieving operational records...
            </p>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center">
            <ShieldAlert className="h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-semibold">
              No shift operations found
            </p>
            <p className="text-xs text-muted-foreground">
              Try a different date range or adjust your filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden w-0 min-w-full max-w-full overflow-x-auto overscroll-x-contain lg:block">
              <table className="w-full min-w-[1140px] table-fixed text-left">
                <thead className="border-b bg-muted/40">
                  <tr>
                    {[
                      "Guard / Position",
                      "Shift / Duty",
                      "Site",
                      "Schedule",
                      "Attendance",
                      "Operational Status",
                      "Coverage",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleRows.map((row) => {
                    const vacant = row.row_type === "unfilled_slots";
                    const missingGuard =
                      !vacant && row.guard?.is_missing;
                    return (
                      <tr
                        key={
                          vacant
                            ? `vacant-${row.duty_id}`
                            : `assignment-${row.assignment_id}`
                        }
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[175px] truncate text-sm font-medium">
                                {vacant
                                  ? `${row.unfilled_count ?? 0} Vacant Position(s)`
                                  : missingGuard
                                    ? "Guard record unavailable"
                                    : row.guard?.name || "Unnamed Guard"}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {vacant
                                  ? `Duty #${row.duty_id}`
                                  : row.guard?.code ||
                                    `Guard #${row.guard?.id ?? "—"}`}
                              </p>
                              {row.is_replaced && (
                                <span className="mt-1 block text-[11px] text-amber-700">
                                  Replaced
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-[200px] break-words text-sm font-medium">
                            {row.duty.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Duty #{row.duty_id}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {readable(row.duty.service_mode)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-[160px] truncate text-sm">
                            {row.duty.site_name || "—"}
                          </p>
                          <p className="mt-1 max-w-[160px] truncate text-xs text-muted-foreground">
                            {row.duty.site_location_name || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="whitespace-nowrap text-sm">
                            {dateTime(
                              row.duty.start_datetime,
                              row.duty.site_timezone
                            )}
                          </p>
                          <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                            to{" "}
                            {dateTime(
                              row.duty.end_datetime,
                              row.duty.site_timezone
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {vacant ? (
                            <span className="text-xs text-muted-foreground">
                              Not applicable
                            </span>
                          ) : (
                            <div className="space-y-2">
                              <StatusBadge
                                status={row.attendance_status}
                              />
                              {row.check_in_timing && (
                                <p className="text-xs text-muted-foreground">
                                  Check-in:{" "}
                                  {readable(
                                    row.check_in_timing.classification
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={row.operational_status} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={row.coverage.status} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {row.coverage.assigned}/
                            {row.coverage.required} assigned
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {row.assignment_id !== null ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetails(row)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Vacant
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="divide-y lg:hidden">
              {visibleRows.map((row) => {
                const vacant = row.row_type === "unfilled_slots";
                return (
                  <div
                    key={
                      vacant
                        ? `mobile-vacant-${row.duty_id}`
                        : `mobile-${row.assignment_id}`
                    }
                    className="space-y-3 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {vacant
                            ? `${row.unfilled_count ?? 0} Vacant Position(s)`
                            : row.guard?.is_missing
                              ? "Guard record unavailable"
                              : row.guard?.name || "Unnamed Guard"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {vacant
                            ? `Duty #${row.duty_id}`
                            : row.guard?.code || "No Guard Code"}
                        </p>
                      </div>
                      <StatusBadge status={row.operational_status} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {row.duty.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {row.duty.site_name || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Start</p>
                        <p className="mt-1 font-medium">
                          {dateTime(
                            row.duty.start_datetime,
                            row.duty.site_timezone
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End</p>
                        <p className="mt-1 font-medium">
                          {dateTime(
                            row.duty.end_datetime,
                            row.duty.site_timezone
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={row.coverage.status} />
                        {!vacant && (
                          <StatusBadge status={row.attendance_status} />
                        )}
                      </div>
                      {row.assignment_id !== null && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(row)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {lastPage} ·{" "}
            {totalRows.toLocaleString()} rows
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={perPage}
              onChange={(e) => {
                const next = Number(e.target.value);
                setFilters((previous) => ({
                  ...previous,
                  page: 1,
                  per_page: next,
                }));
              }}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || currentPage >= lastPage}
              onClick={() => changePage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      {/* Details dialog */}
      <Dialog
        open={selectedRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRow(null);
            setDetails(null);
            setDetailsError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[780px]">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              Assignment #{selectedRow?.assignment_id ?? "—"}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <StatusBadge status={selectedRow.operational_status} />
                <StatusBadge status={selectedRow.assignment_status} />
                <StatusBadge status={selectedRow.coverage.status} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailValue
                  label="Guard"
                  value={
                    selectedRow.guard?.is_missing
                      ? "Guard record unavailable"
                      : selectedRow.guard?.name
                  }
                />
                <DetailValue
                  label="Guard Code"
                  value={selectedRow.guard?.code}
                />
                <DetailValue
                  label="Duty"
                  value={selectedRow.duty.title}
                />
                <DetailValue
                  label="Site"
                  value={selectedRow.duty.site_name}
                />
                <DetailValue
                  label="Site Location"
                  value={selectedRow.duty.site_location_name}
                />
                <DetailValue
                  label="Service Mode"
                  value={readable(selectedRow.duty.service_mode)}
                />
                <DetailValue
                  label="Shift Start"
                  value={dateTime(
                    selectedRow.duty.start_datetime,
                    selectedRow.duty.site_timezone
                  )}
                />
                <DetailValue
                  label="Shift End"
                  value={dateTime(
                    selectedRow.duty.end_datetime,
                    selectedRow.duty.site_timezone
                  )}
                />
                <DetailValue
                  label="Check-In"
                  value={dateTime(
                    selectedRow.check_in_time,
                    selectedRow.duty.site_timezone
                  )}
                />
                <DetailValue
                  label="Check-Out"
                  value={dateTime(
                    selectedRow.check_out_time,
                    selectedRow.duty.site_timezone
                  )}
                />
                <DetailValue
                  label="Attendance"
                  value={readable(selectedRow.attendance_status)}
                />
                <DetailValue
                  label="Checkout Source"
                  value={readable(selectedRow.checkout_source)}
                />
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold">
                  Staffing & Coverage
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold">
                      {selectedRow.coverage.required}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Required
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {selectedRow.coverage.assigned}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assigned
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {selectedRow.coverage.attended ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Attended
                    </p>
                  </div>
                </div>
              </div>
              {detailsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading complete assignment details...
                </div>
              ) : detailsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {detailsError}
                </div>
              ) : details ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Full Operational Record
                  </h3>
                  {Object.entries(details).map(([key, value]) => (
                    <details
                      key={key}
                      className="rounded-lg border p-3"
                    >
                      <summary className="cursor-pointer text-sm font-medium">
                        {readable(key)}
                      </summary>
                      <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
