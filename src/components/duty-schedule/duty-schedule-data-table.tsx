// components/duty-schedule/duty-schedule-data-table.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import {
  EllipsisVertical,
  Search,
  Pencil,
  Trash2,
  ListFilter,
  File,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Building,
  Users,
  Repeat,
  Eye,
  Timer,
  Globe,
  Shield,
  DownloadIcon,
  MapPin,
  User,
  AlertCircle,
  CheckCheck,
  Target,
} from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchDutySchedules,
  deleteDutySchedule,
  toggleDutyScheduleStatus,
} from "@/store/slices/duty-schedule.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { DutySchedule, DutyScheduleParams } from "@/app/types/duty-schedule";
import { Site } from "@/app/types/site";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyScheduleShow } from '@/components/duty-schedule/duty-schedule-show';
import { DutyScheduleEditForm } from '@/components/duty-schedule/duty-schedule-edit-form';

// Schedule type labels
const scheduleTypeLabels: Record<string, string> = {
  one_time: "One Time",
  recurring: "Recurring",
};

// Status colors
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  inactive: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-700",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700",
};

// Schedule type colors
const scheduleTypeColors: Record<string, string> = {
  one_time: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  recurring: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700",
};

// -------------------------------------------------------------------------
// WALL-CLOCK TIME HELPERS
//
// Schedules store start_time/end_time as plain HH:mm:ss strings that are
// wall-clock values in the SITE's timezone. To display them:
//   1. Treat the string as if it belongs to the site's timezone.
//   2. Convert that instant to the target timezone.
// -------------------------------------------------------------------------

/**
 * Build a Date that represents the given wall-clock date + time
 * as an instant in `sourceTimezone`. The returned Date's UTC fields
 * encode that instant.
 *
 * Example:
 *   buildInstant('2026-09-09', '17:00:00', 'Asia/Dhaka')
 *   -> Date whose UTC value is 2026-09-09T11:00:00Z
 */
const buildInstant = (
  dateStr: string | null | undefined,
  timeStr: string,
  sourceTimezone: string
): Date => {
  const baseDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? dateStr
    : '2000-01-01';

  // Normalize HH:mm:ss -> HH:mm
  const hhmm = timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
  const isoLocal = `${baseDate}T${hhmm}:00`;

  // fromZonedTime: interpret this wall-clock as belonging to `sourceTimezone`
  // and return the equivalent UTC instant.
  return fromZonedTime(isoLocal, sourceTimezone);
};

/**
 * Format a wall-clock site time into another timezone.
 * Returns 'hh:mm a' style by default.
 */
const convertWallClock = (
  dateStr: string | null | undefined,
  timeStr: string,
  sourceTimezone: string,
  targetTimezone: string,
  fmt: string = 'hh:mm a'
): string => {
  try {
    if (!timeStr) return '-';
    const instant = buildInstant(dateStr, timeStr, sourceTimezone);
    return formatInTimeZone(instant, targetTimezone, fmt);
  } catch (err) {
    console.error('convertWallClock error:', err);
    return timeStr;
  }
};

// Function to determine shift type based on time
const getShiftType = (timeString: string): 'morning' | 'day' | 'night' => {
  try {
    const [h] = timeString.split(':').map(Number);
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'day';
    return 'night';
  } catch {
    return 'morning';
  }
};

// Shift type configuration with static images
const shiftConfig = {
  morning: {
    image: '/images/morning-shift.png',
    label: 'Morning',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    emoji: '🌅',
  },
  day: {
    image: '/images/day-shift.png',
    label: 'Day',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    emoji: '☀️',
  },
  night: {
    image: '/images/night-shift.png',
    label: 'Night',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    emoji: '🌙',
  },
};

const ShiftTypeDisplay = ({ shiftType }: { shiftType: 'morning' | 'day' | 'night' }) => {
  const config = shiftConfig[shiftType];

  return (
    <div className={`flex flex-col items-center gap-1 px-1 py-1.5 rounded-xl border-2 ${config.bgColor} ${config.borderColor} min-w-[60px] sm:min-w-[70px] md:min-w-[80px] transition-all duration-200 hover:scale-105 hover:shadow-md`}>
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
        <Image
          src={config.image}
          alt={config.label}
          width={64}
          height={64}
          className="rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const emojiSpan = document.createElement('span');
              emojiSpan.className = `text-2xl sm:text-3xl md:text-4xl ${config.textColor}`;
              emojiSpan.textContent = config.emoji;
              parent.appendChild(emojiSpan);
            }
          }}
        />
      </div>
      <span className={`text-[9px] sm:text-[10px] md:text-xs font-semibold ${config.textColor} uppercase tracking-wider`}>
        {config.label}
      </span>
    </div>
  );
};

interface DutyScheduleDataTableProps {
  onAddClick?: () => void;
}

export function DutyScheduleDataTable({ onAddClick }: DutyScheduleDataTableProps) {
  const dispatch = useAppDispatch();

  const { items, pagination, isLoading } = useAppSelector(
    (state) => state.dutySchedule
  );
  const { sites } = useAppSelector((state) => state.site);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<DutyScheduleParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DutySchedule | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DutySchedule | null>(null);
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [itemToShow, setItemToShow] = useState<number | null>(null);

  // Current user timezone
  const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [currentTime, setCurrentTime] = useState(
    formatInTimeZone(new Date(), currentUserTimezone, 'HH:mm:ss')
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatInTimeZone(new Date(), currentUserTimezone, 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUserTimezone]);

  // Resolve a schedule's site timezone (prefers schedule.site_timezone,
  // then the loaded site, then 'UTC').
  const resolveSiteTimezone = (item: DutySchedule): string => {
    if (item.site_timezone) return item.site_timezone;
    const site = sites.find(s => s.id === item.site_id);
    return site?.timezone || 'UTC';
  };

  const isSameTimezone = (siteTimezone: string): boolean =>
    siteTimezone === currentUserTimezone;

  // Compute the numeric offset difference between site tz and user tz
  const getTimeDifference = (siteTimezone: string): string => {
    if (!siteTimezone) return 'N/A';
    try {
      const now = new Date();

      // Wall-clock minutes-since-midnight in each zone
      const siteTimeStr = formatInTimeZone(now, siteTimezone, 'HH:mm');
      const userTimeStr = formatInTimeZone(now, currentUserTimezone, 'HH:mm');

      const [siteH, siteM] = siteTimeStr.split(':').map(Number);
      const [userH, userM] = userTimeStr.split(':').map(Number);

      const siteTotal = siteH * 60 + siteM;
      const userTotal = userH * 60 + userM;

      let diffMinutes = siteTotal - userTotal;
      if (diffMinutes > 720) diffMinutes -= 1440;
      if (diffMinutes < -720) diffMinutes += 1440;

      if (diffMinutes === 0) return 'Same';

      const sign = diffMinutes > 0 ? '+' : '';
      const abs = Math.abs(diffMinutes);
      const h = Math.floor(abs / 60);
      const m = abs % 60;

      return m === 0 ? `${sign}${h}h` : `${sign}${h}h ${m}m`;
    } catch (err) {
      return 'N/A';
    }
  };

  useEffect(() => {
    dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
  }, [dispatch]);

  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    dispatch(fetchDutySchedules(fetchParams));
  }, [dispatch, filters, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSiteFilter = (siteId: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      site_id: siteId === "all" ? undefined : parseInt(siteId)
    }));
  };

  const handleScheduleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      schedule_type: type === "all" ? undefined : type as 'one_time' | 'recurring'
    }));
  };

  const handleServiceModeFilter = (mode: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      service_mode: mode === "all" ? undefined : mode as 'continuous_shift' | 'patrol_visits'
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      status: status === "all" ? undefined : status
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedItems([]);
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item: DutySchedule) => item.id));
    }
  };

  const handleView = (id: number) => {
    setItemToShow(id);
    setShowDialogOpen(true);
  };

  const handleEdit = (item: DutySchedule) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (item: DutySchedule) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteDutySchedule(itemToDelete.id)).unwrap();

        SweetAlertService.success(
          'Schedule Deleted',
          `Schedule has been deleted successfully.`,
          { timer: 1500, showConfirmButton: false }
        );

        setDeleteDialogOpen(false);
        setItemToDelete(null);

        const fetchParams = { ...filters, search: searchTerm || undefined };
        dispatch(fetchDutySchedules(fetchParams));
      } catch (error: any) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the schedule. Please try again.'
        );
      }
    }
  };

  const handleToggleStatus = async (item: DutySchedule) => {
    try {
      const newStatus = !item.is_active;
      await dispatch(toggleDutyScheduleStatus({
        id: item.id,
        isActive: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `Schedule has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      const fetchParams = { ...filters, search: searchTerm || undefined };
      dispatch(fetchDutySchedules(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update schedule status. Please try again.'
      );
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    await SweetAlertService.success('Export Started', 'Your schedule data export has been initiated.', { timer: 2000 });
  };

  const getSiteName = (id: number) => {
    const site = sites.find(s => s.id === id);
    return site?.site_name || site?.title || "N/A";
  };

  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  /**
   * Format a date-only string without timezone shifting.
   * Input is expected as 'YYYY-MM-DD'. Never do `new Date(dateString)`
   * here because that parses as UTC midnight and shifts the day for
   * negative-offset timezones.
   */
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
      if (!match) return dateString;
      const [, y, m, d] = match;
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${monthNames[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
    } catch {
      return dateString;
    }
  };

  const getScheduleTypeBadge = (type: string) => (
    <Badge variant="outline" className={`${scheduleTypeColors[type] || "bg-gray-100"} border-0 px-3 py-1 font-medium`}>
      {scheduleTypeLabels[type] || type}
    </Badge>
  );

  const getStatusBadge = (status: string) => (
    <Badge variant="outline" className={`${statusColors[status] || "bg-gray-100"} border px-3 py-1 font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const getServiceModeBadge = (item: DutySchedule) => {
    if (item.service_mode === 'patrol_visits') {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700 flex items-center gap-1 px-3 py-1 font-medium">
          <Target className="h-3 w-3" />
          Patrol {item.required_visits ? `(${item.required_visits})` : ''}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-3 py-1 font-medium">
        Continuous
      </Badge>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden">
        {/* Top Header Section */}
        <div className="bg-[#F4F6F8] p-3 sm:p-5 -mt-6 rounded-t-md flex flex-wrap items-center gap-3 w-full justify-between md:justify-start">
          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <ListFilter size="14px" />
            Filters
          </CardTitle>

          <CardTitle
            className="text-sm flex items-center gap-1 dark:text-black cursor-pointer hover:opacity-80"
            onClick={handleExport}
          >
            <DownloadIcon size="14px" />
            Export
          </CardTitle>

          <div className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox
              id="select-all"
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={handleSelectAll}
              className="dark:bg-white dark:border-black"
            />
            <Label htmlFor="select-all" className="text-xs sm:text-sm">Select All</Label>
          </div>

          {selectedItems.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {}}
              className="ml-auto text-xs sm:text-sm"
            >
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 border-b px-3 sm:px-4 py-2 sm:py-3">
            <div className="xs:col-span-2 sm:col-span-3">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="xs:col-span-1 sm:col-span-2">
              <Select value={filters.site_id?.toString() || "all"} onValueChange={handleSiteFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sites</SelectLabel>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map((site: Site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.site_name || site.title || `Site ${site.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-2">
              <Select value={filters.schedule_type || "all"} onValueChange={handleScheduleTypeFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Schedule Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-1">
              <Select value={filters.service_mode || "all"} onValueChange={handleServiceModeFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Service Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Service Mode</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="continuous_shift">Continuous Shift</SelectItem>
                    <SelectItem value="patrol_visits">Patrol Visits</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-1">
              <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-2 sm:col-span-2 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                Clear Filters
              </Button>
              {onAddClick && (
                <Button
                  size="sm"
                  onClick={onAddClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                >
                  Add Schedule
                </Button>
              )}
            </div>

            {/* Timezone Display */}
            <div className="xs:col-span-2 sm:col-span-3 flex flex-wrap items-center justify-start sm:justify-end gap-1 sm:gap-2 text-[10px] sm:text-xs bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
              <Globe className="h-3 w-3 text-blue-500" />
              <span className="text-gray-500 dark:text-gray-400 hidden xs:inline">Your Timezone:</span>
              <span className="font-mono font-medium text-blue-600 dark:text-blue-400 truncate max-w-[80px] sm:max-w-none">{currentUserTimezone.split('/').pop()}</span>
              <Clock className="h-3 w-3 text-emerald-500 ml-0 sm:ml-1" />
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{currentTime}</span>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                  <TableHead className="w-8 sm:w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Shift</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Title & Site</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Service Mode</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Schedule Time (Site)</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Your Time</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Diff</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Check-in</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Guards</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Status</TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 sm:py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                          No duty schedules found
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm || filters.site_id || filters.schedule_type
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new schedule"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>Create Schedule</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: DutySchedule, index: number) => {
                    const siteTimezone = resolveSiteTimezone(item);
                    const showUserTime = !isSameTimezone(siteTimezone);
                    const timeDiff = getTimeDifference(siteTimezone);

                    const shiftType = getShiftType(item.start_time);

                    // ---- SITE TIME ----
                    // The stored start_time/end_time ARE the site's wall-clock
                    // values, so just format them nicely. No conversion needed.
                    const siteStartTime = formatTime(item.start_time);
                    const siteEndTime = formatTime(item.end_time);
                    const siteCheckInTime = item.mandatory_check_in_time
                      ? formatTime(item.mandatory_check_in_time)
                      : null;

                    // ---- USER TIME ----
                    // Convert the wall-clock site time to the user's timezone.
                    const userStartTime = convertWallClock(
                      item.start_date, item.start_time, siteTimezone, currentUserTimezone, 'hh:mm a'
                    );
                    const userEndTime = convertWallClock(
                      item.start_date, item.end_time, siteTimezone, currentUserTimezone, 'hh:mm a'
                    );
                    const userCheckInTime = item.mandatory_check_in_time
                      ? convertWallClock(
                          item.start_date, item.mandatory_check_in_time, siteTimezone, currentUserTimezone, 'hh:mm a'
                        )
                      : null;

                    const rowBgColor = index % 2 === 0
                      ? 'bg-white dark:bg-gray-900/50'
                      : 'bg-gray-50/50 dark:bg-gray-800/30';

                    return (
                      <TableRow
                        key={item.id}
                        className={`${rowBgColor} hover:bg-blue-50/80 dark:hover:bg-blue-900/30 cursor-pointer transition-colors`}
                        onClick={() => handleView(item.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()} className="py-2 sm:py-3 px-2 sm:px-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </TableCell>

                        {/* Shift Type */}
                        <TableCell className="text-center py-2 sm:py-3 px-1 sm:px-2">
                          <ShiftTypeDisplay shiftType={shiftType} />
                        </TableCell>

                        {/* Title & Site */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                              <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                {item.title}
                              </span>
                              {getScheduleTypeBadge(item.schedule_type)}
                            </div>
                            {item.description && (
                              <div className="text-[9px] xs:text-xs text-gray-500 truncate max-w-[120px] xs:max-w-[200px] mt-0.5">
                                {item.description}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              <Building className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="text-xs sm:text-sm">{getSiteName(item.site_id)}</span>
                              <span className="text-gray-300 hidden xs:inline">•</span>
                              <Globe className="h-2.5 w-2.5 hidden xs:inline" />
                              <span className="font-mono text-[9px] xs:text-[10px] hidden xs:inline">{siteTimezone}</span>
                            </div>
                            {item.recurrence_frequency && (
                              <div className="flex items-center gap-1 text-[9px] xs:text-xs text-purple-500 dark:text-purple-400 mt-0.5">
                                <Repeat className="h-2.5 w-2.5" />
                                <span>{item.recurrence_frequency}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Service Mode */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          {getServiceModeBadge(item)}
                        </TableCell>

                        {/* Schedule Time (Site Timezone) — raw values */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(item.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                                {siteStartTime} - {siteEndTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-xs text-gray-400">
                              <Globe className="h-2.5 w-2.5" />
                              <span className="font-mono">{siteTimezone}</span>
                            </div>
                            {item.service_mode === 'patrol_visits' && (
                              <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-xs text-purple-500 dark:text-purple-400">
                                <Target className="h-2.5 w-2.5" />
                                <span>{item.required_visits} visit{item.required_visits !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Your Time (User Timezone) — converted */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          {showUserTime ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                                <span className="text-[10px] sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {formatDate(item.start_date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 ml-4 sm:ml-5">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                                <span className="text-[10px] sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
                                  {userStartTime} - {userEndTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 ml-4 sm:ml-5 text-[8px] sm:text-xs text-gray-400">
                                <Globe className="h-2.5 w-2.5" />
                                <span className="font-mono">{currentUserTimezone}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-400">
                              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="hidden xs:inline">Same timezone</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Time Difference */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          {timeDiff !== 'Same' && timeDiff !== 'N/A' ? (
                            <Badge variant="outline" className={`text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 ${timeDiff.startsWith('+') ? 'border-blue-300 text-blue-600 bg-blue-50' : timeDiff.startsWith('-') ? 'border-amber-300 text-amber-600 bg-amber-50' : 'border-gray-300 text-gray-500'}`}>
                              <Timer className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              {timeDiff}
                            </Badge>
                          ) : timeDiff === 'Same' ? (
                            <Badge variant="outline" className="text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 border-emerald-300 text-emerald-600 bg-emerald-50">
                              <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden xs:inline">Same</span>
                            </Badge>
                          ) : (
                            <span className="text-[8px] sm:text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>

                        {/* Check-in Time */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          {item.mandatory_check_in_time ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                                <span className="text-[10px] sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {siteCheckInTime}
                                </span>
                              </div>
                              {showUserTime && userCheckInTime && (
                                <div className="flex items-center gap-1 mt-0.5 ml-4 text-[8px] sm:text-xs text-emerald-600 dark:text-emerald-400">
                                  <User className="h-2 w-2" />
                                  <span>{userCheckInTime}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[8px] sm:text-xs text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Guards */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              {item.guards_required}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(item.status)}
                            {item.is_active ? (
                              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-0 text-[8px] xs:text-[10px] px-1.5 sm:px-2 py-0 flex items-center gap-1">
                                <CheckCircle className="h-2 w-2" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border-0 text-[8px] xs:text-[10px] px-1.5 sm:px-2 py-0 flex items-center gap-1">
                                <XCircle className="h-2 w-2" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center py-2 sm:py-3 px-1 sm:px-2" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <EllipsisVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 sm:w-56 shadow-lg rounded-xl">
                              <DropdownMenuItem onClick={() => handleView(item.id)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(item)} className="hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(item)} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                {item.is_active ? (
                                  <>
                                    <XCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-rose-500" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(item)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer text-red-600 hover:text-red-700 text-xs sm:text-sm"
                              >
                                <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t bg-gray-50/50 dark:bg-gray-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{items.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> schedules
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({selectedItems.length} selected)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg font-medium text-blue-600 dark:text-blue-400">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Schedule"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
      />

      {itemToShow && (
        <DutyScheduleShow
          trigger={<div />}
          id={itemToShow}
          isOpen={showDialogOpen}
          onOpenChange={setShowDialogOpen}
        />
      )}

      {selectedItem && (
        <DutyScheduleEditForm
          trigger={<div />}
          item={selectedItem}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = { ...filters, search: searchTerm || undefined };
            dispatch(fetchDutySchedules(fetchParams));
          }}
        />
      )}
    </>
  );
}
