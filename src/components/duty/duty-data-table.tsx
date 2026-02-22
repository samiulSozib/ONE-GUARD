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
  Building,
  Users,
  MapPin,
  AlertCircle,
  CheckCheck
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
  clearCurrentDuty,
  toggleDutyStatus,
} from "@/store/slices/dutySlice";
import { Duty, DutyParams } from "@/app/types/duty";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyEditForm } from "./duty-edit-form";
import Swal from 'sweetalert2';

// Status colors mapping for duty status
const dutyStatusColors: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "approved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "completed": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const dutyTypeColors: Record<string, string> = {
  day: "bg-sky-100 text-sky-800",
  night: "bg-indigo-100 text-indigo-800",
  default: "bg-gray-100 text-gray-800",
};

interface DutyDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (duty: Duty) => void;
}

export function DutyDataTable({ onAddClick, onViewClick }: DutyDataTableProps) {
  const dispatch = useAppDispatch();
  
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);
  
  // Filter states
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dutyTypeFilter, setDutyTypeFilter] = useState("all");
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Fetch duties on mount and filter changes
  useEffect(() => {
    const fetchParams: DutyParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: searchTerm || undefined,
      include_site: true,
      include_site_location: true,
    };

    // Add site filter
    if (siteFilter !== "all") {
      fetchParams.site_id = parseInt(siteFilter);
    }

    // Add status filter
    if (statusFilter !== "all") {
      fetchParams.status = statusFilter as DutyParams['status'];
    }

    // Add duty type filter
    if (dutyTypeFilter !== "all") {
      fetchParams.duty_type = dutyTypeFilter as DutyParams['duty_type'];
    }

    // Add date filter
    if (dateFilter) {
      const formattedDate = format(dateFilter, 'yyyy-MM-dd');
      // Uncomment if your API supports date filtering
      // fetchParams.start_date = formattedDate;
      // fetchParams.end_date = formattedDate;
    }
    
    dispatch(fetchDuties(fetchParams));
  }, [dispatch, filters.page, searchTerm, siteFilter, statusFilter, dutyTypeFilter, dateFilter]);
  
  // Handle search
  const handleTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleSearch(e.target.value);
  };
  
  const handleTitleSearchSubmit = () => {
    setSearchTerm(titleSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTitleSearch("");
    setDateFilter(undefined);
    setSiteFilter("all");
    setStatusFilter("all");
    setDutyTypeFilter("all");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedDuties([]);
  };
  
  // Handle duty selection
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
  
  // Handle delete
  const handleDeleteClick = (e: React.MouseEvent, duty: Duty) => {
    e.stopPropagation();
    setDutyToDelete(duty);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (dutyToDelete) {
      try {
        await dispatch(deleteDuty(dutyToDelete.id)).unwrap();
        
        await SweetAlertService.success(
          'Duty Deleted',
          `${dutyToDelete.title} has been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );
        
        setDeleteDialogOpen(false);
        setDutyToDelete(null);
        
        // Refresh list
        const fetchParams: DutyParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
          include_site: true,
          include_site_location: true,
        };
        dispatch(fetchDuties(fetchParams));
      } catch (error) {
        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the duty. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    }
  };
  
  // Handle duty status update (pending/approved/completed)
  const handleDutyStatusUpdate = async (e: React.MouseEvent, duty: Duty, newStatus: 'pending' | 'approved' | 'completed') => {
    e.stopPropagation();

    const statusDisplay = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    // Confirmation dialog with 5 second timer
    const result = await Swal.fire({
      title: `Mark Duty as ${statusDisplay}`,
      text: `Are you sure you want to mark "${duty.title}" as ${statusDisplay}? This confirmation will expire in 5 seconds.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'approved' ? '#10b981' : newStatus === 'completed' ? '#3b82f6' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, mark as ${statusDisplay}`,
      cancelButtonText: 'Cancel',
      timer: 5000,
      timerProgressBar: true,
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const resultAction = await dispatch(toggleDutyStatus({ 
          id: duty.id, 
          status: newStatus 
        }));

        if (toggleDutyStatus.fulfilled.match(resultAction)) {
          await SweetAlertService.success(
            'Status Updated',
            `"${duty.title}" has been marked as ${statusDisplay} successfully.`,
            {
              timer: 2000,
              showConfirmButton: false,
              timerProgressBar: true,
            }
          );
        } else {
          await SweetAlertService.error(
            'Update Failed',
            'There was an error updating the duty status. Please try again.',
            {
              timer: 2000,
              showConfirmButton: true,
            }
          );
        }
      } catch (error) {
        await SweetAlertService.error(
          'Update Failed',
          'There was an error updating the duty status. Please try again.',
          {
            timer: 2000,
            showConfirmButton: true,
          }
        );
      }
    } else if (result.dismiss === Swal.DismissReason.timer) {
      // Handle timer expiration
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
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedDuties.length === 0) {
      await SweetAlertService.warning(
        'No Duties Selected',
        'Please select at least one duty to delete.',
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
      text: `Are you sure you want to delete ${selectedDuties.length} selected duty(ies)? This action cannot be undone. This confirmation will expire in 5 seconds.`,
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
        // Show loading state
        await SweetAlertService.loading('Processing...', 'Please wait while we delete the duties.');

        // Delete all selected duties
        for (const dutyId of selectedDuties) {
          await dispatch(deleteDuty(dutyId)).unwrap();
        }

        // Close loading alert
        SweetAlertService.close();

        await SweetAlertService.success(
          'Duties Deleted',
          `${selectedDuties.length} duty(ies) have been deleted successfully.`,
          {
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          }
        );

        setSelectedDuties([]);

        // Refresh the duty list
        const fetchParams: DutyParams = {
          page: filters.page || 1,
          per_page: filters.per_page || 10,
          search: searchTerm || undefined,
          include_site: true,
          include_site_location: true,
        };
        dispatch(fetchDuties(fetchParams));
      } catch (error) {
        // Close loading alert if open
        SweetAlertService.close();

        await SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the duties. Please try again.',
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
  
  // Handle view details
  const handleViewDetails = (duty: Duty) => {
    setSelectedDuty(duty);
    setViewDialogOpen(true);
    if (onViewClick) onViewClick(duty);
  };
  
  // Handle edit
  const handleEdit = (duty: Duty) => {
    setSelectedDuty(duty);
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
  
  // Calculate duration in hours
  const calculateDuration = (start: string, end: string) => {
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const durationMs = endTime.getTime() - startTime.getTime();
      return (durationMs / (1000 * 60 * 60)).toFixed(1);
    } catch (error) {
      return "N/A";
    }
  };
  
  // Get status display text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'approved': 'Approved',
      'completed': 'Completed',
    };
    return statusMap[status] || status;
  };
  
  // Check if status can be changed to target status
  const canChangeTo = (currentStatus: string, targetStatus: string) => {
    if (currentStatus === targetStatus) return false;
    
    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'completed'],
      'approved': ['completed'],
      'completed': [], // Cannot change from completed
    };
    
    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // Export functionality
  const handleExport = async () => {
    await SweetAlertService.success(
      'Export Started',
      'Your duty data export has been initiated.',
      {
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }
    );
  };
  
  // Loading skeleton
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
              checked={selectedDuties.length === duties.length && duties.length > 0}
              onCheckedChange={handleSelectAll}
              className="dark:bg-white dark:border-black"
            />
            <Label htmlFor="select-all">Select All</Label>
          </div>

          {selectedDuties.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto"
            >
              Delete Selected ({selectedDuties.length})
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Title Search Input */}
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Duty Title..." 
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Site Filter */}
            <div className="sm:col-span-2">
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sites</SelectLabel>
                    <SelectItem value="all">All Sites</SelectItem>
                    <SelectItem value="1">Main Office</SelectItem>
                    <SelectItem value="2">Branch A</SelectItem>
                    <SelectItem value="3">Branch B</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Duty Type Filter */}
            <div className="sm:col-span-2">
              <Select value={dutyTypeFilter} onValueChange={setDutyTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Duty Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
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

            {/* Date Filter */}
            <div className="sm:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <FloatingLabelInput
                    className="text-start h-9"
                    label="Date"
                    value={dateFilter ? format(dateFilter, "MM/dd/yyyy") : ""}
                    readOnly
                    postfixIcon={<CalendarIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
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

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 text-center text-red-600">
              Error loading duties: {error}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Guards Required</TableHead>
                  <TableHead>Required Hours</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Check-Out Time</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {duties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No duties found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || siteFilter !== "all" || statusFilter !== "all" || dutyTypeFilter !== "all" || dateFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new duty"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Duty
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  duties.map((duty: Duty) => (
                    <TableRow
                      key={duty.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewDetails(duty)}
                    >
                      {/* Select Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedDuties.includes(duty.id)}
                          onCheckedChange={(checked) =>
                            handleSelectDuty(duty.id, checked as boolean)
                          }
                        />
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {duty.title}
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span>{formatDate(duty.start_datetime)}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(duty.start_datetime)} - {formatTime(duty.end_datetime)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Site */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {duty.site ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{duty.site.site_name}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Location */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {duty.site_location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{duty.site_location.title}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Duty Type */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <Badge
                          variant="outline"
                          className={`${dutyTypeColors[duty.duty_type] || dutyTypeColors.default} border-0`}
                        >
                          {duty.duty_type.charAt(0).toUpperCase() + duty.duty_type.slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Guards Required */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{duty.guards_required}</span>
                        </div>
                      </TableCell>

                      {/* Required Hours */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{duty.required_hours || calculateDuration(duty.start_datetime, duty.end_datetime)}h</span>
                        </div>
                      </TableCell>

                      {/* Check-In Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {duty.start_datetime ? formatTime(duty.start_datetime) : "-"}
                      </TableCell>

                      {/* Check-Out Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {duty.end_datetime ? formatTime(duty.end_datetime) : "-"}
                      </TableCell>

                      {/* Total Hours */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {calculateDuration(duty.start_datetime, duty.end_datetime)}h
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`
                            inline-block
                            w-28
                            text-center
                            px-2 py-1 
                            rounded-full 
                            text-xs 
                            font-medium
                            ${dutyStatusColors[duty.status] || "bg-gray-100 text-gray-800"}
                          `}
                        >
                          {getStatusDisplay(duty.status)}
                        </span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(duty)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(duty)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit duty
                            </DropdownMenuItem>
                            
                            {/* Duty Status Update Options */}
                            {canChangeTo(duty.status, 'approved') && (
                              <DropdownMenuItem
                                onClick={(e) => handleDutyStatusUpdate(e, duty, 'approved')}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Duty
                              </DropdownMenuItem>
                            )}
                            
                            {canChangeTo(duty.status, 'completed') && (
                              <DropdownMenuItem
                                onClick={(e) => handleDutyStatusUpdate(e, duty, 'completed')}
                                className="text-blue-600 focus:text-blue-600"
                              >
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            
                            {duty.status === 'completed' && (
                              <DropdownMenuItem disabled className="text-gray-400">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Cannot change completed duty
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(e, duty)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete duty
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
          {duties.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {duties.length} of {pagination.total} duties
                {selectedDuties.length > 0 && (
                  <span className="ml-2 text-blue-600">
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
          onSuccess={() => {
            // Refresh the list after successful edit
            const fetchParams: DutyParams = {
              page: filters.page || 1,
              per_page: filters.per_page || 10,
              search: searchTerm || undefined,
              include_site: true,
              include_site_location: true,
            };
            dispatch(fetchDuties(fetchParams));
          }}
        />
      )}
    </>
  );
}