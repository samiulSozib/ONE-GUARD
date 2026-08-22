// components/duty/duty-data-table.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isTomorrow, isYesterday, addDays, subDays } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import Image from "next/image";
import {
  CalendarIcon,
  DownloadIcon,
  EllipsisVertical,
  File,
  ListFilter,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Users,
  MapPin,
  AlertCircle,
  CheckCheck,
  Shield,
  Calendar,
  Globe,
  User,
  Sun,
  Sparkles,
  Cloud,
  Zap,
  Minus,
  Timer,
} from "lucide-react";
import {
  Card,
  CardHeader,
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FloatingLabelInput } from "../ui/floating-input";
import { Calendar as CalendarComponent } from "../ui/calender";
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
  fetchDuties,
  deleteDuty,
  toggleDutyStatus,
} from "@/store/slices/dutySlice";
import { Duty, DutyParams } from "@/app/types/duty";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyEditForm } from "./duty-edit-form";
import Swal from 'sweetalert2';

// Timezone list from your app
const TIMEZONES = [
  "America/Adak",
  "America/Anchorage",
  "America/Boise",
  "America/Chicago",
  "America/Denver",
  "America/Detroit",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Vevay",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Juneau",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Los_Angeles",
  "America/Menominee",
  "America/Metlakatla",
  "America/New_York",
  "America/Nome",
  "America/North_Dakota/Beulah",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/Phoenix",
  "America/Puerto_Rico",
  "America/Sitka",
  "America/St_Thomas",
  "America/Yakutat",
  "Pacific/Guam",
  "Pacific/Honolulu",
  "Pacific/Midway",
  "Pacific/Pago_Pago",
  "Pacific/Saipan",
  "Pacific/Wake",
  "Asia/Dhaka",
  "Asia/Kabul",
  "Asia/Karachi",
] as const;

type Timezone = typeof TIMEZONES[number];

// Status colors mapping - More vibrant
const dutyStatusColors: Record<string, string> = {
  "pending": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700",
  "approved": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  "completed": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-700",
};

const coverageStatusColors: Record<string, string> = {
  "unassigned": "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 dark:border-rose-700",
  "partial": "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-700",
  "covered": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  "not_required": "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

const sourceTypeColors: Record<string, string> = {
  scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700",
  one_time: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
  manual: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  exception: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700",
};

const coverageIcons: Record<string, React.ReactNode> = {
  covered: <CheckCircle className="h-3 w-3 text-emerald-500" />,
  partial: <AlertCircle className="h-3 w-3 text-amber-500" />,
  unassigned: <XCircle className="h-3 w-3 text-rose-500" />,
  not_required: <Minus className="h-3 w-3 text-gray-400" />,
};

interface DutyDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (duty: Duty) => void;
}

// Function to determine shift type based on time
const getShiftType = (timeString: string): 'morning' | 'day' | 'night' => {
  try {
    const date = new Date(timeString);
    const hours = date.getHours();

    // Morning: 5 AM to 12 PM (05:00 - 11:59)
    if (hours >= 5 && hours < 12) {
      return 'morning';
    }
    // Day: 12 PM to 6 PM (12:00 - 17:59)
    else if (hours >= 12 && hours < 18) {
      return 'day';
    }
    // Night: 6 PM to 5 AM (18:00 - 04:59)
    else {
      return 'night';
    }
  } catch {
    return 'morning'; // Default fallback
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

// Shift type display component with larger image and label
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
            // Fallback to emoji if image fails to load
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

export function DutyDataTable({ onAddClick, onViewClick }: DutyDataTableProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux state
  const { duties, pagination, isLoading, error } = useAppSelector((state) => state.duty);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<DutyParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedDuties, setSelectedDuties] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dutyToDelete, setDutyToDelete] = useState<Duty | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);

  // Filter states
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Get current user timezone
  const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'));

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if timezones are the same
  const isSameTimezone = (siteTimezone: string | null | undefined): boolean => {
    if (!siteTimezone) return true;
    return siteTimezone === currentUserTimezone;
  };

  // Convert date to user timezone with proper offset
  const convertToUserTimezone = (dateString: string, formatStr: string): string => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, currentUserTimezone, formatStr);
    } catch (error) {
      console.error('Error converting to user timezone:', error);
      return dateString;
    }
  };

  // Convert date to site timezone
  const convertToSiteTimezone = (dateString: string, formatStr: string, timezone: string): string => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, timezone, formatStr);
    } catch (error) {
      console.error('Error converting to site timezone:', error);
      return dateString;
    }
  };

  // Get time difference between site and user timezone
  const getTimeDifference = (siteTimezone: string | null | undefined): string => {
    if (!siteTimezone) return 'N/A';

    try {
      const now = new Date();

      // Get site time in hours/minutes
      const siteTimeStr = now.toLocaleString('en-US', {
        timeZone: siteTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const [siteHours, siteMinutes] = siteTimeStr.split(':').map(Number);
      const siteTotalMinutes = siteHours * 60 + siteMinutes;

      // Get user's local time in hours/minutes
      const userHours = now.getHours();
      const userMinutes = now.getMinutes();
      const userTotalMinutes = userHours * 60 + userMinutes;

      // Calculate difference
      let diffMinutes = siteTotalMinutes - userTotalMinutes;

      // Adjust for day wrap (if difference > 12 hours, wrap around)
      if (diffMinutes > 720) diffMinutes -= 1440;
      if (diffMinutes < -720) diffMinutes += 1440;

      if (diffMinutes === 0) return 'Same';

      const sign = diffMinutes > 0 ? '+' : '';
      const absMinutes = Math.abs(diffMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;

      if (minutes === 0) {
        return `${sign}${hours}h`;
      }
      return `${sign}${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 'N/A';
    }
  };

  // Date shortcut handlers
  const setDateToday = () => {
    setDateFilter(new Date());
  };

  const setDateTomorrow = () => {
    setDateFilter(addDays(new Date(), 1));
  };

  const setDateYesterday = () => {
    setDateFilter(subDays(new Date(), 1));
  };

  const setDate7Days = () => {
    setDateFilter(addDays(new Date(), 7));
  };

  const getDateDisplay = (date: Date | undefined) => {
    if (!date) return "";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEE, MMM dd");
  };

  const getDayName = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEE");
    } catch {
      return "";
    }
  };

  const getDateLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "MMM dd");
    } catch {
      return dateString;
    }
  };

  // Check if date changes when converted to user timezone
  const doesDateChange = (dateString: string, timezone: string): boolean => {
    try {
      const siteDate = new Date(dateString);
      const siteDateStr = formatInTimeZone(siteDate, timezone, 'yyyy-MM-dd');
      const userDateStr = formatInTimeZone(siteDate, currentUserTimezone, 'yyyy-MM-dd');
      return siteDateStr !== userDateStr;
    } catch {
      return false;
    }
  };

  // Fetch duties on mount and filter changes
  useEffect(() => {
    const fetchParams: DutyParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: searchTerm || undefined,
      include_site: true,
      include_site_location: true,
      include_duty_schedule: true,
    };

    if (siteFilter !== "all") {
      fetchParams.site_id = parseInt(siteFilter);
    }

    if (statusFilter !== "all") {
      fetchParams.status = statusFilter;
    }

    if (sourceTypeFilter !== "all") {
      fetchParams.source_type = sourceTypeFilter as DutyParams['source_type'];
    }

    if (dateFilter) {
      const formattedDate = format(dateFilter, 'yyyy-MM-dd');
      fetchParams.date_from = formattedDate;
      fetchParams.date_to = formattedDate;
    }

    dispatch(fetchDuties(fetchParams));
  }, [dispatch, filters.page, searchTerm, siteFilter, statusFilter, sourceTypeFilter, dateFilter]);

  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };

  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setDateFilter(undefined);
    setSiteFilter("all");
    setStatusFilter("all");
    setCoverageFilter("all");
    setSourceTypeFilter("all");
    setFilters({ page: 1, per_page: 10 });
    setSelectedDuties([]);
  };

  const handleSelectDuty = (dutyId: number, checked: boolean) => {
    if (checked) {
      setSelectedDuties(prev => [...prev, dutyId]);
    } else {
      setSelectedDuties(prev => prev.filter(id => id !== dutyId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDuties(duties.map((duty: Duty) => duty.id));
    } else {
      setSelectedDuties([]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, duty: Duty) => {
    e.stopPropagation();
    setDutyToDelete(duty);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dutyToDelete) {
      try {
        await dispatch(deleteDuty(dutyToDelete.id)).unwrap();
        await SweetAlertService.success('Duty Deleted', `${dutyToDelete.title} has been deleted successfully.`, { timer: 2000 });
        setDeleteDialogOpen(false);
        setDutyToDelete(null);
        refreshList();
      } catch (error) {
        await SweetAlertService.error('Delete Failed', 'There was an error deleting the duty. Please try again.');
      }
    }
  };

  const handleDutyStatusUpdate = async (e: React.MouseEvent, duty: Duty, newStatus: 'pending' | 'approved' | 'completed') => {
    e.stopPropagation();
    const statusDisplay = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    const result = await Swal.fire({
      title: `Mark Duty as ${statusDisplay}`,
      text: `Are you sure you want to mark "${duty.title}" as ${statusDisplay}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'approved' ? '#10b981' : newStatus === 'completed' ? '#0ea5e9' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, mark as ${statusDisplay}`,
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await dispatch(toggleDutyStatus({ id: duty.id, status: newStatus })).unwrap();
        await SweetAlertService.success('Status Updated', `"${duty.title}" has been marked as ${statusDisplay}.`, { timer: 2000 });
        refreshList();
      } catch (error) {
        await SweetAlertService.error('Update Failed', 'There was an error updating the duty status.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDuties.length === 0) {
      await SweetAlertService.warning('No Duties Selected', 'Please select at least one duty to delete.');
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Delete Confirmation',
      text: `Are you sure you want to delete ${selectedDuties.length} selected duty(ies)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await SweetAlertService.loading('Processing...', 'Please wait while we delete the duties.');
        for (const dutyId of selectedDuties) {
          await dispatch(deleteDuty(dutyId)).unwrap();
        }
        SweetAlertService.close();
        await SweetAlertService.success('Duties Deleted', `${selectedDuties.length} duty(ies) have been deleted.`, { timer: 2000 });
        setSelectedDuties([]);
        refreshList();
      } catch (error) {
        SweetAlertService.close();
        await SweetAlertService.error('Delete Failed', 'There was an error deleting the duties.');
      }
    }
  };

  const handleViewDetails = (duty: Duty) => {
    router.push(`/duty/${duty.id}`);
  };

  const handleViewClick = (duty: Duty) => {
    if (onViewClick) {
      onViewClick(duty);
    } else {
      handleViewDetails(duty);
    }
  };

  const handleEdit = (duty: Duty) => {
    setSelectedDuty(duty);
    setEditDialogOpen(true);
  };

  const refreshList = () => {
    const fetchParams: DutyParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: searchTerm || undefined,
      include_site: true,
      include_site_location: true,
      include_duty_schedule: true,
    };
    dispatch(fetchDuties(fetchParams));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const durationMs = endTime.getTime() - startTime.getTime();
      return (durationMs / (1000 * 60 * 60)).toFixed(1);
    } catch {
      return "N/A";
    }
  };

  const getCoverageStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      'unassigned': 'Unassigned',
      'partial': 'Partial',
      'covered': 'Covered',
      'not_required': 'Not Required',
    };
    return map[status] || status;
  };

  const getStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Approved',
      'completed': 'Completed',
    };
    return map[status] || status;
  };

  const getCoverageIcon = (status: string) => {
    return coverageIcons[status] || null;
  };

  const canChangeTo = (currentStatus: string, targetStatus: string) => {
    if (currentStatus === targetStatus) return false;
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'completed'],
      'approved': ['completed'],
      'completed': [],
    };
    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    await SweetAlertService.success('Export Started', 'Your duty data export has been initiated.', { timer: 2000 });
  };

  const isTodayDuty = (dateString: string) => {
    try {
      return isToday(new Date(dateString));
    } catch {
      return false;
    }
  };

  const isTomorrowDuty = (dateString: string) => {
    try {
      return isTomorrow(new Date(dateString));
    } catch {
      return false;
    }
  };

  const isYesterdayDuty = (dateString: string) => {
    try {
      return isYesterday(new Date(dateString));
    } catch {
      return false;
    }
  };

  // Get unique sites for filter
  const uniqueSites = Array.from(new Set(duties.map(d => d.site?.id))).map(id => {
    const duty = duties.find(d => d.site?.id === id);
    return { id, name: duty?.site?.site_name || `Site ${id}` };
  });

  if (isLoading && duties.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
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
              checked={selectedDuties.length === duties.length && duties.length > 0}
              onCheckedChange={handleSelectAll}
              className="dark:bg-white dark:border-black"
            />
            <Label htmlFor="select-all" className="text-xs sm:text-sm">Select All</Label>
          </div>

          {selectedDuties.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto text-xs sm:text-sm"
            >
              Delete Selected ({selectedDuties.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section - Responsive */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 border-b px-3 sm:px-4 py-2 sm:py-3">
            <div className="xs:col-span-2 sm:col-span-3">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search by duty title..."
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="xs:col-span-1 sm:col-span-2">
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sites</SelectLabel>
                    <SelectItem value="all">All Sites</SelectItem>
                    {uniqueSites.map((site) => (
                      <SelectItem key={site.id} value={String(site.id)}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-1">
              <Select value={coverageFilter} onValueChange={setCoverageFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Coverage</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-2 sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-8 sm:h-9 text-xs sm:text-sm"
                    label="Date"
                    value={dateFilter ? getDateDisplay(dateFilter) : ""}
                    readOnly
                    postfixIcon={<CalendarIcon className="text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-white dark:bg-gray-900 shadow-xl rounded-xl border-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setDateToday}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-xs"
                      >
                        <Sun className="h-3 w-3 mr-1" />
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setDateTomorrow}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Tomorrow
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setDateYesterday}
                        className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 text-xs"
                      >
                        <Cloud className="h-3 w-3 mr-1" />
                        Yesterday
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setDate7Days}
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        7 Days
                      </Button>
                    </div>
                    <div className="border-t pt-3">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                  Add Duty
                </Button>
              )}
            </div>

            {/* Timezone Display - Responsive */}
            <div className="xs:col-span-2 sm:col-span-3 flex flex-wrap items-center justify-start sm:justify-end gap-1 sm:gap-2 text-[10px] sm:text-xs bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
              <Globe className="h-3 w-3 text-blue-500" />
              <span className="text-gray-500 dark:text-gray-400 hidden xs:inline">Your Timezone:</span>
              <span className="font-mono font-medium text-blue-600 dark:text-blue-400 truncate max-w-[80px] sm:max-w-none">{currentUserTimezone.split('/').pop()}</span>
              <Clock className="h-3 w-3 text-emerald-500 ml-0 sm:ml-1" />
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{currentTime}</span>
            </div>
          </div>

          {error && !isLoading && (
            <div className="p-4 text-center text-red-600">
              Error loading duties: {error}
            </div>
          )}

          {/* Table Section - Responsive */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                  <TableHead className="w-8 sm:w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Shift</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Duty Title & Site</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Scheduled Time (Site)</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Your Time</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Diff</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Type</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Guards</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Coverage</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Status</TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[10px] sm:text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {duties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 sm:py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                          No duties found
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm || siteFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new duty"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>Create Duty</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  duties.map((duty: Duty, index: number) => {
                    const siteTimezone = duty.site?.timezone || 'UTC';
                    const isToday = isTodayDuty(duty.start_datetime);
                    const isTomorrow = isTomorrowDuty(duty.start_datetime);
                    const isYesterday = isYesterdayDuty(duty.start_datetime);
                    const showUserTime = !isSameTimezone(siteTimezone);
                    const timeDiff = getTimeDifference(siteTimezone);
                    const dateChanged = doesDateChange(duty.start_datetime, siteTimezone);

                    // Get shift type based on duty start time
                    const shiftType = getShiftType(duty.start_datetime);

                    // Site timezone display (properly formatted)
                    const siteDate = convertToSiteTimezone(duty.start_datetime, 'MMM dd, yyyy', siteTimezone);
                    const siteStartTime = convertToSiteTimezone(duty.start_datetime, 'hh:mm a', siteTimezone);
                    const siteEndTime = convertToSiteTimezone(duty.end_datetime, 'hh:mm a', siteTimezone);
                    const siteDuration = calculateDuration(duty.start_datetime, duty.end_datetime);

                    // User timezone display (properly converted)
                    const userDate = convertToUserTimezone(duty.start_datetime, 'MMM dd, yyyy');
                    const userStartTime = convertToUserTimezone(duty.start_datetime, 'hh:mm a');
                    const userEndTime = convertToUserTimezone(duty.end_datetime, 'hh:mm a');

                    let rowBgColor = '';
                    let borderColor = '';

                    if (isToday) {
                      rowBgColor = 'bg-blue-50/80 dark:bg-blue-900/30';
                      borderColor = 'border-l-4 border-l-blue-500';
                    } else if (isTomorrow) {
                      rowBgColor = 'bg-purple-50/60 dark:bg-purple-900/20';
                      borderColor = 'border-l-4 border-l-purple-400';
                    } else if (isYesterday) {
                      rowBgColor = 'bg-amber-50/60 dark:bg-amber-900/20';
                      borderColor = 'border-l-4 border-l-amber-400';
                    } else if (index % 2 === 0) {
                      rowBgColor = 'bg-white dark:bg-gray-900/50';
                    } else {
                      rowBgColor = 'bg-gray-50/50 dark:bg-gray-800/30';
                    }

                    const dayName = getDayName(duty.start_datetime);
                    const dateLabel = getDateLabel(duty.start_datetime);

                    return (
                      <TableRow
                        key={duty.id}
                        className={`${rowBgColor} ${borderColor} hover:bg-blue-50/80 dark:hover:bg-blue-900/30 cursor-pointer transition-colors`}
                        onClick={() => handleViewClick(duty)}
                      >
                        {/* Select Checkbox */}
                        <TableCell onClick={(e) => e.stopPropagation()} className="py-2 sm:py-3 px-2 sm:px-3">
                          <Checkbox
                            checked={selectedDuties.includes(duty.id)}
                            onCheckedChange={(checked) =>
                              handleSelectDuty(duty.id, checked as boolean)
                            }
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </TableCell>

                        {/* Shift Type - First Column after checkbox */}
                        <TableCell className="text-center py-2 sm:py-3 px-1 sm:px-2">
                          <ShiftTypeDisplay shiftType={shiftType} />
                        </TableCell>

                        {/* Duty Title & Site */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Shield className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                isToday ? 'text-blue-500' :
                                isTomorrow ? 'text-purple-500' :
                                isYesterday ? 'text-amber-500' : 'text-gray-400'
                              }`} />
                              <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                {duty.title}
                              </span>
                              {isToday && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0">
                                  Today
                                </Badge>
                              )}
                              {isTomorrow && (
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-0 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0">
                                  Tomorrow
                                </Badge>
                              )}
                              {isYesterday && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0">
                                  Yesterday
                                </Badge>
                              )}
                            </div>
                            {duty.site && (
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                <Building className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="text-xs sm:text-sm">{duty.site.site_name}</span>
                                {duty.site.address && (
                                  <>
                                    <span className="text-gray-300 hidden xs:inline">•</span>
                                    <span className="text-[10px] xs:text-xs truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] hidden xs:inline">{duty.site.address}</span>
                                  </>
                                )}
                              </div>
                            )}
                            {duty.duty_schedule && (
                              <div className="text-[9px] xs:text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="hidden xs:inline">Schedule:</span> {duty.duty_schedule.title}
                              </div>
                            )}
                            {siteTimezone && (
                              <div className="flex items-center gap-1 mt-0.5 text-[9px] xs:text-xs text-gray-400">
                                <Globe className="h-2.5 w-2.5" />
                                <span className="font-mono truncate max-w-[80px] xs:max-w-none">{siteTimezone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Scheduled Time (Site Timezone) */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className={`text-[10px] sm:text-sm font-medium ${
                                isToday ? 'text-blue-600 dark:text-blue-400' :
                                isTomorrow ? 'text-purple-600 dark:text-purple-400' :
                                isYesterday ? 'text-amber-600 dark:text-amber-400' : ''
                              }`}>
                                {siteDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] sm:text-sm font-mono">
                                {siteStartTime} - {siteEndTime}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                              <Badge variant="outline" className={`text-[8px] sm:text-xs px-1 sm:px-2 py-0 ${
                                isToday ? 'border-blue-300 text-blue-600 bg-blue-50' :
                                isTomorrow ? 'border-purple-300 text-purple-600 bg-purple-50' :
                                isYesterday ? 'border-amber-300 text-amber-600 bg-amber-50' :
                                'border-gray-300 text-gray-500'
                              }`}>
                                {dayName}, {dateLabel}
                              </Badge>
                              <span className="text-[8px] sm:text-xs text-gray-400">
                                {siteDuration}h
                              </span>
                            </div>
                            {siteTimezone && (
                              <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-xs text-gray-400 hidden xs:flex">
                                <Globe className="h-2.5 w-2.5" />
                                <span className="font-mono truncate max-w-[60px] sm:max-w-none">{siteTimezone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Your Time (User Timezone) */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          {showUserTime ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                                <span className="text-[10px] sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {userDate}
                                  {dateChanged && (
                                    <span className="text-amber-500 text-[8px] sm:text-xs ml-0.5 sm:ml-1">*</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 ml-4 sm:ml-5">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                                <span className="text-[10px] sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
                                  {userStartTime} - {userEndTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 ml-4 sm:ml-5 text-[8px] sm:text-xs text-gray-400 hidden xs:flex">
                                <Globe className="h-2.5 w-2.5" />
                                <span className="font-mono truncate max-w-[60px] sm:max-w-none">{currentUserTimezone}</span>
                              </div>
                              {dateChanged && (
                                <div className="flex items-center gap-1 mt-0.5 ml-4 sm:ml-5 text-[8px] sm:text-xs text-amber-500">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  <span className="hidden xs:inline">Date differs from site</span>
                                </div>
                              )}
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
                          {siteTimezone && timeDiff !== 'Same' && timeDiff !== 'N/A' ? (
                            <Badge variant="outline" className={`text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 ${
                              timeDiff.startsWith('+') ? 'border-blue-300 text-blue-600 bg-blue-50' :
                              timeDiff.startsWith('-') ? 'border-amber-300 text-amber-600 bg-amber-50' :
                              'border-gray-300 text-gray-500'
                            }`}>
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

                        {/* Type */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <Badge
                            variant="outline"
                            className={`${sourceTypeColors[duty.source_type || 'manual']} border-0 px-1.5 sm:px-3 py-0.5 sm:py-1 font-medium text-[8px] sm:text-xs`}
                          >
                            {duty.source_type === 'scheduled' ? 'Scheduled' :
                             duty.source_type === 'one_time' ? 'One Time' :
                             duty.source_type === 'exception' ? 'Exception' : 'Manual'}
                          </Badge>
                        </TableCell>

                        {/* Guards */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <div className="flex items-center gap-0.5 sm:gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {duty.assigned_guards_count || 0}
                            </span>
                            <span className="text-gray-400 text-[8px] sm:text-xs">/</span>
                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{duty.guards_required}</span>
                            {duty.assigned_guards_count === duty.guards_required && duty.guards_required > 0 && (
                              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
                            )}
                          </div>
                        </TableCell>

                        {/* Coverage */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <Badge
                            className={`${coverageStatusColors[duty.coverage_status || 'unassigned']} border px-1.5 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 w-fit font-medium text-[8px] sm:text-xs`}
                          >
                            {getCoverageIcon(duty.coverage_status || 'unassigned')}
                            <span className="hidden xs:inline">{getCoverageStatusDisplay(duty.coverage_status || 'unassigned')}</span>
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <Badge
                            className={`${dutyStatusColors[duty.status] || 'bg-gray-100 text-gray-800'} border px-1.5 sm:px-3 py-0.5 sm:py-1 font-medium text-[8px] sm:text-xs`}
                          >
                            {getStatusDisplay(duty.status)}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewClick(duty)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(duty)} className="hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                Edit duty
                              </DropdownMenuItem>

                              {canChangeTo(duty.status, 'approved') && (
                                <DropdownMenuItem
                                  onClick={(e) => handleDutyStatusUpdate(e, duty, 'approved')}
                                  className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer text-xs sm:text-sm"
                                >
                                  <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                                  Approve Duty
                                </DropdownMenuItem>
                              )}

                              {canChangeTo(duty.status, 'completed') && (
                                <DropdownMenuItem
                                  onClick={(e) => handleDutyStatusUpdate(e, duty, 'completed')}
                                  className="hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg cursor-pointer text-xs sm:text-sm"
                                >
                                  <CheckCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-sky-500" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteClick(e, duty)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer text-red-600 hover:text-red-700 text-xs sm:text-sm"
                              >
                                <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Delete duty
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

          {/* Pagination - Original Style */}
          {duties.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t bg-gray-50/50 dark:bg-gray-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{duties.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> duties
                {selectedDuties.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({selectedDuties.length} selected)
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

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Duty"
        description={`Are you sure you want to delete "${dutyToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedDuty && (
        <DutyEditForm
          trigger={<div />}
          duty={selectedDuty}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={refreshList}
        />
      )}
    </>
  );
}
