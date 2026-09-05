// app/scheduling-settings/page.tsx

"use client";

import { GenerationMode, UpdateSchedulingSettingsDto } from '@/app/types/scheduling';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from '@/hooks/useAppSelector';
import SweetAlertService from "@/lib/sweetAlert";
import {
  fetchSchedulingSettings,
  updateSchedulingSettings,
} from "@/store/slices/schedulingSlice";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  RefreshCw,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SchedulingSettingsPage() {
  const dispatch = useAppDispatch();
  const { settings, isLoading } = useAppSelector((state) => state.scheduling.settings);
  const [isSaving, setIsSaving] = useState(false);

  // Local form state
  const [formData, setFormData] = useState<UpdateSchedulingSettingsDto>({
    duty_generation_mode: "rolling" as GenerationMode,
    duty_generation_horizon_days: 1,
    assignment_generation_mode: "rolling" as GenerationMode,
    assignment_generation_horizon_days: 1,
    generate_duties_on_schedule_create: true,
    generate_assignments_on_plan_create: true,
    allow_manual_duty_generation: true,
    allow_manual_assignment_generation: true,
    prevent_duty_duplicates: true,
    prevent_assignment_duplicates: true,
    open_ended_duty_horizon_days: 30,
    open_ended_assignment_horizon_days: 14,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchSchedulingSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        duty_generation_mode: settings.duty_generation_mode || ("rolling" as GenerationMode),
        duty_generation_horizon_days: settings.duty_generation_horizon_days || 1,
        assignment_generation_mode: settings.assignment_generation_mode || ("rolling" as GenerationMode),
        assignment_generation_horizon_days: settings.assignment_generation_horizon_days || 1,
        generate_duties_on_schedule_create: settings.generate_duties_on_schedule_create ?? true,
        generate_assignments_on_plan_create: settings.generate_assignments_on_plan_create ?? true,
        allow_manual_duty_generation: settings.allow_manual_duty_generation ?? true,
        allow_manual_assignment_generation: settings.allow_manual_assignment_generation ?? true,
        prevent_duty_duplicates: settings.prevent_duty_duplicates ?? true,
        prevent_assignment_duplicates: settings.prevent_assignment_duplicates ?? true,
        open_ended_duty_horizon_days: settings.open_ended_duty_horizon_days || 30,
        open_ended_assignment_horizon_days: settings.open_ended_assignment_horizon_days || 14,
        is_active: settings.is_active ?? true,
      });
    }
  }, [settings]);

  const handleChange = <K extends keyof UpdateSchedulingSettingsDto>(field: K, value: UpdateSchedulingSettingsDto[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const result = await dispatch(updateSchedulingSettings(formData)).unwrap();

      SweetAlertService.success(
        "Settings Updated",
        "Scheduling settings have been updated successfully."
      );

      // Refresh data
      dispatch(fetchSchedulingSettings());
    } catch (error: any) {
      SweetAlertService.error(
        "Update Failed",
        error?.message || "Failed to update scheduling settings. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        duty_generation_mode: settings.duty_generation_mode || ("rolling" as GenerationMode),
        duty_generation_horizon_days: settings.duty_generation_horizon_days || 1,
        assignment_generation_mode: settings.assignment_generation_mode || ("rolling" as GenerationMode),
        assignment_generation_horizon_days: settings.assignment_generation_horizon_days || 1,
        generate_duties_on_schedule_create: settings.generate_duties_on_schedule_create ?? true,
        generate_assignments_on_plan_create: settings.generate_assignments_on_plan_create ?? true,
        allow_manual_duty_generation: settings.allow_manual_duty_generation ?? true,
        allow_manual_assignment_generation: settings.allow_manual_assignment_generation ?? true,
        prevent_duty_duplicates: settings.prevent_duty_duplicates ?? true,
        prevent_assignment_duplicates: settings.prevent_assignment_duplicates ?? true,
        open_ended_duty_horizon_days: settings.open_ended_duty_horizon_days || 30,
        open_ended_assignment_horizon_days: settings.open_ended_assignment_horizon_days || 14,
        is_active: settings.is_active ?? true,
      });
      SweetAlertService.info("Reset", "Settings have been reset to saved values.");
    }
  };

  if (isLoading) {
    return <SchedulingSettingsSkeleton />;
  }

  const generationModes = [
    { value: "immediate", label: "Immediate", description: "Generate all possible records immediately" },
    { value: "rolling", label: "Rolling", description: "Automatically keep records generated ahead based on horizon" },
    { value: "manual", label: "Manual", description: "No automatic generation" },
  ];

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-4 h-full">
        <div className="pt-4 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Scheduling Settings</h1>
              <p className="text-muted-foreground text-sm">
                Configure duty and assignment automation rules
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duty Generation Settings */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Duty Generation
                </CardTitle>
                <CardDescription>
                  Control how duties are automatically generated from schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Mode */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generation Mode</Label>
                  <Select
                    value={formData.duty_generation_mode}
                    onValueChange={(value) => handleChange("duty_generation_mode", value as GenerationMode)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {generationModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div className="flex flex-col">
                            <span>{mode.label}</span>
                            <span className="text-xs text-muted-foreground">{mode.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Horizon Days */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generation Horizon (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.duty_generation_horizon_days}
                    onChange={(e) => handleChange("duty_generation_horizon_days", parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days ahead to generate duties
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-generate on Schedule Create</Label>
                      <p className="text-xs text-muted-foreground">
                        Generate duties immediately when a schedule is created
                      </p>
                    </div>
                    <Switch
                      checked={formData.generate_duties_on_schedule_create}
                      onCheckedChange={(checked) => handleChange("generate_duties_on_schedule_create", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Manual Generation</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow manual duty generation from the admin panel
                      </p>
                    </div>
                    <Switch
                      checked={formData.allow_manual_duty_generation}
                      onCheckedChange={(checked) => handleChange("allow_manual_duty_generation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Prevent Duplicates</Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent duplicate duty creation
                      </p>
                    </div>
                    <Switch
                      checked={formData.prevent_duty_duplicates}
                      onCheckedChange={(checked) => handleChange("prevent_duty_duplicates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Open-ended Horizon (Days)</Label>
                      <p className="text-xs text-muted-foreground">
                        Maximum days for open-ended duty generation
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.open_ended_duty_horizon_days}
                      onChange={(e) => handleChange("open_ended_duty_horizon_days", parseInt(e.target.value) || 30)}
                      className="w-24 text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Generation Settings */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Assignment Generation
                </CardTitle>
                <CardDescription>
                  Control how guard assignments are automatically generated from plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Mode */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generation Mode</Label>
                  <Select
                    value={formData.assignment_generation_mode}
                    onValueChange={(value) => handleChange("assignment_generation_mode", value as GenerationMode)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {generationModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div className="flex flex-col">
                            <span>{mode.label}</span>
                            <span className="text-xs text-muted-foreground">{mode.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Horizon Days */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generation Horizon (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.assignment_generation_horizon_days}
                    onChange={(e) => handleChange("assignment_generation_horizon_days", parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days ahead to generate assignments
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-generate on Plan Create</Label>
                      <p className="text-xs text-muted-foreground">
                        Generate assignments immediately when a plan is created
                      </p>
                    </div>
                    <Switch
                      checked={formData.generate_assignments_on_plan_create}
                      onCheckedChange={(checked) => handleChange("generate_assignments_on_plan_create", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Manual Generation</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow manual assignment generation from the admin panel
                      </p>
                    </div>
                    <Switch
                      checked={formData.allow_manual_assignment_generation}
                      onCheckedChange={(checked) => handleChange("allow_manual_assignment_generation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Prevent Duplicates</Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent duplicate assignment creation
                      </p>
                    </div>
                    <Switch
                      checked={formData.prevent_assignment_duplicates}
                      onCheckedChange={(checked) => handleChange("prevent_assignment_duplicates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Open-ended Horizon (Days)</Label>
                      <p className="text-xs text-muted-foreground">
                        Maximum days for open-ended assignment generation
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.open_ended_assignment_horizon_days}
                      onChange={(e) => handleChange("open_ended_assignment_horizon_days", parseInt(e.target.value) || 14)}
                      className="w-24 text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-gray-600" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Overall scheduling system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {formData.is_active ? (
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        System is {formData.is_active ? "Active" : "Inactive"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_active
                          ? "Scheduling automation is running"
                          : "Scheduling automation is paused"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleChange("is_active", checked)}
                    />
                    <Label className="text-sm font-medium">
                      {formData.is_active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Duty Mode</p>
                    <p className="font-medium capitalize">{formData.duty_generation_mode}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Assignment Mode</p>
                    <p className="font-medium capitalize">{formData.assignment_generation_mode}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Duty Horizon</p>
                    <p className="font-medium">{formData.duty_generation_horizon_days} days</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Assignment Horizon</p>
                    <p className="font-medium">{formData.assignment_generation_horizon_days} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function SchedulingSettingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-4 h-full">
        <div className="pt-4 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
