// components/guard-assignment/guard-assignment-data-table.tsx

"use client";

import { useState, useEffect } from "react";
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
  User,
  Shield,
  Calendar,
  MapPin,
  CheckCheck,
  Ban,
  PlayCircle,
  Flag,
  RefreshCw,
  Globe,
  Timer,
  Sun,
  Sparkles,
  Cloud,
  Zap,
  Building,
  Users,
  Phone,
  Mail,
  Hash,
  Minus,
  X,
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
  fetchAssignments,
  deleteAssignment,
  updateAssignmentStatus,
  getStatusDisplay,
  getStatusColor,
} from "@/store/slices/guardAssignmentSlice";
import { GuardAssignment, GuardAssignmentParams, GuardAssignmentStatus } from "@/app/types/guardAssignment";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import { ReplaceGuardDialog } from "./replace-guard-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { GuardAssignmentEditForm } from "./guard-assignment-edit-form";
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";

interface GuardAssignmentDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (assignment: GuardAssignment) => void;
}

// Status action configuration
interface StatusAction {
  status: GuardAssignmentStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}

// All available statuses with their display info
const ALL_STATUSES: GuardAssignmentStatus[] = [
  'assigned',
  'accepted',
  'checked_in',
  'on_duty',
  'completed',
  'late',
  'no_show',
  'cancelled',
  'replaced'
];

const statusActionConfig: Record<GuardAssignmentStatus, { label: string; icon: React.ElementType; color: string }> = {
  assigned: { label: 'Mark as Assigned', icon: Flag, color: 'text-blue-600' },
  accepted: { label: 'Accept Assignment', icon: CheckCircle, color: 'text-green-600' },
  checked_in: { label: 'Check In', icon: MapPin, color: 'text-purple-600' },
  on_duty: { label: 'Start Duty', icon: PlayCircle, color: 'text-emerald-600' },
  completed: { label: 'Mark Completed', icon: CheckCheck, color: 'text-gray-600' },
  late: { label: 'Mark Late', icon: Clock, color: 'text-yellow-600' },
  no_show: { label: 'No Show', icon: XCircle, color: 'text-red-600' },
  cancelled: { label: 'Cancel Assignment', icon: Ban, color: 'text-orange-600' },
  replaced: { label: 'Replace Guard', icon: RefreshCw, color: 'text-indigo-600' },
};

// Status colors mapping - More vibrant
const assignmentStatusColors: Record<string, string> = {
  "assigned": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700",
  "accepted": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  "checked_in": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700",
  "on_duty": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
  "completed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  "late": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700",
  "no_show": "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-700",
  "cancelled": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-700",
  "replaced": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700",
};

const coverageIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-3 w-3 text-emerald-500" />,
  on_duty: <PlayCircle className="h-3 w-3 text-emerald-500" />,
  accepted: <CheckCircle className="h-3 w-3 text-emerald-500" />,
  assigned: <Clock className="h-3 w-3 text-blue-500" />,
  checked_in: <MapPin className="h-3 w-3 text-purple-500" />,
  late: <Clock className="h-3 w-3 text-amber-500" />,
  no_show: <XCircle className="h-3 w-3 text-rose-500" />,
  cancelled: <Ban className="h-3 w-3 text-orange-500" />,
  replaced: <RefreshCw className="h-3 w-3 text-indigo-500" />,
};

// Profile Image Zoom Modal
const ProfileImageZoomModal = ({
  isOpen,
  onClose,
  imageUrl,
  name
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  name: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {name}
            </h3>
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="rounded-2xl object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-8xl font-bold">
                  {name.charAt(0) || 'G'}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Guard Profile
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Avatar component with click to zoom - Fixed event bubbling
const GuardAvatar = ({
  guard,
  size = 'md',
  onImageClick
}: {
  guard: any;
  size?: 'sm' | 'md' | 'lg';
  onImageClick?: (e: React.MouseEvent) => void;
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base',
    lg: 'w-14 h-14 text-lg',
  };

  const getProfileImageUrl = (guard: any) => {
    if (!guard) return null;
    if (guard.profile_image_url) {
      return guard.profile_image_url;
    }
    if (guard.profile_image) {
      const imagePath = guard.profile_image.replace(/\/\//g, '/');
      return `${process.env.NEXT_PUBLIC_API_URL || ''}/${imagePath}`;
    }
    return null;
  };

  const imageUrl = getProfileImageUrl(guard);
  const name = guard?.full_name || 'Guard';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const getColorFromName = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-red-400 to-red-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = getColorFromName(name);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event bubbling to parent row
    if (onImageClick) {
      onImageClick(e);
    }
  };

  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative flex-shrink-0 ${sizeClasses[size]} cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 rounded-full transition-all duration-200`}
        onClick={handleClick}
        title="Click to view profile image"
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white font-semibold ${sizeClasses[size]} cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200`}
      onClick={handleClick}
      title="Click to view profile"
    >
      {initials || 'G'}
    </div>
  );
};

export function GuardAssignmentDataTable({ onAddClick, onViewClick }: GuardAssignmentDataTableProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { assignments, pagination, isLoading, error } = useAppSelector((state) => state.guardAssignment);

  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [filters, setFilters] = useState<GuardAssignmentParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<GuardAssignment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<GuardAssignment | null>(null);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [assignmentToReplace, setAssignmentToReplace] = useState<GuardAssignment | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Profile image zoom state
  const [zoomImageOpen, setZoomImageOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomImageName, setZoomImageName] = useState<string>("");

  // Get current user timezone and time
  const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert date to user timezone
  const convertToUserTimezone = (dateString: string, formatStr: string): string => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, currentUserTimezone, formatStr);
    } catch (error) {
      return dateString;
    }
  };

  // Convert date to site timezone
  const convertToSiteTimezone = (dateString: string, formatStr: string, timezone: string): string => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, timezone, formatStr);
    } catch (error) {
      return dateString;
    }
  };

  // Calculate time difference between user and site timezone
  const getTimeDifference = (siteTimezone: string | null | undefined): string => {
    if (!siteTimezone) return 'N/A';

    try {
      const now = new Date();

      const siteTimeStr = now.toLocaleString('en-US', {
        timeZone: siteTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const [siteHours, siteMinutes] = siteTimeStr.split(':').map(Number);
      const siteTotalMinutes = siteHours * 60 + siteMinutes;

      const userHours = now.getHours();
      const userMinutes = now.getMinutes();
      const userTotalMinutes = userHours * 60 + userMinutes;

      let diffMinutes = siteTotalMinutes - userTotalMinutes;

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

  // Fetch assignments on mount and filter changes
  useEffect(() => {
    const fetchParams: GuardAssignmentParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: searchTerm || undefined,
      include_guard: true,
      include_duty: true,
    };

    if (statusFilter !== "all") {
      fetchParams.status = statusFilter;
    }

    if (dateFilter) {
      const formattedDate = format(dateFilter, 'yyyy-MM-dd');
      fetchParams.start_date = formattedDate;
      fetchParams.end_date = formattedDate;
    }

    dispatch(fetchAssignments(fetchParams));
  }, [dispatch, filters.page, searchTerm, statusFilter, dateFilter]);

  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };

  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDateFilter(date);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setDateFilter(undefined);
    setStatusFilter("all");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedAssignments([]);
  };

  const handleSelectAssignment = (assignmentId: number, checked: boolean) => {
    if (checked) {
      setSelectedAssignments(prev => [...prev, assignmentId]);
    } else {
      setSelectedAssignments(prev => prev.filter(id => id !== assignmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssignments(assignments.map((assignment: GuardAssignment) => assignment.id));
    } else {
      setSelectedAssignments([]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, assignment: GuardAssignment) => {
    e.stopPropagation();
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (assignmentToDelete) {
      try {
        await dispatch(deleteAssignment(assignmentToDelete.id)).unwrap();

        await SweetAlertService.success(
          'Assignment Deleted',
          `Assignment has been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );

        setDeleteDialogOpen(false);
        setAssignmentToDelete(null);

        const fetchParams: GuardAssignmentParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
          include_guard: true,
          include_duty: true,
        };
        dispatch(fetchAssignments(fetchParams));
      } catch (error) {
        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the assignment. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    }
  };

  const handleReplace = (e: React.MouseEvent, assignment: GuardAssignment) => {
    e.stopPropagation();
    setAssignmentToReplace(assignment);
    setReplaceDialogOpen(true);
  };

  const handleStatusUpdate = async (e: React.MouseEvent, assignment: GuardAssignment, newStatus: GuardAssignmentStatus) => {
    e.stopPropagation();

    const statusDisplay = getStatusDisplay(newStatus);

    const result = await Swal.fire({
      title: `Mark Assignment as ${statusDisplay}`,
      text: `Are you sure you want to mark this assignment as ${statusDisplay}? This action will be confirmed in 5 seconds.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor:
        newStatus === 'assigned' ? '#3b82f6' :
        newStatus === 'accepted' ? '#22c55e' :
        newStatus === 'checked_in' ? '#a855f7' :
        newStatus === 'on_duty' ? '#10b981' :
        newStatus === 'completed' ? '#6b7280' :
        newStatus === 'late' ? '#eab308' :
        newStatus === 'no_show' ? '#ef4444' :
        newStatus === 'cancelled' ? '#f97316' :
        newStatus === 'replaced' ? '#8b5cf6' : '#6b7280',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, mark as ${statusDisplay}`,
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const resultAction = await dispatch(updateAssignmentStatus({
          id: assignment.id,
          status: newStatus
        }));

        if (updateAssignmentStatus.fulfilled.match(resultAction)) {
          await SweetAlertService.success(
            'Status Updated',
            `Assignment has been marked as ${statusDisplay} successfully.`,
            {
              timer: 2000,
              showConfirmButton: false,
              timerProgressBar: true,
            }
          );
        } else {
          await SweetAlertService.error(
            'Update Failed',
            'There was an error updating the assignment status. Please try again.',
            {
              timer: 2000,
              showConfirmButton: true,
            }
          );
        }
      } catch (error) {
        await SweetAlertService.error(
          'Update Failed',
          'There was an error updating the assignment status. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    } else if (result.dismiss === Swal.DismissReason.timer) {
      await SweetAlertService.info(
        'Confirmation Expired',
        'The confirmation dialog timed out. Please try again.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssignments.length === 0) {
      await SweetAlertService.warning(
        'No Assignments Selected',
        'Please select at least one assignment to delete.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Delete Confirmation',
      text: `Are you sure you want to delete ${selectedAssignments.length} selected assignment(s)? This action cannot be undone.`,
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
        await SweetAlertService.loading('Processing...', 'Please wait while we delete the assignments.');

        for (const assignmentId of selectedAssignments) {
          await dispatch(deleteAssignment(assignmentId)).unwrap();
        }

        SweetAlertService.close();

        await SweetAlertService.success(
          'Assignments Deleted',
          `${selectedAssignments.length} assignment(s) have been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );

        setSelectedAssignments([]);

        const fetchParams: GuardAssignmentParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
          include_guard: true,
          include_duty: true,
        };
        dispatch(fetchAssignments(fetchParams));
      } catch (error) {
        SweetAlertService.close();
        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the assignments. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    } else if (result.dismiss === Swal.DismissReason.timer) {
      await SweetAlertService.info(
        'Confirmation Expired',
        'The confirmation dialog timed out. Please try again.',
        {
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }
      );
    }
  };

  const handleViewDetails = (assignment: GuardAssignment) => {
    router.push(`/guard-assignment/${assignment.id}`);
  };

  const handleEdit = (e: React.MouseEvent, assignment: GuardAssignment) => {
    e.stopPropagation();
    setSelectedAssignment(assignment);
    setEditDialogOpen(true);
  };

  const canChangeTo = (currentStatus: GuardAssignmentStatus, targetStatus: GuardAssignmentStatus): boolean => {
    if (currentStatus === targetStatus) return false;
    return true;
  };

  const getAvailableActions = (currentStatus: GuardAssignmentStatus): StatusAction[] => {
    const actions: StatusAction[] = [];

    for (const status of ALL_STATUSES) {
      if (canChangeTo(currentStatus, status)) {
        const config = statusActionConfig[status];
        actions.push({
          status,
          label: config.label,
          icon: config.icon,
          color: config.color,
        });
      }
    }

    return actions;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const calculateDurationDays = (start: string, end: string) => {
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const durationMs = endTime.getTime() - startTime.getTime();
      return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    } catch (error) {
      return "N/A";
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    await SweetAlertService.success(
      'Export Started',
      'Your assignment data export has been initiated.',
      {
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }
    );
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "assigned", label: "Assigned" },
    { value: "accepted", label: "Accepted" },
    { value: "checked_in", label: "Checked In" },
    { value: "on_duty", label: "On Duty" },
    { value: "completed", label: "Completed" },
    { value: "late", label: "Late" },
    { value: "no_show", label: "No Show" },
    { value: "cancelled", label: "Cancelled" },
    { value: "replaced", label: "Replaced" },
  ];

  const isTodayAssignment = (dateString: string) => {
    try {
      return isToday(new Date(dateString));
    } catch {
      return false;
    }
  };

  const isTomorrowAssignment = (dateString: string) => {
    try {
      return isTomorrow(new Date(dateString));
    } catch {
      return false;
    }
  };

  const isYesterdayAssignment = (dateString: string) => {
    try {
      return isYesterday(new Date(dateString));
    } catch {
      return false;
    }
  };

  // Get profile image URL helper
  const getProfileImageUrl = (guard: any) => {
    if (!guard) return null;
    if (guard.profile_image_url) {
      return guard.profile_image_url;
    }
    if (guard.profile_image) {
      const imagePath = guard.profile_image.replace(/\/\//g, '/');
      return `${process.env.NEXT_PUBLIC_API_URL || ''}/${imagePath}`;
    }
    return null;
  };

  // Handle avatar click to open zoom - with event
  const handleAvatarClick = (e: React.MouseEvent, guard: any) => {
    e.stopPropagation(); // Stop event bubbling
    const imageUrl = getProfileImageUrl(guard);
    const name = guard?.full_name || 'Guard';
    setZoomImageUrl(imageUrl);
    setZoomImageName(name);
    setZoomImageOpen(true);
  };

  if (isLoading && assignments.length === 0) {
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
      {/* Profile Image Zoom Modal */}
      <ProfileImageZoomModal
        isOpen={zoomImageOpen}
        onClose={() => setZoomImageOpen(false)}
        imageUrl={zoomImageUrl}
        name={zoomImageName}
      />

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
              className="dark:bg-white dark:border-black"
              checked={selectedAssignments.length === assignments.length && assignments.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-xs sm:text-sm">Select All</Label>
          </div>

          {selectedAssignments.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto text-xs sm:text-sm"
            >
              Delete Selected ({selectedAssignments.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 border-b px-3 sm:px-4 py-2 sm:py-3">
            <div className="xs:col-span-2 sm:col-span-3">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search by guard name..."
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
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="xs:col-span-1 sm:col-span-2">
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
                  Add Assignment
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

          {error && !isLoading && (
            <div className="p-4 text-center text-red-600">
              Error loading assignments: {error}
            </div>
          )}

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                  <TableHead className="w-8 sm:w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Guard</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Duty</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Period</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Duration</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Site Time</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Your Time</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Diff</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Status</TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 sm:py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                          No guard assignments found
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm || statusFilter !== "all" || dateFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new guard assignment"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Assignment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment: GuardAssignment, index: number) => {
                    const currentStatus = (assignment.status || 'assigned') as GuardAssignmentStatus;
                    const availableActions = getAvailableActions(currentStatus);

                    const isToday = isTodayAssignment(assignment.start_date);
                    const isTomorrow = isTomorrowAssignment(assignment.start_date);
                    const isYesterday = isYesterdayAssignment(assignment.start_date);

                    const siteTimezone = assignment.duty?.site?.timezone || 'UTC';
                    const timeDiff = getTimeDifference(siteTimezone);
                    const showUserTime = siteTimezone !== currentUserTimezone;

                    // Format site times
                    const siteStartDate = convertToSiteTimezone(assignment.duty?.start_datetime || assignment.start_date, 'MMM dd, yyyy', siteTimezone);
                    const siteStartTime = assignment.duty?.start_datetime ? convertToSiteTimezone(assignment.duty.start_datetime, 'hh:mm a', siteTimezone) : '-';
                    const siteEndTime = assignment.duty?.end_datetime ? convertToSiteTimezone(assignment.duty.end_datetime, 'hh:mm a', siteTimezone) : '-';

                    // Format user times
                    const userStartDate = assignment.duty?.start_datetime ? convertToUserTimezone(assignment.duty.start_datetime, 'MMM dd, yyyy') : formatDate(assignment.start_date);
                    const userStartTime = assignment.duty?.start_datetime ? convertToUserTimezone(assignment.duty.start_datetime, 'hh:mm a') : '-';
                    const userEndTime = assignment.duty?.end_datetime ? convertToUserTimezone(assignment.duty.end_datetime, 'hh:mm a') : '-';

                    const guardName = assignment.guard?.full_name || `Guard #${assignment.guard_id}`;
                    const guardCode = assignment.guard?.guard_code || '';

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

                    const dayName = getDayName(assignment.start_date);
                    const dateLabel = getDateLabel(assignment.start_date);

                    return (
                      <TableRow
                        key={assignment.id}
                        className={`${rowBgColor} ${borderColor} hover:bg-blue-50/80 dark:hover:bg-blue-900/30 cursor-pointer transition-colors`}
                        onClick={() => handleViewDetails(assignment)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()} className="py-2 sm:py-3 px-2 sm:px-3">
                          <Checkbox
                            checked={selectedAssignments.includes(assignment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectAssignment(assignment.id, checked as boolean)
                            }
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </TableCell>

                        {/* Guard - Single column with avatar and info */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex items-center gap-3">
                            <GuardAvatar
                              guard={assignment.guard}
                              size="md"
                              onImageClick={(e) => handleAvatarClick(e, assignment.guard)}
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                                  {guardName}
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
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="truncate max-w-[80px] sm:max-w-[120px]">{guardCode}</span>
                              </div>
                              {assignment.guard?.phone && (
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400">
                                  <Phone className="h-2.5 w-2.5" />
                                  <span>{assignment.guard.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Duty */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Shield className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400" />
                              <span className="text-[11px] xs:text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-[150px]" title={assignment.duty?.title}>
                                {assignment.duty?.title || `Duty #${assignment.duty_id}`}
                              </span>
                            </div>
                            {assignment.duty?.site && (
                              <div className="flex items-center gap-1 text-[10px] xs:text-[11px] text-gray-400 mt-0.5">
                                <Building className="h-2.5 w-2.5" />
                                <span className="truncate max-w-[80px] sm:max-w-[120px]">{assignment.duty.site.site_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-[9px] xs:text-[10px] text-gray-400 mt-0.5">
                              <Globe className="h-2.5 w-2.5" />
                              <span className="font-mono truncate max-w-[80px] sm:max-w-[120px]">{siteTimezone}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Period */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] xs:text-[11px] text-gray-600 dark:text-gray-400">
                                {formatDate(assignment.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] xs:text-[11px] text-gray-600 dark:text-gray-400">
                                {formatDate(assignment.end_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge className={`text-[9px] xs:text-[10px] px-1.5 py-0 ${
                                isToday ? 'border-blue-300 text-blue-600 bg-blue-50' :
                                isTomorrow ? 'border-purple-300 text-purple-600 bg-purple-50' :
                                isYesterday ? 'border-amber-300 text-amber-600 bg-amber-50' :
                                'border-gray-300 text-gray-500'
                              }`}>
                                {dayName}, {dateLabel}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* Duration */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-[11px] xs:text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                              {calculateDurationDays(assignment.start_date, assignment.end_date)} days
                            </span>
                          </div>
                        </TableCell>

                        {/* Site Time */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                              <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate max-w-[60px] sm:max-w-[100px]">
                                {siteTimezone.split('/').pop()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] xs:text-[11px] sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                                {siteStartTime} - {siteEndTime}
                              </span>
                            </div>
                            <div className="text-[9px] xs:text-[10px] text-gray-400 mt-0.5">
                              {siteStartDate}
                            </div>
                          </div>
                        </TableCell>

                        {/* Your Time */}
                        <TableCell className="py-2 sm:py-3 px-2 sm:px-3">
                          {showUserTime ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                                <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-[60px] sm:max-w-[100px]">
                                  {currentUserTimezone.split('/').pop()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                                <span className="text-[10px] xs:text-[11px] sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
                                  {userStartTime} - {userEndTime}
                                </span>
                              </div>
                              <div className="text-[9px] xs:text-[10px] text-gray-400 mt-0.5">
                                {userStartDate}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-[10px] xs:text-[11px] text-gray-400">Same timezone</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Time Difference */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          {timeDiff !== 'Same' && timeDiff !== 'N/A' ? (
                            <Badge variant="outline" className={`text-[9px] sm:text-[11px] px-1 sm:px-2 py-0.5 sm:py-1 ${
                              timeDiff.startsWith('+') ? 'border-blue-300 text-blue-600 bg-blue-50' :
                              timeDiff.startsWith('-') ? 'border-amber-300 text-amber-600 bg-amber-50' :
                              'border-gray-300 text-gray-500'
                            }`}>
                              <Timer className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              {timeDiff}
                            </Badge>
                          ) : timeDiff === 'Same' ? (
                            <Badge variant="outline" className="text-[9px] sm:text-[11px] px-1 sm:px-2 py-0.5 sm:py-1 border-emerald-300 text-emerald-600 bg-emerald-50">
                              <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Same
                            </Badge>
                          ) : (
                            <span className="text-[9px] sm:text-[11px] text-gray-400">N/A</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2 sm:py-3 px-1 sm:px-2">
                          <Badge
                            className={`${assignmentStatusColors[currentStatus] || 'bg-gray-100 text-gray-800'} border px-1.5 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 w-fit font-medium text-[9px] sm:text-xs`}
                          >
                            {coverageIcons[currentStatus] || null}
                            <span>{getStatusDisplay(currentStatus)}</span>
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
                            <DropdownMenuContent align="end" className="w-48 sm:w-56 max-h-[400px] overflow-y-auto shadow-lg rounded-xl">
                              <DropdownMenuItem onClick={() => handleViewDetails(assignment)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleEdit(e, assignment)} className="hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer text-xs sm:text-sm">
                                <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                                Edit assignment
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => handleReplace(e, assignment)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                              >
                                <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Replace Guard
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {availableActions.map((action: StatusAction, idx: number) => (
                                <DropdownMenuItem
                                  key={idx}
                                  onClick={(e) => handleStatusUpdate(e, assignment, action.status)}
                                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer text-xs sm:text-sm ${action.color}`}
                                >
                                  <action.icon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteClick(e, assignment)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer text-red-600 hover:text-red-700 text-xs sm:text-sm"
                              >
                                <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Delete assignment
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

          {assignments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t bg-gray-50/50 dark:bg-gray-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{assignments.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> assignments
                {selectedAssignments.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({selectedAssignments.length} selected)
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
        title="Delete Assignment"
        description={`Are you sure you want to delete this assignment? This action cannot be undone.`}
      />

      {/* Replace Guard Dialog */}
      {assignmentToReplace && (
        <ReplaceGuardDialog
          isOpen={replaceDialogOpen}
          onOpenChange={setReplaceDialogOpen}
          assignment={assignmentToReplace}
          onSuccess={() => {
            const fetchParams: GuardAssignmentParams = {
              page: filters.page || 1,
              per_page: filters.per_page || 10,
              search: searchTerm || undefined,
              include_guard: true,
              include_duty: true,
            };
            dispatch(fetchAssignments(fetchParams));
            setAssignmentToReplace(null);
          }}
        />
      )}

      {/* Edit Form Dialog */}
      {selectedAssignment && (
        <GuardAssignmentEditForm
          trigger={<div />}
          assignment={selectedAssignment}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams: GuardAssignmentParams = {
              page: filters.page || 1,
              per_page: filters.per_page || 10,
              search: searchTerm || undefined,
              include_guard: true,
              include_duty: true,
            };
            dispatch(fetchAssignments(fetchParams));
          }}
        />
      )}
    </>
  );
}
