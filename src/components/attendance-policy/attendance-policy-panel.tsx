"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShieldAlert, FileQuestion, MousePointerClick } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  fetchPolicyDefinitions,
  fetchPolicyScope,
  deletePolicyOverride,
  enableOverride,
  disableOverrideLocal,
  setDraftValue,
} from "@/store/slices/attendancePolicy.slice";
import type { PolicyScopeType, PolicyItem } from "@/app/types/attendancePolicy";
import PolicyControlRow from "./policy-control-row";
import {
  getSectionLabel,
  getSectionIcon,
  getSectionDescription,
} from "./section-config";
import SweetAlertService from "@/lib/sweetAlert";

interface Props {
  /** "global" | "site" | "site_location" | "duty" */
  scopeType: PolicyScopeType;
  /** Required when scopeType !== "global" */
  scopeId?: number | null;
  /** Optional heading shown above the panel */
  title?: string;
}

export default function AttendancePolicyPanel({
  scopeType,
  scopeId = null,
  title,
}: Props) {
  const dispatch = useAppDispatch();
  const {
    definitions,
    items,
    draftValues,
    overriddenKeys,
    fieldErrors,
    isLoading,
    deletingKey,
    error,
    notFound,
    forbidden,
  } = useAppSelector((s) => s.attendancePolicy);

  /* ---------- Load definitions once ---------- */
  useEffect(() => {
    if (!definitions.length) {
      dispatch(fetchPolicyDefinitions({ group: "attendance_policy" }));
    }
  }, [dispatch, definitions.length]);

  /* ---------- Load the active scope ---------- */
  useEffect(() => {
    // Global is always valid; scoped needs a real id
    if (scopeType !== "global" && !scopeId) return;

    dispatch(
      fetchPolicyScope({ scopeType, scopeId, group: "attendance_policy" })
    );
  }, [dispatch, scopeType, scopeId]);

  /* ---------- Group items by exact `section` value (spec §7.2) ---------- */
  const groupedSections = useMemo(() => {
    const map = new Map<string, PolicyItem[]>();
    for (const item of items) {
      const arr = map.get(item.section) ?? [];
      arr.push(item);
      map.set(item.section, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  /* ---------- Enable override: initialize with inherited_value (spec §7.6) ---------- */
  const handleEnableOverride = (item: PolicyItem) => {
    dispatch(
      enableOverride({
        key: item.key,
        inheritedValue: item.inherited_value ?? item.effective_value,
      })
    );
  };

  /* ---------- Disable override: DELETE then re-fetch (spec §4.5 + §7.6) ---------- */
  const handleDisableOverride = async (item: PolicyItem) => {
    if (scopeType === "global" || scopeId == null) return;

    // Not yet persisted → clear local draft only
    if (!item.has_override && overriddenKeys[item.key]) {
      dispatch(disableOverrideLocal(item.key));
      return;
    }

    const confirm = await SweetAlertService.confirm(
      "Disable Override?",
      "This field will inherit from its parent scope again. Continue?",
      "Yes, disable",
      "Cancel"
    );
    if (!confirm.isConfirmed) return;

    const result = await dispatch(
      deletePolicyOverride({ scopeType, scopeId, key: item.key })
    );

    if (deletePolicyOverride.fulfilled.match(result)) {
      dispatch(disableOverrideLocal(item.key));
      // Re-fetch so inherited/effective values are correct
      await dispatch(
        fetchPolicyScope({ scopeType, scopeId, group: "attendance_policy" })
      );
      SweetAlertService.success(
        "Override Removed",
        "Field now inherits from parent.",
        { timer: 1600 }
      );
    } else {
      const payload = result.payload as { message?: string } | undefined;
      SweetAlertService.error(
        "Reset Failed",
        payload?.message ?? "Failed to remove override"
      );
    }
  };

  const handleChange = (item: PolicyItem, v: unknown) => {
    dispatch(setDraftValue({ key: item.key, value: v }));
  };

  /* ==========================================================
     Render guards (spec §7.12)
     ========================================================== */

  // 1) Scoped type but no entity picked yet
  if (scopeType !== "global" && !scopeId) {
    const entityName =
      scopeType === "site_location"
        ? "site location"
        : scopeType === "site"
        ? "site"
        : "duty";

    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-10 flex flex-col items-center justify-center gap-3 text-gray-500">
          <MousePointerClick className="h-6 w-6 text-gray-400" />
          <p className="text-sm">
            Pick a {entityName} from the dropdown above to edit its policy
            overrides.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 2) Forbidden (401/403)
  if (forbidden) {
    return (
      <Card className="shadow-sm rounded-2xl border-rose-200">
        <CardContent className="p-8 flex items-center gap-3 text-rose-600">
          <ShieldAlert className="h-5 w-5" />
          <span>You don&apos;t have permission to view this policy scope.</span>
        </CardContent>
      </Card>
    );
  }

  // 3) Not found (404)
  if (notFound) {
    return (
      <Card className="shadow-sm rounded-2xl border-amber-200">
        <CardContent className="p-8 flex items-center gap-3 text-amber-600">
          <FileQuestion className="h-5 w-5" />
          <span>The requested scope was not found. Verify the ID.</span>
        </CardContent>
      </Card>
    );
  }

  // 4) Loading skeleton (first load only — subsequent loads keep prior content)
  if (isLoading && items.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b pb-4"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // 5) Fatal error with no content
  if (error && items.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl border-rose-200">
        <CardContent className="p-6 flex items-center gap-3 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  /* ==========================================================
     Main render
     ========================================================== */
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-1">
          {title}
        </h2>
      )}

      {groupedSections.map(([section, sectionItems]) => (
        <Card
          key={section}
          className="shadow-sm rounded-2xl border-0 overflow-hidden"
        >
          <div className="bg-[#F4F6F8] dark:bg-gray-800/60 px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getSectionIcon(section)}</span>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {getSectionLabel(section)}
              </h3>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-2">
                {getSectionDescription(section)}
              </span>
            </div>
          </div>

          <CardContent className="p-0">
            {sectionItems.map((item) => (
              <PolicyControlRow
                key={item.key}
                item={item}
                draftValue={draftValues[item.key]}
                hasDraft={item.key in draftValues}
                overrideEnabled={!!overriddenKeys[item.key]}
                fieldErrors={fieldErrors[item.key] ?? []}
                isDeleting={deletingKey === item.key}
                onChange={(v) => handleChange(item, v)}
                onEnableOverride={() => handleEnableOverride(item)}
                onDisableOverride={() => handleDisableOverride(item)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {groupedSections.length === 0 && !isLoading && (
        <Card className="shadow-sm rounded-2xl">
          <CardContent className="p-12 text-center text-gray-500">
            No policy definitions found for this scope.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
