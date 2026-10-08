"use client";
import React, {
  useEffect,
  useState,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import type {
  AppDispatch,
  RootState,
} from "@/store/store";
import type {
  ReplaceTelegramScopesDto,
  TelegramChat,
  TelegramScopeInput,
} from "@/app/types/telegram";
import {
  fetchTelegramChat,
  fetchTelegramChats,
  fetchTelegramOverview,
  replaceTelegramScopes,
} from "@/store/slices/telegramSlice";
import { fetchSites } from "@/store/slices/siteSlice";
import { fetchClients } from "@/store/slices/clientSlice";
import type { Site } from "@/app/types/site";
import type { Client } from "@/app/types/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableDropdownWithIcon } from "@/components/ui/searchable-dropdown-with-icon";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
interface TelegramGroupScopesProps {
  open: boolean;
  onOpenChange: (
    open: boolean
  ) => void;
  chat: TelegramChat | null;
}
interface EditableScope {
  key: string;
  scope_type: "client" | "site";
  scope_id: string;
  include_children: boolean;
  is_active: boolean;
}
let scopeKeyCounter = 0;
const createScopeKey = () => {
  scopeKeyCounter += 1;
  return `scope-${scopeKeyCounter}`;
};
const createEmptyScope =
  (): EditableScope => ({
    key: createScopeKey(),
    scope_type: "site",
    scope_id: "",
    include_children: true,
    is_active: true,
  });
const getSiteName = (site: Site) =>
  site.site_name ||
  ("title" in site ? String(site.title ?? "") : "") ||
  `Site ${site.id}`;
const getClientName = (client: Client) =>
  client.full_name ||
  ("company_name" in client
    ? String(client.company_name ?? "")
    : "") ||
  `Client ${client.id}`;
const TelegramGroupScopes = ({
  open,
  onOpenChange,
  chat,
}: TelegramGroupScopesProps) => {
  const dispatch =
    useDispatch<AppDispatch>();
  const {
    scopes,
  } = useSelector(
    (state: RootState) =>
      state.telegram
  );
  const {
    sites,
    isLoading: sitesLoading,
  } = useSelector(
    (state: RootState) => state.site
  );
  const {
    clients,
    isLoading: clientsLoading,
  } = useSelector(
    (state: RootState) => state.client
  );
  const [siteSearch, setSiteSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [
    rows,
    setRows,
  ] = useState<EditableScope[]>(
    []
  );
  const [
    isSaving,
    setIsSaving,
  ] = useState(false);
  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );
  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null
    );
  useEffect(() => {
    if (!open) {
      return;
    }
    dispatch(fetchSites({ page: 1, per_page: 100 }));
    dispatch(fetchClients({ page: 1, per_page: 100 }));
  }, [dispatch, open]);
  useEffect(() => {
    if (!open) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    const sourceScopes =
      chat?.scopes ??
      scopes;
    setRows(
      sourceScopes.map(
        (scope) => ({
          key: createScopeKey(),
          scope_type:
            scope.scope_type ===
              "client"
              ? "client"
              : "site",
          scope_id:
            scope.scope_id ===
              null ||
              scope.scope_id ===
              undefined
              ? ""
              : String(
                scope.scope_id
              ),
          include_children:
            scope.include_children ??
            false,
          is_active:
            scope.is_active ??
            true,
        })
      )
    );
  }, [
    open,
    chat,
    scopes,
  ]);
  const addScope = () => {
    setRows(
      (previous) => [
        ...previous,
        createEmptyScope(),
      ]
    );
  };
  const removeScope = (
    key: string
  ) => {
    setRows(
      (previous) =>
        previous.filter(
          (row) =>
            row.key !== key
        )
    );
  };
  const updateScope = <
    K extends keyof Omit<
      EditableScope,
      "key"
    >
  >(
    key: string,
    field: K,
    value: EditableScope[K]
  ) => {
    setRows(
      (previous) =>
        previous.map(
          (row) =>
            row.key === key
              ? {
                ...row,
                [field]:
                  value,
              }
              : row
        )
    );
    if (error) {
      setError(null);
    }
  };
  const validateScopes =
    () => {
      for (
        let index = 0;
        index <
        rows.length;
        index += 1
      ) {
        const row =
          rows[index];
        if (
          !row.scope_id.trim()
        ) {
          return `Scope ${index + 1
            }: please select a scope.`;
        }
        const numericId =
          Number(
            row.scope_id
          );
        if (
          !Number.isInteger(
            numericId
          ) ||
          numericId <= 0
        ) {
          return `Scope ${index + 1
            }: selected scope has an invalid ID.`;
        }
      }
      return null;
    };
  const refreshGroup =
    async (
      chatId: number
    ) => {
      await Promise.all([
        dispatch(
          fetchTelegramChat(
            chatId
          )
        ),
        dispatch(
          fetchTelegramChats({
            page: 1,
            per_page: 20,
          })
        ),
        dispatch(
          fetchTelegramOverview()
        ),
      ]);
    };
  const handleSave =
    async () => {
      if (!chat?.id) {
        setError(
          "Telegram group is unavailable."
        );
        return;
      }
      if (chat.is_active) {
        setError(
          "Deactivate this Telegram group before replacing its scopes."
        );
        return;
      }
      const validationError =
        validateScopes();
      if (validationError) {
        setError(
          validationError
        );
        return;
      }
      const scopeItems: TelegramScopeInput[] =
        rows.map(
          (row) => ({
            scope_type:
              row.scope_type,
            scope_id:
              Number(
                row.scope_id
              ),
            include_children:
              row.include_children,
            is_active:
              row.is_active,
          })
        );
      const payload: ReplaceTelegramScopesDto =
      {
        scopes:
          scopeItems,
      };
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await dispatch(
          replaceTelegramScopes({
            chatId:
              chat.id,
            data:
              payload,
          })
        ).unwrap();
        await refreshGroup(
          chat.id
        );
        setSuccessMessage(
          "Telegram scopes updated successfully."
        );
      } catch (
      saveError: unknown
      ) {
        if (
          saveError instanceof
          Error
        ) {
          setError(
            saveError.message
          );
        } else if (
          typeof saveError ===
          "string"
        ) {
          setError(
            saveError
          );
        } else {
          setError(
            "Failed to update Telegram scopes."
          );
        }
      } finally {
        setIsSaving(false);
      }
    };
  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (isSaving) {
      return;
    }
    onOpenChange(
      nextOpen
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>
                Manage Notification
                Scopes
              </DialogTitle>
              <DialogDescription className="mt-1">
                Replace the
                notification scopes
                configured for{" "}
                <span className="font-medium">
                  {chat?.title ??
                    "this Telegram group"}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5 py-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">
                  Replacement
                  operation
                </p>
                <p className="mt-1 text-xs">
                  Saving this form
                  replaces the
                  complete scope
                  configuration for
                  this group.
                </p>
              </div>
            </div>
          </div>
          {chat?.is_active && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              This group is active.
              Deactivate it before
              changing its scopes.
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold">
                Scopes
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Supported scope
                types are client and
                site.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                isSaving ||
                chat?.is_active
              }
              onClick={addScope}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Scope
            </Button>
          </div>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Shield className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                No scopes
                configured
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a client or
                site scope, or save
                the empty list if
                you intend to
                remove all scopes.
              </p>
              {!chat?.is_active && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={
                    addScope
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scope
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map(
                (
                  row,
                  index
                ) => (
                  <div
                    key={
                      row.key
                    }
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">
                        Scope{" "}
                        {index +
                          1}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={
                          isSaving ||
                          chat?.is_active
                        }
                        onClick={() =>
                          removeScope(
                            row.key
                          )
                        }
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>
                          Scope Type
                        </Label>
                        <select
                          value={
                            row.scope_type
                          }
                          disabled={
                            isSaving ||
                            chat?.is_active
                          }
                          onChange={(
                            event
                          ) => {
                            const nextType =
                              event.target.value as
                              | "client"
                              | "site";
                            setRows((previous) =>
                              previous.map((scopeRow) =>
                                scopeRow.key === row.key
                                  ? {
                                    ...scopeRow,
                                    scope_type: nextType,
                                    scope_id: "",
                                  }
                                  : scopeRow
                              )
                            );
                            setError(null);
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="site">
                            Site
                          </option>
                          <option value="client">
                            Client
                          </option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>
                          {row.scope_type === "site"
                            ? "Site"
                            : "Client"}
                        </Label>
                        {row.scope_type === "site" ? (
                          <SearchableDropdownWithIcon
                            value={row.scope_id}
                            onValueChange={(value) =>
                              updateScope(
                                row.key,
                                "scope_id",
                                String(value)
                              )
                            }
                            options={sites.map((site: Site) => ({
                              value: site.id,
                              label: `#${site.id} — ${getSiteName(site)}`,
                              ...site,
                            }))}
                            onSearch={(search) => {
                              setSiteSearch(search);
                              dispatch(
                                fetchSites({
                                  page: 1,
                                  per_page: 20,
                                  search,
                                })
                              );
                            }}
                            placeholder="Select site"
                            disabled={
                              isSaving ||
                              Boolean(chat?.is_active) ||
                              sitesLoading
                            }
                            isLoading={sitesLoading}
                            emptyMessage={
                              siteSearch
                                ? "No sites found"
                                : "No sites available"
                            }
                            searchPlaceholder="Search sites by name..."
                            icon={Building}
                            iconPosition="left"
                            displayValue={(value, options) => {
                              if (!value) return "Select site";
                              const option = options.find(
                                (item) =>
                                  String(item.value) === String(value)
                              );
                              return option?.label || `Site ID #${value}`;
                            }}
                          />
                        ) : (
                          <SearchableDropdownWithIcon
                            value={row.scope_id}
                            onValueChange={(value) =>
                              updateScope(
                                row.key,
                                "scope_id",
                                String(value)
                              )
                            }
                            options={clients.map((client: Client) => ({
                              value: client.id,
                              label: `#${client.id} — ${getClientName(client)}`,
                              ...client,
                            }))}
                            onSearch={(search) => {
                              setClientSearch(search);
                              dispatch(
                                fetchClients({
                                  page: 1,
                                  per_page: 20,
                                  search,
                                })
                              );
                            }}
                            placeholder="Select client"
                            disabled={
                              isSaving ||
                              Boolean(chat?.is_active) ||
                              clientsLoading
                            }
                            isLoading={clientsLoading}
                            emptyMessage={
                              clientSearch
                                ? "No clients found"
                                : "No clients available"
                            }
                            searchPlaceholder="Search clients by name..."
                            icon={Users}
                            iconPosition="left"
                            displayValue={(value, options) => {
                              if (!value) return "Select client";
                              const option = options.find(
                                (item) =>
                                  String(item.value) === String(value)
                              );
                              return option?.label || `Client ID #${value}`;
                            }}
                          />
                        )}
                        {row.scope_id && (
                          <p className="text-xs text-muted-foreground">
                            Selected {row.scope_type} ID:{" "}
                            <span className="font-semibold text-foreground">
                              #{row.scope_id}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ToggleRow
                        label="Include Children"
                        description="Include child records under this scope."
                        checked={
                          row.include_children
                        }
                        disabled={
                          isSaving ||
                          Boolean(
                            chat?.is_active
                          )
                        }
                        onChange={(
                          value
                        ) =>
                          updateScope(
                            row.key,
                            "include_children",
                            value
                          )
                        }
                      />
                      <ToggleRow
                        label="Active Scope"
                        description="Enable this scope for routing."
                        checked={
                          row.is_active
                        }
                        disabled={
                          isSaving ||
                          Boolean(
                            chat?.is_active
                          )
                        }
                        onChange={(
                          value
                        ) =>
                          updateScope(
                            row.key,
                            "is_active",
                            value
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {error}
              </span>
            </div>
          )}
          {successMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {
                  successMessage
                }
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              isSaving
            }
            onClick={() =>
              onOpenChange(
                false
              )
            }
          >
            Close
          </Button>
          <Button
            type="button"
            disabled={
              isSaving ||
              !chat ||
              chat.is_active
            }
            onClick={() =>
              void handleSave()
            }
            className="bg-[#5F0015] text-white hover:bg-[#75001a]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Scopes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (
    checked: boolean
  ) => void;
}
const ToggleRow = ({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">
          {label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={
          checked
        }
        disabled={
          disabled
        }
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked
          ? "bg-[#5F0015]"
          : "bg-muted-foreground/30"
          }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${checked
            ? "translate-x-5"
            : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
};
export default TelegramGroupScopes;
