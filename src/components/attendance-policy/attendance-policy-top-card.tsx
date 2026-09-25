"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Settings2 } from "lucide-react";
import {  useAppSelector } from "@/hooks/useAppSelector";
import {
  clearAllDrafts,
  fetchPolicyScope,
  updatePolicyScope,
} from "@/store/slices/attendancePolicy.slice";
import SweetAlertService from "@/lib/sweetAlert";
import { useAppDispatch } from '@/hooks/useAppDispatch';

export default function AttendancePolicyTopCard() {
  const dispatch = useAppDispatch();
  const { activeScopeType, activeScopeId, draftValues, isSaving } = useAppSelector(
    (s) => s.attendancePolicy
  );
  const dirtyCount = Object.keys(draftValues).length;

  const handleSave = async () => {
    if (dirtyCount === 0) {
      SweetAlertService.warning("No Changes", "Edit a field first.");
      return;
    }
    const result = await dispatch(
      updatePolicyScope({
        scopeType: activeScopeType,
        scopeId: activeScopeId,
        settings: draftValues,
      })
    );
    if (updatePolicyScope.fulfilled.match(result)) {
      SweetAlertService.success("Policy Saved", "Attendance policy updated.");
    } else {
      SweetAlertService.error("Save Failed", (result.payload as any)?.message ?? "Unknown error");
    }
  };

  const handleRefresh = () =>
    dispatch(fetchPolicyScope({ scopeType: activeScopeType, scopeId: activeScopeId }));

  const handleDiscard = () => {
    if (dirtyCount === 0) return;
    SweetAlertService.confirm("Discard Changes?", "Unsaved edits will be lost.", "Yes", "No").then(
      (r) => r.isConfirmed && dispatch(clearAllDrafts())
    );
  };

  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4">
      <div className="flex items-center gap-3">
        <Settings2 className="h-5 w-5 text-[#5F0015]" />
        <span className="text-lg font-bold dark:text-white">Attendance Policy</span>
        {dirtyCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {dirtyCount} unsaved
          </span>
        )}
      </div>

      <div className="flex flex-row gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isSaving}
          className="flex-1 md:flex-initial justify-center text-xs sm:text-sm"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Refresh
        </Button>
        {dirtyCount > 0 && (
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex-1 md:flex-initial justify-center text-xs sm:text-sm"
          >
            Discard
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving || dirtyCount === 0}
          className="flex-1 md:flex-initial justify-center text-xs sm:text-sm bg-[#5F0015] hover:bg-[#7a0019] text-white"
        >
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}
