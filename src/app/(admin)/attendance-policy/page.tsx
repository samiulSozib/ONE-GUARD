"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Settings2 } from "lucide-react";
import AttendancePolicyPanel from "@/components/attendance-policy/attendance-policy-panel";
import AttendancePolicySaveBar from "@/components/attendance-policy/attendance-policy-save-bar";
import ScopeSelector, {
  type ScopeSelection,
} from "@/components/attendance-policy/scope-selector";
import {  useAppSelector } from "@/hooks/useAppSelector";
import { clearAllDrafts } from "@/store/slices/attendancePolicy.slice";
import SweetAlertService from "@/lib/sweetAlert";
import { useAppDispatch } from '@/hooks/useAppDispatch';

export default function AttendancePolicyPage() {
  const dispatch = useAppDispatch();
  const draftCount = useAppSelector(
    (s) => Object.keys(s.attendancePolicy.draftValues).length
  );

  const [scope, setScope] = useState<ScopeSelection>({
    scopeType: "global",
    scopeId: null,
  });

  const handleScopeChange = async (next: ScopeSelection) => {
    // ignore no-op (e.g. same scopeType but different id is allowed)
    if (
      next.scopeType === scope.scopeType &&
      next.scopeId === scope.scopeId
    ) return;

    // switching scope with drafts? confirm
    const isSameContext =
      next.scopeType === scope.scopeType && next.scopeId === scope.scopeId;
    const isSwitching = !isSameContext;
    if (isSwitching && draftCount > 0) {
      const r = await SweetAlertService.confirm(
        "Discard unsaved changes?",
        "Switching scope will discard your unsaved policy edits.",
        "Yes, switch",
        "Cancel"
      );
      if (!r.isConfirmed) return;
      dispatch(clearAllDrafts());
    }

    setScope(next);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        {/* Header + Two-step scope selector */}
        <div className="pt-6 px-4 md:px-6">
          <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 lg:p-4">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-[#5F0015]" />
              <span className="text-lg font-bold dark:text-white">
                Attendance Policy
              </span>
            </div>
            <ScopeSelector value={scope} onChange={handleScopeChange} />
          </Card>
        </div>

        {/* Panel */}
        <div className="py-2 px-4 md:px-6">
          <AttendancePolicyPanel
            scopeType={scope.scopeType}
            scopeId={scope.scopeId}
          />
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-0 z-20">
          <AttendancePolicySaveBar />
        </div>
      </div>
    </div>
  );
}
