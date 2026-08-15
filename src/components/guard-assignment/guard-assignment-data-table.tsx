// components/guard-assignment/guard-assignment-data-table.tsx

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
  RefreshCw
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

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

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
    return true; // Allow all transitions
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

  // Status select options
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

  if (isLoading && assignments.length === 0) {
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
      <Card className="shadow-sm rounded-2xl">
        {/* Top Header Section */}
        <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
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
            <Label htmlFor="select-all">Select All</Label>
          </div>

          {selectedAssignments.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto"
            >
              Delete Selected ({selectedAssignments.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search by guard name..."
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="sm:col-span-4">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full">
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

            <div className="sm:col-span-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Assignment Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-12 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
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
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Assignment Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Guard Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No guard assignments found
                        </h3>
                        <p className="text-gray-500 mb-4">
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
                  assignments.map((assignment: GuardAssignment) => {
                    const currentStatus = (assignment.status || 'assigned') as GuardAssignmentStatus;
                    const availableActions = getAvailableActions(currentStatus);

                    return (
                      <TableRow
                        key={assignment.id}
                        className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                        onClick={() => handleViewDetails(assignment)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedAssignments.includes(assignment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectAssignment(assignment.id, checked as boolean)
                            }
                          />
                        </TableCell>

                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{assignment.guard?.full_name || `Guard #${assignment.guard_id}`}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {assignment.duty ? (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="truncate max-w-[150px]" title={assignment.duty.title}>
                                {assignment.duty.title || `Duty #${assignment.duty_id}`}
                              </span>
                            </div>
                          ) : (
                            <span>Duty #{assignment.duty_id}</span>
                          )}
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span className="text-xs">Start: {formatDate(assignment.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span className="text-xs">End: {formatDate(assignment.end_date)}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{calculateDurationDays(assignment.start_date, assignment.end_date)} days</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {assignment.guard?.guard_code ? (
                            <Badge variant="outline" className="border-gray-300">
                              {assignment.guard.guard_code}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {assignment.guard ? (
                            <div className="flex flex-col text-xs">
                              <span>{assignment.guard.phone || "N/A"}</span>
                              <span className="text-gray-500">{assignment.guard.email || ""}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`
                              inline-block
                              min-w-24
                              text-center
                              px-2 py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${getStatusColor(currentStatus)}
                            `}
                          >
                            {getStatusDisplay(currentStatus)}
                          </span>
                        </TableCell>

                        <TableCell className="text-gray-700 dark:text-gray-300 text-sm">
                          {assignment.created_at ? formatDate(assignment.created_at) : "-"}
                        </TableCell>

                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                              <DropdownMenuItem onClick={() => handleViewDetails(assignment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleEdit(e, assignment)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit assignment
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {availableActions.map((action: StatusAction, index: number) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={(e) => handleStatusUpdate(e, assignment, action.status)}
                                  className={action.color}
                                >
                                  <action.icon className="mr-2 h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteClick(e, assignment)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {assignments.length} of {pagination.total} assignments
                {selectedAssignments.length > 0 && (
                  <span className="ml-2 text-blue-600">
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
                <span className="text-sm px-3">
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
