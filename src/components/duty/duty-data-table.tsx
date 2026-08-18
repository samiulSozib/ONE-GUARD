// components/duty/duty-data-table.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CheckCheck,
  Shield,
  Calendar,
  Globe,
  User,
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

// Status colors mapping
const dutyStatusColors: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "approved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "completed": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const coverageStatusColors: Record<string, string> = {
  "unassigned": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  "partial": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
  "covered": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  "not_required": "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
};

interface DutyDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (duty: Duty) => void;
}

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

  // Navigate to duty view page
  const handleViewDetails = (duty: Duty) => {
    router.push(`/duty/${duty.id}`);
  };

  // Also support the onViewClick prop for custom handling
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
    switch(status) {
      case 'covered': return <CheckCircle className="h-3 w-3" />;
      case 'partial': return <AlertCircle className="h-3 w-3" />;
      case 'unassigned': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
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
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search by duty title..."
                  value={titleSearch}
                  onChange={handleTitleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleTitleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="sm:col-span-2">
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-full">
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

            <div className="sm:col-span-2">
              <Select value={coverageFilter} onValueChange={setCoverageFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Coverage</SelectLabel>
                    <SelectItem value="all">All Coverage</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

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
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-12 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

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
                  <TableHead>Duty Title & Site</TableHead>
                  <TableHead>Scheduled Time (Site Time)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Guards</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {duties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No duties found
                        </h3>
                        <p className="text-gray-500 mb-4">
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
                  duties.map((duty: Duty) => (
                    <TableRow
                      key={duty.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleViewClick(duty)}
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

                      {/* Duty Title & Site */}
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {duty.title}
                            </span>
                          </div>
                          {duty.site && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Building className="h-3 w-3" />
                              <span>{duty.site.site_name}</span>
                              {duty.site.address && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs">{duty.site.address}</span>
                                </>
                              )}
                            </div>
                          )}
                          {duty.duty_schedule && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              Schedule: {duty.duty_schedule.title}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Scheduled Time (Site Time) */}
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium">
                              {formatDate(duty.start_datetime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {formatTime(duty.start_datetime)} - {formatTime(duty.end_datetime)}
                            </span>
                          </div>
                          {duty.site?.timezone && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <Globe className="h-3 w-3" />
                              <span>{duty.site.timezone}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {calculateDuration(duty.start_datetime, duty.end_datetime)} hours
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            duty.source_type === 'scheduled'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                              : duty.source_type === 'one_time'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300'
                          } border-0`}
                        >
                          {duty.source_type === 'scheduled' ? 'Scheduled' :
                           duty.source_type === 'one_time' ? 'One Time' :
                           duty.source_type === 'exception' ? 'Exception' : 'Manual'}
                        </Badge>
                      </TableCell>

                      {/* Guards */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {duty.assigned_guards_count || 0}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>{duty.guards_required}</span>
                        </div>
                      </TableCell>

                      {/* Coverage */}
                      <TableCell>
                        <Badge
                          className={`${
                            coverageStatusColors[duty.coverage_status || 'unassigned']
                          } border-0 px-2 py-1 flex items-center gap-1 w-fit`}
                        >
                          {getCoverageIcon(duty.coverage_status || 'unassigned')}
                          {getCoverageStatusDisplay(duty.coverage_status || 'unassigned')}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={`${
                            dutyStatusColors[duty.status] || 'bg-gray-100 text-gray-800'
                          } border-0 px-3 py-1`}
                        >
                          {getStatusDisplay(duty.status)}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => handleViewClick(duty)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(duty)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit duty
                            </DropdownMenuItem>

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
          onSuccess={refreshList}
        />
      )}
    </>
  );
}
