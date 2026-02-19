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
import { Calendar } from "../ui/calender";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchDuties,
  deleteDuty,
  toggleDutyStatus,
  clearCurrentDuty,
} from "@/store/slices/dutySlice";
import { Duty, DutyParams } from "@/app/types/duty";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyEditForm } from "./duty-edit-form";

// Status colors mapping
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const dutyStatusColors: Record<string, string> = {
  "Shift completed": "bg-green-500 text-white",
  "Late": "bg-yellow-300 text-yellow-800",
  "On Duty": "bg-green-300 text-green-700",
  "In Progress": "bg-yellow-200 text-yellow-500",
  "Missed Check-in": "bg-red-300 text-red-500",
  "pending": "bg-yellow-100 text-yellow-800",
  "approved": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
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
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    // State for edit dialog
  
  // Fetch duties on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
      include_site: true,
      include_site_location: true,
    };
    
    dispatch(fetchDuties(fetchParams));
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
  const handleStatusFilter = (status: DutyParams['status']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === prev.status ? undefined : status 
    }));
  };
  
  const handleDutyTypeFilter = (dutyType: DutyParams['duty_type']) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      duty_type: dutyType === prev.duty_type ? undefined : dutyType 
    }));
  };
  
  const handleActiveFilter = (isActive: boolean | null) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      is_active: isActive === null ? undefined : isActive 
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
    setSelectedDuties([]);
  };
  
  // Handle duty selection
  const handleSelectDuty = (dutyId: number) => {
    setSelectedDuties(prev =>
      prev.includes(dutyId)
        ? prev.filter(id => id !== dutyId)
        : [...prev, dutyId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedDuties.length === duties.length) {
      setSelectedDuties([]);
    } else {
      setSelectedDuties(duties.map((duty:Duty) => duty.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (duty: Duty) => {
    setDutyToDelete(duty);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (dutyToDelete) {
      try {
        await dispatch(deleteDuty(dutyToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Duty Deleted',
          `${dutyToDelete.title} has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );
        
        setDeleteDialogOpen(false);
        setDutyToDelete(null);
        
        // Refresh list
        dispatch(fetchDuties(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the duty. Please try again.'
        );
      }
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (duty: Duty) => {
    try {
      await dispatch(toggleDutyStatus({
        id: duty.id,
        is_active: !duty.is_active
      })).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `Duty status has been ${!duty.is_active ? 'activated' : 'deactivated'}.`
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update duty status. Please try again.'
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
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status;
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
        {/* Top Header Section - Exact match to original */}
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
              checked={selectedDuties.length === duties.length && duties.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section - Exact match to original layout */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Title Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Title" 
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
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput placeholder="Site" />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Date Filter */}
            <div className="sm:col-span-4">
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
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table Section - Updated with dynamic data */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={12} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No duties found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || Object.keys(filters).length > 2
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
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
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
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem onClick={() => handleViewDetails(duty)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => handleEdit(duty)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit duty
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem
                              onClick={() => handleToggleStatus(duty)}
                              className="text-amber-600"
                            >
                              {duty.is_active ? (
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
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(duty)}
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
                trigger={<div />} // Hidden trigger since we control via state
                duty={selectedDuty}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={() => {
                  // Refresh the list after successful edit
                  dispatch(fetchDuties({
                    page: 1,
                    per_page: 10,
                    search: searchTerm
                  }));
                }}
              />
            )}
    </>
  );
}