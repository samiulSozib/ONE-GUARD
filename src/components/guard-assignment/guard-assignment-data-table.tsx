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
  MapPin
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

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchAssignments,
  deleteAssignment,
  toggleAssignmentStatus,
} from "@/store/slices/guardAssignmentSlice";
import { GuardAssignment, GuardAssignmentParams } from "@/app/types/guardAssignment";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";

// Status colors mapping
const assignmentStatusColors: Record<string, string> = {
  "assigned": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
  "cancelled": "bg-red-100 text-red-800",
  "pending": "bg-yellow-100 text-yellow-800",
  "in_progress": "bg-purple-100 text-purple-800",
  "default": "bg-gray-100 text-gray-800",
};

interface GuardAssignmentDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (assignment: GuardAssignment) => void;
}

export function GuardAssignmentDataTable({ onAddClick, onViewClick }: GuardAssignmentDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { assignments, pagination, isLoading, error } = useAppSelector((state) => state.guardAssignment);
  
  // Local state
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
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Fetch assignments on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      //include_guard: true,
      //include_duty: true,
    };
    
    dispatch(fetchAssignments(fetchParams));
  }, [dispatch, filters, searchTerm]);

 
  
  // Handle search
  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };
  
  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: GuardAssignmentParams['status']) => {
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
    setTitleSearch("");
    setDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedAssignments([]);
  };
  
  // Handle assignment selection
  const handleSelectAssignment = (assignmentId: number) => {
    setSelectedAssignments(prev =>
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedAssignments.length === assignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(assignments.map((assignment: GuardAssignment) => assignment.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (assignment: GuardAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (assignmentToDelete) {
      try {
        await dispatch(deleteAssignment(assignmentToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Assignment Deleted',
          `Assignment has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setAssignmentToDelete(null);
        
        // Refresh list
        dispatch(fetchAssignments(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the assignment. Please try again.'
        );
      }
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (assignment: GuardAssignment) => {
    try {
      const newStatus = assignment.status === 'active' ? 'inactive' : 'active';
      await dispatch(toggleAssignmentStatus({
        id: assignment.id,
        status: newStatus
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Assignment status has been updated to ${newStatus}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update assignment status. Please try again.'
      );
    }
  };
  
  // Handle view details
  const handleViewDetails = (assignment: GuardAssignment) => {
    setSelectedAssignment(assignment);
    if (onViewClick) onViewClick(assignment);
  };
  
  // Handle edit
  const handleEdit = (assignment: GuardAssignment) => {
    setSelectedAssignment(assignment);
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
  
  // Calculate duration in days
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
  
  // Get status display text
  const getStatusDisplay = (status: string = 'pending') => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'active': 'Active',
      'inactive': 'Inactive',
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedAssignments.length === assignments.length && assignments.length > 0}
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
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Duty Filter */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput placeholder="Duty ID" />
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
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Assignment Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Guard Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Duty Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
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
                          {searchTerm || Object.keys(filters).length > 2
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
                  assignments.map((assignment: GuardAssignment) => (
                    <TableRow
                      key={assignment.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Guard */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{assignment.guard?.full_name || `Guard #${assignment.guard_id}`}</span>
                        </div>
                      </TableCell>

                      {/* Duty */}
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

                      {/* Assignment Period */}
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

                      {/* Duration */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{calculateDurationDays(assignment.start_date, assignment.end_date)} days</span>
                        </div>
                      </TableCell>

                      {/* Guard Code */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {assignment.guard?.guard_code ? (
                          <Badge variant="outline" className="border-gray-300">
                            {assignment.guard.guard_code}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Contact */}
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

                      {/* Duty Type */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {assignment.duty?.duty_type ? (
                          <Badge
                            variant="outline"
                            className={`${
                              assignment.duty.duty_type === 'day' 
                                ? "bg-sky-100 text-sky-800 border-sky-300" 
                                : "bg-indigo-100 text-indigo-800 border-indigo-300"
                            }`}
                          >
                            {assignment.duty.duty_type.charAt(0).toUpperCase() + assignment.duty.duty_type.slice(1)}
                          </Badge>
                        ) : (
                          "-"
                        )}
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
                            ${assignmentStatusColors[assignment.status || 'default'] || assignmentStatusColors.default}
                          `}
                        >
                          {getStatusDisplay(assignment.status)}
                        </span>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-gray-700 dark:text-gray-300 text-sm">
                        {assignment.created_at ? formatDate(assignment.created_at) : "-"}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(assignment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit assignment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(assignment)}
                              className="text-amber-600"
                            >
                              {assignment.status === 'active' || assignment.status === 'assigned' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(assignment)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete assignment
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
      {/* {selectedAssignment && (
        <GuardAssignmentEditForm
          trigger={<div />}
          assignment={selectedAssignment}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchAssignments({
              page: filters.page,
              per_page: filters.per_page,
              search: searchTerm,
              include_guard: true,
              include_duty: true,
            }));
          }}
        />
      )} */}
    </>
  );
}