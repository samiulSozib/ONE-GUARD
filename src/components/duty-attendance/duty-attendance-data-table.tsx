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
  MapPin,
  Building,
  AlertCircle
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
import { Calendar } from "../ui/calender";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchAttendances,
  deleteAttendance,
  toggleAttendanceStatus,
} from "@/store/slices/dutyAttendenceSlice";
import { DutyAttendance, DutyAttendanceParams } from "@/app/types/dutyAttendance";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";

// Status colors mapping
const attendanceStatusColors: Record<string, string> = {
  "present": "bg-green-100 text-green-800",
  "absent": "bg-red-100 text-red-800",
  "late": "bg-yellow-100 text-yellow-800",
  "early": "bg-blue-100 text-blue-800",
  "on_duty": "bg-purple-100 text-purple-800",
  "off_duty": "bg-gray-100 text-gray-800",
  "pending": "bg-yellow-100 text-yellow-800",
  "approved": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
  "default": "bg-gray-100 text-gray-800",
};

interface DutyAttendanceDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (attendance: DutyAttendance) => void;
}

export function DutyAttendanceDataTable({ onAddClick, onViewClick }: DutyAttendanceDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { attendences, pagination, isLoading, error } = useAppSelector((state) => state.dutyAttendance);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [guardSearch, setGuardSearch] = useState("");
  const [filters, setFilters] = useState<DutyAttendanceParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedAttendances, setSelectedAttendances] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<DutyAttendance | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<DutyAttendance | null>(null);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Fetch attendances on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      include_guard: true,
      include_duty: true,
      include_site: true,
      include_site_location: true,
    };
    
    dispatch(fetchAttendances(fetchParams));
  }, [dispatch, filters, searchTerm]);
  
  // Handle search
  const handleGuardSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuardSearch(e.target.value);
  };
  
  const handleGuardSearchSubmit = () => {
    setSearchTerm(guardSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: DutyAttendanceParams['status']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === prev.status ? undefined : status 
    }));
  };
  
  const handleGuardFilter = (guardId: number | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      guard_id: guardId 
    }));
  };
  
  const handleDutyFilter = (dutyId: number | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      duty_id: dutyId 
    }));
  };
  
  // Handle date filter
  const handleDateChange = (date: Date | undefined) => {
    setDateFilter(date);
    
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFilters(prev => ({
        ...prev,
        page: 1,
        start_date: formattedDate,
        end_date: formattedDate,
      }));
    } else {
      setFilters(prev => {
        const {  ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setGuardSearch("");
    setDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedAttendances([]);
  };
  
  // Handle attendance selection
  const handleSelectAttendance = (attendanceId: number) => {
    setSelectedAttendances(prev =>
      prev.includes(attendanceId)
        ? prev.filter(id => id !== attendanceId)
        : [...prev, attendanceId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedAttendances.length === attendences.length) {
      setSelectedAttendances([]);
    } else {
      setSelectedAttendances(attendences.map((attendance: DutyAttendance) => attendance.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (attendance: DutyAttendance) => {
    setAttendanceToDelete(attendance);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (attendanceToDelete) {
      try {
        await dispatch(deleteAttendance(attendanceToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Attendance Deleted',
          `Attendance record has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setAttendanceToDelete(null);
        
        // Refresh list
        dispatch(fetchAttendances(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the attendance record. Please try again.'
        );
      }
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (attendance: DutyAttendance) => {
    try {
      const newStatus = attendance.status === 'approved' ? 'pending' : 'approved';
      await dispatch(toggleAttendanceStatus({
        id: attendance.id,
        status: newStatus
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Attendance status has been updated to ${newStatus}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update attendance status. Please try again.'
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (attendance: DutyAttendance) => {
    setSelectedAttendance(attendance);
    if (onViewClick) onViewClick(attendance);
  };
  
  // Handle edit
  const handleEdit = (attendance: DutyAttendance) => {
    setSelectedAttendance(attendance);
    setEditDialogOpen(true);
  };
  
  // Format date and time
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
  
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format minutes to hours and minutes
  const formatWorkingMinutes = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get status display text
  const getStatusDisplay = (status: string = 'pending') => {
    const statusMap: Record<string, string> = {
      'present': 'Present',
      'absent': 'Absent',
      'late': 'Late',
      'early': 'Early',
      'on_duty': 'On Duty',
      'off_duty': 'Off Duty',
      'pending': 'Pending',
      'approved': 'Approved',
      'completed': 'Completed',
      'in_progress': 'In Progress',
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Export functionality
  const handleExport = () => {
    SweetAlertService.info(
      'Export Feature',
      'Export functionality will be implemented soon.'
    );
  };
  
  // Loading skeleton
  if (isLoading && attendences.length === 0) {
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedAttendances.length === attendences.length && attendences.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Guard Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Search by guard name..." 
                  value={guardSearch}
                  onChange={handleGuardSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuardSearchSubmit()}
                />
                <InputGroupAddon onClick={handleGuardSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Duty Filter */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput placeholder="Duty Title" />
                <InputGroupAddon>
                  <Shield />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Date Filter */}
            <div className="sm:col-span-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Attendance Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Site & Location</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Check-Out Time</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Attendance Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {attendences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No attendance records found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || Object.keys(filters).length > 2
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new attendance record"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Attendance
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendences.map((attendance: DutyAttendance) => (
                    <TableRow
                      key={attendance.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Guard */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div>{attendance.guard?.full_name || `Guard #${attendance.guard?.guard_code}`}</div>
                            <div className="text-xs text-gray-500">
                              {attendance.guard?.guard_code || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Duty */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {attendance.duty ? (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <span className="truncate max-w-[150px]" title={attendance.duty.title}>
                              {attendance.duty.title || `Duty #${attendance.duty_id}`}
                            </span>
                          </div>
                        ) : (
                          <span>Duty #{attendance.duty_id}</span>
                        )}
                      </TableCell>

                      {/* Site & Location */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          {attendance.site?.site_name ? (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-gray-500" />
                              <span className="text-xs">{attendance.site.site_name}</span>
                            </div>
                          ) : null}
                          {attendance.site_location?.title ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span className="text-xs">{attendance.site_location.title}</span>
                            </div>
                          ) : null}
                          {!attendance.site?.site_name && !attendance.site_location?.title && (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Check-In Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {attendance.check_in_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <div className="flex flex-col">
                              <span>{formatDate(attendance.check_in_time)}</span>
                              <span className="text-xs text-gray-500">
                                {formatTime(attendance.check_in_time)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="border-gray-300 text-gray-400">
                            Not Checked In
                          </Badge>
                        )}
                      </TableCell>

                      {/* Check-Out Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {attendance.check_out_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <div className="flex flex-col">
                              <span>{formatDate(attendance.check_out_time)}</span>
                              <span className="text-xs text-gray-500">
                                {formatTime(attendance.check_out_time)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="border-gray-300 text-gray-400">
                            Not Checked Out
                          </Badge>
                        )}
                      </TableCell>

                      {/* Working Hours */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{formatWorkingMinutes(attendance.total_working_minutes)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
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
                            ${attendanceStatusColors[attendance.status || 'default'] || attendanceStatusColors.default}
                          `}
                        >
                          {getStatusDisplay(attendance.status)}
                        </span>
                      </TableCell>

                      {/* Remarks */}
                      <TableCell className="text-gray-700 dark:text-gray-300 text-sm max-w-[200px]">
                        {attendance.remarks ? (
                          <div className="truncate" title={attendance.remarks}>
                            {attendance.remarks}
                          </div>
                        ) : (
                          <span className="text-gray-400">No remarks</span>
                        )}
                      </TableCell>

                      {/* Attendance Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300 text-sm">
                        {attendance.created_at ? formatDate(attendance.created_at) : "-"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(attendance)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(attendance)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit attendance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(attendance)}
                              className="text-amber-600"
                            >
                              {attendance.status === 'approved' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark as Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(attendance)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete attendance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {attendences.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {attendences.length} of {pagination.total} attendance records
                {selectedAttendances.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedAttendances.length} selected)
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
        title="Delete Attendance Record"
        description={`Are you sure you want to delete this attendance record? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {/* {selectedAttendance && (
        <DutyAttendanceEditForm
          trigger={<div />}
          attendance={selectedAttendance}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchAttendances({
              page: filters.page,
              per_page: filters.per_page,
              search: searchTerm,
              include_guard: true,
              include_duty: true,
              include_site: true,
              include_site_location: true,
            }));
          }}
        />
      )} */}
    </>
  );
}