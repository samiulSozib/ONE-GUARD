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
  Building,
  Calendar
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
  fetchLeaves,
  deleteLeave,
  updateLeaveStatus,
  clearCurrentLeave,
} from "@/store/slices/leaveSlice";
import { Leave, LeaveParams } from "@/app/types/leave";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { LeaveViewDialog } from "./leave-view";

// Status colors mapping
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

// Leave type colors
const leaveTypeColors: Record<string, string> = {
  sick: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  annual: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  casual: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  emergency: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  unpaid: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  maternity: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  paternity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  bereavement: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

interface LeaveDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (leave: Leave) => void;
}

export function LeaveDataTable({ onAddClick, onViewClick }: LeaveDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { leaves, pagination, isLoading, error } = useAppSelector((state) => state.leave);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [guardSearch, setGuardSearch] = useState("");
  const [filters, setFilters] = useState<LeaveParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedLeaves, setSelectedLeaves] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  
  // Date filter state
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);

  // Fetch leaves on mount and filter changes
  useEffect(() => {
    const fetchParams: LeaveParams = {
      ...filters,
      search: searchTerm || undefined,
      include_site: true,
      include_reviewer: true,
    };
    
    // Add date filters if set
    if (startDateFilter) {
      fetchParams.from_date = format(startDateFilter, 'yyyy-MM-dd');
    }
    if (endDateFilter) {
      fetchParams.to_date = format(endDateFilter, 'yyyy-MM-dd');
    }
    
    dispatch(fetchLeaves(fetchParams));
  }, [dispatch, filters, searchTerm, startDateFilter, endDateFilter]);
  
  // Handle search
  const handleGuardSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuardSearch(e.target.value);
  };
  
  const handleGuardSearchSubmit = () => {
    setSearchTerm(guardSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: LeaveParams['status']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === prev.status ? undefined : status 
    }));
  };
  
  const handleLeaveTypeFilter = (leaveType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      leave_type: leaveType === prev.leave_type ? undefined : leaveType 
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setGuardSearch("");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedLeaves([]);
  };
  
  // Handle leave selection
  const handleSelectLeave = (leaveId: number) => {
    setSelectedLeaves(prev =>
      prev.includes(leaveId)
        ? prev.filter(id => id !== leaveId)
        : [...prev, leaveId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedLeaves.length === leaves.length) {
      setSelectedLeaves([]);
    } else {
      setSelectedLeaves(leaves.map((leave: Leave) => leave.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (leave: Leave) => {
    setLeaveToDelete(leave);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (leaveToDelete) {
      try {
        await dispatch(deleteLeave(leaveToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Leave Deleted',
          `Leave request has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setLeaveToDelete(null);
        
        // Refresh list
        dispatch(fetchLeaves(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the leave request. Please try again.'
        );
      }
    }
  };
  
  // Handle status update (approve/reject)
  const handleStatusUpdate = async (leave: Leave, status: 'approved' | 'rejected') => {
    try {
      await dispatch(updateLeaveStatus({
        id: leave.id,
        payload: {
          status,
          review_note: status === 'approved' 
            ? 'Approved by admin' 
            : 'Rejected by admin'
        }
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Leave request has been ${status}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        `Failed to ${status} leave request. Please try again.`
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(leave);
  };
  
  // Handle edit
  const handleEdit = (leave: Leave) => {
    setSelectedLeave(leave);
    setEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
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
  
  // Calculate duration in days
  const calculateDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const durationMs = endTime.getTime() - startTime.getTime();
      const days = durationMs / (1000 * 60 * 60 * 24);
      return days.toFixed(1);
    } catch (error) {
      return "N/A";
    }
  };
  
  // Get status display text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
    };
    return statusMap[status] || status;
  };
  
  // Get leave type display
  const getLeaveTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'sick': 'Sick Leave',
      'annual': 'Annual Leave',
      'casual': 'Casual Leave',
      'emergency': 'Emergency Leave',
      'unpaid': 'Unpaid Leave',
      'maternity': 'Maternity Leave',
      'paternity': 'Paternity Leave',
      'bereavement': 'Bereavement Leave',
    };
    return typeMap[type] || type;
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
  if (isLoading && leaves.length === 0) {
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
              id="terms" 
              className="dark:bg-white dark:border-black"
              checked={selectedLeaves.length === leaves.length && leaves.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select All</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Guard Name Search */}
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Guard Name or ID..." 
                  value={guardSearch}
                  onChange={handleGuardSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuardSearchSubmit()}
                />
                <InputGroupAddon onClick={handleGuardSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Leave Type Filter */}
            <div className="sm:col-span-3">
              <Select onValueChange={handleLeaveTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Types</SelectLabel>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select onValueChange={(value) => handleStatusFilter(value as LeaveParams['status'])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Status</SelectLabel>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Start Date"
                    value={startDateFilter ? format(startDateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDateFilter}
                    onSelect={setStartDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="End Date"
                    value={endDateFilter ? format(endDateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDateFilter}
                    onSelect={setEndDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-2 flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedLeaves.length === leaves.length && leaves.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No leave requests found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || startDateFilter || endDateFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new leave request"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Leave Request
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave: Leave) => (
                    <TableRow
                      key={leave.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewDetails(leave)}
                    >
                      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedLeaves.includes(leave.id)}
                          onCheckedChange={() => handleSelectLeave(leave.id)}
                        />
                      </TableCell>
                      
                      {/* Guard */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Guard #{leave.guard_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Site */}
                      <TableCell>
                        {leave.site ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm truncate max-w-[150px]">
                              {leave.site.site_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Leave Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${leaveTypeColors[leave.leave_type] || leaveTypeColors.default} border-0`}
                        >
                          {getLeaveTypeDisplay(leave.leave_type)}
                        </Badge>
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{calculateDuration(leave.start_date, leave.end_date)} days</span>
                        </div>
                      </TableCell>

                      {/* Start Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {formatDate(leave.start_date)}
                        <div className="text-xs text-gray-500">
                          {formatTime(leave.start_date)}
                        </div>
                      </TableCell>

                      {/* End Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {formatDate(leave.end_date)}
                        <div className="text-xs text-gray-500">
                          {formatTime(leave.end_date)}
                        </div>
                      </TableCell>

                      {/* Days */}
                      <TableCell className="text-gray-700 dark:text-gray-300 font-medium">
                        {leave.total_days || calculateDuration(leave.start_date, leave.end_date)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`
                            inline-block
                            w-20
                            text-center
                            px-2 py-1 
                            rounded-full 
                            text-xs 
                            font-medium
                            ${statusColors[leave.status] || "bg-gray-100 text-gray-800"}
                          `}
                        >
                          {getStatusDisplay(leave.status)}
                        </span>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(leave.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(leave)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(leave)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit leave
                            </DropdownMenuItem>
                            
                            {leave.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(leave, 'approved')}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(leave, 'rejected')}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(leave)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
          {leaves.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} leave requests
                {selectedLeaves.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedLeaves.length} selected)
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
        title="Delete Leave Request"
        description={`Are you sure you want to delete this leave request? This action cannot be undone.`}
      />

      {/* View Dialog */}
      {/* <LeaveViewDialog
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        leave={selectedLeave}
      /> */}

      {/* Edit Form Dialog */}
      {/* {selectedLeave && (
        <LeaveEditForm
          trigger={<div />}
          leave={selectedLeave}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchLeaves({
              page: 1,
              per_page: 10,
              search: searchTerm
            }));
          }}
        />
      )} */}
    </>
  );
}