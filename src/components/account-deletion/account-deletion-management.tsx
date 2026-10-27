
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  accountDeletionService,
  type ApiRecord,
  type DeletionRequest,
  type DeletionListing,
} from "@/service/account-deletion.service";

const CONFIRMATION_TEXT = "DELETE ACCOUNT";

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#5F0015]/25";

function asRecord(value: unknown): ApiRecord | null {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as ApiRecord)
    : null;
}

function asText(value: unknown): string {
  return value === null ||
    value === undefined ||
    value === ""
    ? "—"
    : String(value);
}

function pretty(value: unknown): string {
  return asText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function timestamp(value: unknown): string {
  if (!value) return "—";

  const date = new Date(String(value));

  return Number.isNaN(date.getTime())
    ? asText(value)
    : date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function getError(error: unknown): string {
  const maybe = asRecord(error);
  const response = asRecord(maybe?.response);
  const data = asRecord(response?.data);
  const body = asRecord(data?.body);
  const errors = asRecord(data?.errors) ?? asRecord(body?.errors);

  const firstError = errors
    ? Object.values(errors)[0]
    : undefined;

  if (typeof firstError === "string") {
    return firstError;
  }

  if (
    Array.isArray(firstError) &&
    typeof firstError[0] === "string"
  ) {
    return firstError[0];
  }

  return asText(
    body?.message ??
      data?.message ??
      (error instanceof Error
        ? error.message
        : "Request failed")
  );
}

function stateClass(status: unknown): string {
  const s = String(status ?? "").toLowerCase();

  if (["completed", "approved"].includes(s)) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (
    ["pending", "processing", "in_progress"].includes(s)
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    ["rejected", "cancelled", "failed"].includes(s)
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-border bg-muted text-muted-foreground";
}

function displayAccount(row: DeletionRequest): string {
  const user = asRecord(row.user);
  const guard = asRecord(row.guard);
  const client = asRecord(row.client);

  return asText(
    row.full_name ??
      row.name ??
      user?.full_name ??
      guard?.full_name ??
      client?.company_name ??
      user?.email ??
      row.email ??
      `Request #${row.id}`
  );
}

function DetailsSection({
  title,
  value,
}: {
  title: string;
  value: ApiRecord | null;
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">
        {title}
      </h3>

      {value && Object.keys(value).length ? (
        <dl className="divide-y">
          {Object.entries(value).map(([key, entry]) => (
            <div
              key={key}
              className="flex flex-col gap-1 py-2 text-xs sm:flex-row sm:justify-between sm:gap-4"
            >
              <dt className="font-medium text-muted-foreground">
                {pretty(key)}
              </dt>

              <dd className="min-w-0 break-words sm:max-w-[65%] sm:text-right">
                {entry !== null &&
                typeof entry === "object" ? (
                  <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/40 p-2 text-left text-[11px]">
                    {JSON.stringify(entry, null, 2)}
                  </pre>
                ) : (
                  asText(entry)
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-muted-foreground">
          No information returned.
        </p>
      )}
    </section>
  );
}

export default function AccountDeletionManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    status: "",
    search: "",
    type: "",
  });

  const [draftSearch, setDraftSearch] = useState("");
  const [list, setList] = useState<DeletionListing | null>(null);
  const [stats, setStats] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const [selected, setSelected] =
    useState<DeletionRequest | null>(null);

  const [details, setDetails] =
    useState<ApiRecord | null>(null);

  const [impact, setImpact] =
    useState<ApiRecord | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    accountDeletionService
      .list(filters)
      .then((result) => {
        if (alive) setList(result);
      })
      .catch((e) => {
        if (alive) {
          setList(null);
          setError(getError(e));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [filters, refresh]);

  useEffect(() => {
    let alive = true;

    accountDeletionService
      .stats()
      .then((result) => {
        if (alive) setStats(result);
      })
      .catch(() => {
        if (alive) setStats(null);
      });

    return () => {
      alive = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!selected) return;

    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !actionLoading
      ) {
        setSelected(null);
        setConfirmOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [selected, actionLoading]);

  const openDetails = useCallback(
    async (row: DeletionRequest) => {
      setSelected(row);
      setDetails(null);
      setImpact(null);
      setDetailError(null);
      setDetailsLoading(true);
      setConfirmOpen(false);
      setConfirmation("");

      const [detailResponse, impactResponse] =
        await Promise.allSettled([
          accountDeletionService.details(row.id),
          accountDeletionService.impact(row.id),
        ]);

      setDetails(
        detailResponse.status === "fulfilled"
          ? detailResponse.value
          : null
      );

      setImpact(
        impactResponse.status === "fulfilled"
          ? impactResponse.value
          : null
      );

      if (
        detailResponse.status === "rejected" ||
        impactResponse.status === "rejected"
      ) {
        setDetailError(
          "Some request details could not be loaded. Deletion is disabled until the impact report is available."
        );
      }

      setDetailsLoading(false);
    },
    []
  );

  const complete = async () => {
    if (
      !selected ||
      confirmation !== CONFIRMATION_TEXT ||
      !impact ||
      actionLoading
    ) {
      return;
    }

    setActionLoading(true);
    setDetailError(null);

    try {
      await accountDeletionService.complete(
        selected.id,
        confirmation
      );

      setSelected(null);
      setConfirmOpen(false);
      setConfirmation("");
      setRefresh((n) => n + 1);
    } catch (e) {
      setConfirmOpen(false);
      setDetailError(getError(e));
    } finally {
      setActionLoading(false);
    }
  };

  const rows = list?.items ?? [];
  const page = list?.current_page ?? filters.page;
  const lastPage = Math.max(
    1,
    list?.last_page ?? 1
  );

  const impactRecord =
    asRecord(impact?.impact) ?? impact;

  const canComplete =
    Boolean(impact) &&
    impact?.can_complete !== false &&
    impactRecord?.can_complete !== false &&
    !detailsLoading &&
    !actionLoading &&
    String(selected?.status ?? "").toLowerCase() !==
      "completed";

  const statItems = stats
    ? Object.entries(stats)
        .filter(
          ([, value]) =>
            typeof value === "number" &&
            Number.isFinite(value)
        )
        .slice(0, 4)
    : [];

  const closeDetails = () => {
    if (actionLoading) return;

    setSelected(null);
    setConfirmOpen(false);
    setConfirmation("");
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-clip p-3 pt-5 sm:p-4 md:p-6">
      {/* Header */}
      <Card className="overflow-hidden p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#5F0015]/10 p-3">
              <ShieldAlert className="h-5 w-5 text-[#5F0015]" />
            </div>

            <div>
              <h1 className="text-base font-semibold">
                Account Deletion Requests
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Review Guard and Client requests,
                inspect account impact and complete
                approved deletions.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefresh((n) => n + 1)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      {statItems.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map(([key, value]) => (
            <Card key={key} className="p-4">
              <p className="text-xs text-muted-foreground">
                {pretty(key)}
              </p>

              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {Number(value).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            setFilters((f) => ({
              ...f,
              search: draftSearch.trim(),
              page: 1,
            }));
          }}
          className="grid gap-3 md:grid-cols-[1fr_170px_170px_auto]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

            <input
              aria-label="Search deletion requests"
              className={`${fieldClass} pl-9`}
              placeholder="Search requests..."
              value={draftSearch}
              onChange={(e) =>
                setDraftSearch(e.target.value)
              }
            />
          </div>

          <select
            aria-label="Status filter"
            className={fieldClass}
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            aria-label="Account type filter"
            className={fieldClass}
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                type: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All accounts</option>
            <option value="guard">Guard</option>
            <option value="client">Client</option>
          </select>

          <Button
            type="submit"
            className="bg-[#5F0015] text-white hover:bg-[#75001a]"
          >
            Search
          </Button>
        </form>
      </Card>

      {/* Requests table */}
      <Card className="min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <h2 className="text-sm font-semibold">
            Deletion Requests
          </h2>

          <span className="text-xs text-muted-foreground">
            {list?.total ?? 0} total
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading requests...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p className="text-sm">
              No deletion requests found.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  {[
                    "Request",
                    "Account",
                    "Type",
                    "Status",
                    "Requested",
                    "Email",
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className="whitespace-nowrap px-4 py-3 font-medium"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-semibold">
                      #{row.id}
                    </td>

                    <td className="max-w-[240px] truncate px-4 py-3">
                      {displayAccount(row)}
                    </td>

                    <td className="px-4 py-3">
                      {pretty(
                        row.account_type ??
                          row.type ??
                          (row.guard_id
                            ? "guard"
                            : row.client_id
                              ? "client"
                              : "unknown")
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${stateClass(
                          row.status
                        )}`}
                      >
                        {pretty(row.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {timestamp(
                        row.requested_at ??
                          row.created_at
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {pretty(row.email_status)}
                    </td>

                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void openDetails(row)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-xs text-muted-foreground">
          <span>
            Page {page} of {lastPage} ·{" "}
            {(list?.total ?? 0).toLocaleString()} requests
          </span>

          <div className="flex items-center gap-2">
            <select
              aria-label="Rows per page"
              className="h-9 rounded-md border bg-background px-2"
              value={filters.per_page}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  per_page: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              disabled={loading || page <= 1}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: page - 1,
                }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={loading || page >= lastPage}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: page + 1,
                }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Request details drawer */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDetails}
          />

          <aside
            className="relative flex h-[100dvh] w-full max-w-[740px] flex-col border-l bg-background shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Deletion request details"
          >
            <header className="flex items-center justify-between gap-3 border-b p-4 sm:p-5">
              <div>
                <h2 className="text-base font-bold">
                  Deletion Request #{selected.id}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {displayAccount(selected)} ·{" "}
                  {pretty(selected.status)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading}
                onClick={closeDetails}
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4 sm:p-5">
              {detailsLoading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading request and impact...
                </p>
              )}

              {detailError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {detailError}
                </p>
              )}

              <DetailsSection
                title="Request Information"
                value={
                  asRecord(details?.item) ?? details
                }
              />

              <DetailsSection
                title="Deletion Impact"
                value={impactRecord}
              />

              {impact && !canComplete && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Completion is unavailable for this
                  request or blocked by the backend.
                  Review the impact report.
                </p>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-card p-4">
              <p className="flex max-w-sm items-start gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Permanent deletion can affect account
                access and associated records. Inspect
                impact first.
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeDetails}
                  disabled={actionLoading}
                >
                  Close
                </Button>

                <Button
                  size="sm"
                  disabled={!canComplete}
                  className="bg-red-700 text-white hover:bg-red-800"
                  onClick={() => {
                    setConfirmation("");
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Complete Deletion
                </Button>
              </div>
            </footer>

            {/* Confirmation dialog */}
            {confirmOpen && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
                <div className="w-full max-w-md space-y-4 rounded-xl border bg-background p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />

                    <h3 className="font-semibold">
                      Confirm account deletion
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    This action calls the Admin completion
                    API for request #{selected.id}.
                    Review the impact report before
                    continuing. Enter{" "}
                    <strong>DELETE ACCOUNT</strong>{" "}
                    to confirm.
                  </p>

                  <input
                    aria-label="Type DELETE ACCOUNT to confirm"
                    className={fieldClass}
                    value={confirmation}
                    onChange={(e) =>
                      setConfirmation(e.target.value)
                    }
                    placeholder="DELETE ACCOUNT"
                    autoComplete="off"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      onClick={() =>
                        setConfirmOpen(false)
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      size="sm"
                      disabled={
                        confirmation !==
                          CONFIRMATION_TEXT ||
                        actionLoading
                      }
                      className="bg-red-700 text-white hover:bg-red-800"
                      onClick={() => void complete()}
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}

                      Confirm
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
