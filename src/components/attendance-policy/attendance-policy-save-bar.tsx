"use client";

import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";
import {  useAppSelector } from "@/hooks/useAppSelector";
import {
  clearAllDrafts,
  fetchPolicyScope,
  updatePolicyScope,
} from "@/store/slices/attendancePolicy.slice";
import SweetAlertService from "@/lib/sweetAlert";
import { useAppDispatch } from '@/hooks/useAppDispatch';

export default function AttendancePolicySaveBar() {
  const dispatch = useAppDispatch();
  const { activeScopeType, activeScopeId, draftValues, isSaving } =
    useAppSelector((s) => s.attendancePolicy);
  const dirty = Object.keys(draftValues).length;

  const save = async () => {
    if (!dirty) return SweetAlertService.warning("No Changes", "Edit a field first.");
    const r = await dispatch(updatePolicyScope({
      scopeType: activeScopeType,
      scopeId: activeScopeId,
      settings: draftValues,
    }));
    if (updatePolicyScope.fulfilled.match(r)) {
      SweetAlertService.success("Policy Saved", "Attendance policy updated.");
    } else {
      SweetAlertService.error("Save Failed", (r.payload as any)?.message ?? "Unknown error");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 bg-white/70 dark:bg-gray-900/50 backdrop-blur">
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {dirty > 0 ? `${dirty} unsaved change(s)` : "No unsaved changes"}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm"
          onClick={() => dispatch(fetchPolicyScope({ scopeType: activeScopeType, scopeId: activeScopeId }))}
          disabled={isSaving}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
        {dirty > 0 && (
          <Button variant="outline" size="sm"
            onClick={() => SweetAlertService.confirm("Discard?", "Unsaved edits will be lost.", "Yes", "No")
              .then((r) => r.isConfirmed && dispatch(clearAllDrafts()))}
            disabled={isSaving}>
            Discard
          </Button>
        )}
        <Button size="sm" onClick={save} disabled={isSaving || dirty === 0}
          className="bg-[#5F0015] hover:bg-[#7a0019] text-white">
          <Save className="h-3.5 w-3.5 mr-1" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
