"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Building,
  CheckCircle,
  Clock,
  DownloadIcon,
  EllipsisVertical,
  File,
  FileSpreadsheet,
  FileText,
  ListFilter,
  Loader2,
  MapPin,
  Pencil,
  Search,
  Shield,
  Trash2,
  User,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Redux
import {
  DutyAttendance,
  DutyAttendanceExportFormat,
  DutyAttendanceParams,
} from "@/app/types/dutyAttendance";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  deleteAttendance,
  fetchAttendances,
  toggleAttendanceStatus,
} from "@/store/slices/dutyAttendenceSlice";
import { dutyAttendanceService } from "@/service/dutyAttendence.service";
import ShiftEntitySearchSelect from "@/components/shift-operations/shift-entity-search-select";

// Components
import SweetAlertService from "@/lib/sweetAlert";
import { DeleteDialog } from "../shared/delete-dialog";

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

  // Draft filters
  const [searchInput, setSearchInput] = useState("");
  const [guardId, setGuardId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState("all");
  const [attendanceState, setAttendanceState] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState<DutyAttendanceExportFormat | null>(null);

  const [filters, setFilters] = useState<DutyAttendanceParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedAttendances, setSelectedAttendances] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<DutyAttendance | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<DutyAttendance | null>(null);

  const buildFetchParams = (next: DutyAttendanceParams = filters): DutyAttendanceParams => ({
    ...next,
    include_guard: true,
    include_duty: true,
    include_site: true,
    include_site_location: true,
  });

  useEffect(() => {
    dispatch(fetchAttendances(buildFetchParams(filters)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  const handleApplyFilters = () => {
    setFilters({
      page: 1,
      per_page: 10,
      search: searchInput.trim() || undefined,
      guard_id: guardId ? Number(guardId) : undefined,
      site_id: siteId ? Number(siteId) : undefined,
      status: status === "all" ? undefined : status,
      attendance_state: attendanceState === "all" ? undefined : attendanceState,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setGuardId("");
    setSiteId("");
    setStatus("all");
    setAttendanceState("all");
    setDateFrom("");
    setDateTo("");
    setSelectedAttendances([]);
    setFilters({
      page: 1,
      per_page: 10,
    });
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
        dispatch(fetchAttendances(buildFetchParams(filters)));
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

  const handleExport = async (format: DutyAttendanceExportFormat) => {
    try {
      setExporting(format);
      await dutyAttendanceService.exportAttendances(format, {
        search: filters.search,
        guard_id: filters.guard_id,
        site_id: filters.site_id,
        status: filters.status,
        attendance_state: filters.attendance_state,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      SweetAlertService.success("Exported", `Attendance ${format.toUpperCase()} downloaded.`);
    } catch (e: any) {
      SweetAlertService.error("Export failed", e?.message || "Could not export attendance.");
    } finally {
      setExporting(null);
    }
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CardTitle className="text-sm flex items-center gap-1 dark:text-black cursor-pointer hover:opacity-80">
                {exporting ? <Loader2 size="14px" className="animate-spin" /> : <DownloadIcon size="14px" />}
                Export
              </CardTitle>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleExport("csv")} disabled={!!exporting}>
                <DownloadIcon className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} disabled={!!exporting}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={!!exporting}>
                <FileText className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          <div className="grid grid-cols-1 gap-3 border-b px-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Search</label>
              <Input
                placeholder="Officer, duty, site, remarks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Guard</label>
              <ShiftEntitySearchSelect field="guard_id" value={guardId} onChange={setGuardId} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Site</label>
              <ShiftEntitySearchSelect field="site_id" value={siteId} onChange={setSiteId} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Attendance state</label>
              <Select value={attendanceState} onValueChange={setAttendanceState}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="not_checked_in">Not checked in</SelectItem>
                  <SelectItem value="checked_in">Checked in</SelectItem>
                  <SelectItem value="checked_out">Checked out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date from</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date to</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-1">
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
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
                          {filters.search || filters.guard_id || filters.site_id || filters.date_from || filters.status
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
                            <div>{attendance.guard?.full_name || `Officer #${attendance.guard?.guard_code}`}</div>
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
                            {/* <DropdownMenuItem onClick={() => handleViewDetails(attendance)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem> */}
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
