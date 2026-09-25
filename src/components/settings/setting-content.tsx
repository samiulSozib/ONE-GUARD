"use client";

import {
  FileIcon,
  Key,
  MessagesSquareIcon,
  QrCode,
  UserIcon,
  BellRing,
  ShieldCheck,
  Settings2,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchSettings,
  updateSettings,
  setSettingValue,
  clearSettingsError,
} from "@/store/slices/settingsSlice";
import SweetAlertService from "@/lib/sweetAlert";

import General from "./tabContents/general";
import TwilioSettings from "./tabContents/twilio-settings";
import TwoFactorAuthentication from "./tabContents/two-factor-authentication";
import ChangePassword from "./tabContents/chang-password";
import NotificationGroups from "@/components/settings/tabContents/notification-groups";
import AttendancePolicyGroup from "@/components/settings/tabContents/attendance-policy-group";

export default function SettingContent() {
  const dispatch = useAppDispatch();
  const {
    groups, values, isLoading, isSaving, error, lastSavedAt,
  } = useAppSelector((s) => s.settings);

  const [activeTab, setActiveTab] = useState("client-notifications");
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      SweetAlertService.error("Settings Error", error);
      dispatch(clearSettingsError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const clientGroup = useMemo(
    () => groups.find((g) => g.group === "client_notifications"),
    [groups]
  );
  const guardGroup = useMemo(
    () => groups.find((g) => g.group === "guard_notifications"),
    [groups]
  );
  const attendanceGroup = useMemo(
    () => groups.find((g) => g.group === "attendance_policy"),
    [groups]
  );

  const handleChange = (
    key: string,
    value: boolean | number | string | null | Record<string, unknown> | unknown[]
  ) => {
    dispatch(setSettingValue({ key, value }));
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    if (dirtyKeys.size === 0) {
      await SweetAlertService.info("No Changes", "Nothing to save.");
      return;
    }
    const delta: Record<string, any> = {};
    dirtyKeys.forEach((key) => {
      delta[key] = values[key];
    });
    const result = await dispatch(updateSettings({ settings: delta }));
    if (updateSettings.fulfilled.match(result)) {
      setDirtyKeys(new Set());
      await SweetAlertService.success("Saved", "Settings updated successfully.", {
        timer: 1800,
      });
    }
  };

  const handleReset = async () => {
    setDirtyKeys(new Set());
    await dispatch(fetchSettings());
  };

  const tabs = [
    {
      value: "client-notifications",
      label: "Client Notifications",
      icon: <BellRing className="h-4 w-4" />,
      shortLabel: "Client",
      badge: clientGroup?.items.length,
    },
    {
      value: "guard-notifications",
      label: "Guard Notifications",
      icon: <ShieldCheck className="h-4 w-4" />,
      shortLabel: "Guard",
      badge: guardGroup?.items.length,
    },
    {
      value: "attendance-policy",
      label: "Attendance Policy",
      icon: <Settings2 className="h-4 w-4" />,
      shortLabel: "Policy",
      badge: attendanceGroup?.items.length,
    },
  ];

  const showSaveBar = dirtyKeys.size > 0 && !isLoading;

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full border-b">
          <div className="flex justify-start">
            <div className="overflow-x-auto no-scrollbar w-full">
              <TabsList className="flex items-center gap-1 px-2 sm:px-4 py-2 sm:py-3 h-auto bg-transparent w-full">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-none transition-all border-b-2 flex-shrink-0",
                      "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      "data-[state=active]:text-green-600 data-[state=active]:border-b-green-600 data-[state=active]:bg-green-50",
                      "text-gray-600 border-transparent hover:text-green-600 hover:border-green-600"
                    )}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {typeof tab.badge === "number" && tab.badge > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 px-1.5 text-[10px]"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>

        <div className="py-4">
          {/* Client Notifications */}
          <TabsContent value="client-notifications" className="m-0">
            {isLoading ? (
              <LoadingState label="Loading client notifications…" />
            ) : clientGroup ? (
              <NotificationGroups
                groups={[clientGroup]}
                values={values}
                onChange={handleChange}
                disabled={isSaving}
              />
            ) : (
              <EmptyState label="No client notification settings found." />
            )}
          </TabsContent>

          {/* Guard Notifications */}
          <TabsContent value="guard-notifications" className="m-0">
            {isLoading ? (
              <LoadingState label="Loading guard notifications…" />
            ) : guardGroup ? (
              <NotificationGroups
                groups={[guardGroup]}
                values={values}
                onChange={handleChange}
                disabled={isSaving}
              />
            ) : (
              <EmptyState label="No guard notification settings found." />
            )}
          </TabsContent>

          {/* Attendance Policy */}
          <TabsContent value="attendance-policy" className="m-0">
            {isLoading ? (
              <LoadingState label="Loading attendance policy…" />
            ) : attendanceGroup ? (
              <AttendancePolicyGroup
                group={attendanceGroup}
                values={values}
                onChange={handleChange}
                disabled={isSaving}
              />
            ) : (
              <EmptyState label="No attendance policy settings found." />
            )}
          </TabsContent>
        </div>
      </Tabs>

      {showSaveBar && (
        <div className="sticky bottom-0 z-30 mt-6">
          <div className="mx-auto max-w-3xl px-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg px-4 py-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{dirtyKeys.size}</span>{" "}
                unsaved {dirtyKeys.size === 1 ? "change" : "changes"}
                {lastSavedAt && (
                  <span className="ml-2 text-xs text-gray-400">
                    · Last saved {new Date(lastSavedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      {label}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <BellRing className="h-10 w-10 mx-auto mb-3 text-gray-300" />
      <p>{label}</p>
    </div>
  );
}
