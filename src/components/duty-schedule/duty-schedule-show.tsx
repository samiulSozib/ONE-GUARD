// components/duty-schedule/duty-schedule-show.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState, useEffect } from 'react';
import Image from "next/image";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDutySchedule } from "@/store/slices/duty-schedule.slice";
import { DutySchedule } from "@/app/types/duty-schedule";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Building,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Repeat,
  MapPin,
  Package,
  User,
  CalendarDays
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DutyScheduleShowProps {
  trigger: ReactNode;
  id: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DutyScheduleShow({
  trigger,
  id,
  isOpen,
  onOpenChange
}: DutyScheduleShowProps) {
  const dispatch = useAppDispatch();
  const { currentItem, isLoading } = useAppSelector(
    (state) => state.dutySchedule
  );
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && id) {
      loadItem();
    }
  }, [isOpen, id]);

  const loadItem = async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      await dispatch(fetchDutySchedule(id));
    } catch (error) {
      console.error("Failed to load duty schedule:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const item = currentItem;

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      <Badge className={`${colors[status] || "bg-gray-100"} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get schedule type badge
  const getScheduleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      one_time: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      recurring: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return (
      <Badge className={`${colors[type] || "bg-gray-100"} border-0`}>
        {type === 'one_time' ? 'One Time' : 'Recurring'}
      </Badge>
    );
  };

  // Get recurrence display
  const getRecurrenceDisplay = (item: DutySchedule) => {
    if (item.schedule_type === 'one_time') return "One Time";
    if (!item.recurrence_frequency) return "N/A";

    let display = item.recurrence_frequency.charAt(0).toUpperCase() + item.recurrence_frequency.slice(1);
    if (item.recurrence_interval && item.recurrence_interval > 1) {
      display += ` (Every ${item.recurrence_interval} ${item.recurrence_frequency}s)`;
    }
    if (item.recurrence_days && item.recurrence_days.length > 0) {
      const dayLabels = item.recurrence_days.map(d => d.charAt(0).toUpperCase() + d.slice(1));
      display += ` - ${dayLabels.join(', ')}`;
    }
    return display;
  };

  // Loading skeleton
  if (isLoading || isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Duty Schedule Not Found
              </h3>
              <p className="text-gray-500">
                The duty schedule you're looking for could not be found.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-lg font-semibold mb-6 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span className="whitespace-nowrap">Duty Schedule Details</span>
          <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
            ID: #{item.id}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            item.is_active && item.status === 'active'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {item.is_active && item.status === 'active' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${
              item.is_active && item.status === 'active'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {item.is_active && item.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              Updated: {formatDate(item.updated_at)}
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Building className="h-4 w-4" />
                Site
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.site?.site_name || `Site #${item.site_id}`}
              </p>
              {item.site?.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.site.address}
                </p>
              )}
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.site_location?.title || "Not specified"}
              </p>
            </div>
          </div>

          {/* Schedule Type & Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                Schedule Type
              </div>
              <div className="flex items-center gap-2">
                {getScheduleTypeBadge(item.schedule_type)}
                {item.schedule_type === 'recurring' && (
                  <Repeat className="h-4 w-4 text-gray-500" />
                )}
              </div>
              {item.schedule_type === 'recurring' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getRecurrenceDisplay(item)}
                </p>
              )}
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                Time
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(item.start_time)} - {formatTime(item.end_time)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.required_hours} hours
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(item.start_date)}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                End Date
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.is_open_ended ? 'Open Ended' : formatDate(item.end_date)}
              </p>
            </div>
          </div>

          {/* Guards & Duties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Users className="h-4 w-4" />
                Guards Required
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.guards_required}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                Generated Duties
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.duties_count || 0}
              </p>
            </div>
          </div>

          {/* Contract Service */}
          {item.client_contract_service && (
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Package className="h-4 w-4" />
                Contract Service
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.client_contract_service?.name || "N/A"}
              </p>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.notes}
              </p>
            </div>
          )}

          {/* Creator & Updater */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            {item.creator && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4" />
                Created by: {item.creator.first_name} {item.creator.last_name}
                <span className="text-xs">({formatDate(item.created_at)})</span>
              </div>
            )}
            {item.updater && item.updater.id !== item.creator?.id && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4" />
                Updated by: {item.updater.first_name} {item.updater.last_name}
                <span className="text-xs">({formatDate(item.updated_at)})</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
