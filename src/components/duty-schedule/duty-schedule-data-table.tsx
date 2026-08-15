// components/duty-schedule/duty-schedule-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import {
  EllipsisVertical,
  Search,
  Pencil,
  Trash2,
  ListFilter,
  File,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Building,
  Users,
  Repeat,
  Eye,
} from "lucide-react";
import {
  Card,
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
  fetchDutySchedules,
  deleteDutySchedule,
  toggleDutyScheduleStatus,
} from "@/store/slices/duty-schedule.slice";
import { fetchSites } from "@/store/slices/siteSlice";
import { DutySchedule, DutyScheduleParams } from "@/app/types/duty-schedule";
import { Site } from "@/app/types/site";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyScheduleShow } from '@/components/duty-schedule/duty-schedule-show';
import { DutyScheduleEditForm } from '@/components/duty-schedule/duty-schedule-edit-form';


// Schedule type labels
const scheduleTypeLabels: Record<string, string> = {
  one_time: "One Time",
  recurring: "Recurring",
};

// Status colors
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

// Recurrence frequency labels
const recurrenceLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

interface DutyScheduleDataTableProps {
  onAddClick?: () => void;
}

export function DutyScheduleDataTable({ onAddClick }: DutyScheduleDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { items, pagination, isLoading } = useAppSelector(
    (state) => state.dutySchedule
  );
  const { sites } = useAppSelector((state) => state.site);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<DutyScheduleParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DutySchedule | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DutySchedule | null>(null);
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [itemToShow, setItemToShow] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchSites({ page: 1, per_page: 100, is_active: true }));
  }, [dispatch]);

  // Fetch items on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    dispatch(fetchDutySchedules(fetchParams));
  }, [dispatch, filters, searchTerm]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleSiteFilter = (siteId: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      site_id: siteId === "all" ? undefined : parseInt(siteId)
    }));
  };

  const handleScheduleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      schedule_type: type === "all" ? undefined : type as 'one_time' | 'recurring'
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      status: status === "all" ? undefined : status
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedItems([]);
  };

  // Handle selection
  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item: DutySchedule) => item.id));
    }
  };

  // Handle view
  const handleView = (id: number) => {
    setItemToShow(id);
    setShowDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (item: DutySchedule) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (item: DutySchedule) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteDutySchedule(itemToDelete.id)).unwrap();

        SweetAlertService.success(
          'Schedule Deleted',
          `Schedule has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setItemToDelete(null);

        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchDutySchedules(fetchParams));
      } catch (error: any) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the schedule. Please try again.'
        );
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (item: DutySchedule) => {
    try {
      const newStatus = !item.is_active;
      await dispatch(toggleDutyScheduleStatus({
        id: item.id,
        isActive: newStatus
      })).unwrap();

      SweetAlertService.success(
        'Status Updated',
        `Schedule has been ${newStatus ? 'activated' : 'deactivated'}.`
      );

      const fetchParams = {
        ...filters,
        search: searchTerm || undefined,
      };
      dispatch(fetchDutySchedules(fetchParams));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update schedule status. Please try again.'
      );
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Get site name
  const getSiteName = (id: number) => {
    const site = sites.find(s => s.id === id);
    return site?.site_name || site?.title || "N/A";
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get schedule type badge
  const getScheduleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      one_time: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      recurring: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return (
      <Badge variant="outline" className={`${colors[type] || "bg-gray-100"} border-0`}>
        {scheduleTypeLabels[type] || type}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="outline" className={`${statusColors[status] || "bg-gray-100"} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get recurrence display
  const getRecurrenceDisplay = (item: DutySchedule) => {
    if (item.schedule_type === 'one_time') return "One Time";
    if (!item.recurrence_frequency) return "N/A";

    let display = recurrenceLabels[item.recurrence_frequency] || item.recurrence_frequency;
    if (item.recurrence_interval && item.recurrence_interval > 1) {
      display += ` (Every ${item.recurrence_interval} ${item.recurrence_frequency}s)`;
    }
    if (item.recurrence_days && item.recurrence_days.length > 0) {
      const dayLabels = item.recurrence_days.map(d => d.substring(0, 3));
      display += ` - ${dayLabels.join(', ')}`;
    }
    return display;
  };

  // Loading skeleton
  if (isLoading && items.length === 0) {
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
                <Skeleton className="h-6 w-16" />
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox
              id="terms"
              className="dark:bg-white dark:border-black"
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 py-3">
            <div className="sm:col-span-3">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="sm:col-span-3">
              <Select
                value={filters.site_id?.toString() || "all"}
                onValueChange={handleSiteFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sites</SelectLabel>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map((site: Site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.site_name || site.title || `Site ${site.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Select
                value={filters.schedule_type || "all"}
                onValueChange={handleScheduleTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Schedule Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
              {onAddClick && (
                <Button
                  size="sm"
                  onClick={onAddClick}
                  className="bg-[#5F0015] hover:bg-blue-700 text-white"
                >
                  Add Schedule
                </Button>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === items.length && items.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Guards</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No duty schedules found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.site_id || filters.schedule_type
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new schedule"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Schedule
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: DutySchedule) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* Select Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>

                      {/* Title */}
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {item.description}
                          </div>
                        )}
                      </TableCell>

                      {/* Site */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{getSiteName(item.site_id)}</span>
                        </div>
                      </TableCell>

                      {/* Schedule Type */}
                      <TableCell>
                        {getScheduleTypeBadge(item.schedule_type)}
                      </TableCell>

                      {/* Schedule Details */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          {item.schedule_type === 'recurring' && (
                            <Repeat className="h-3 w-3 text-gray-500" />
                          )}
                          <span className="text-xs">
                            {item.schedule_type === 'one_time'
                              ? formatDate(item.start_date)
                              : getRecurrenceDisplay(item)
                            }
                          </span>
                        </div>
                        {item.schedule_type === 'recurring' && (
                          <div className="text-xs text-gray-500">
                            {formatDate(item.start_date)} - {formatDate(item.end_date) || 'Open'}
                          </div>
                        )}
                      </TableCell>

                      {/* Time */}
                      <TableCell className="text-gray-700 dark:text-gray-300 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                        </div>
                      </TableCell>

                      {/* Guards */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{item.guards_required}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(item.status)}
                          {item.is_active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0 text-xs">
                              <CheckCircle className="h-2 w-2 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0 text-xs">
                              <XCircle className="h-2 w-2 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
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
                            <DropdownMenuItem onClick={() => handleView(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.is_active ? (
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(item)}
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
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} schedules
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedItems.length} selected)
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
        title="Delete Schedule"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Show Dialog */}
      {itemToShow && (
        <DutyScheduleShow
          trigger={<div />}
          id={itemToShow}
          isOpen={showDialogOpen}
          onOpenChange={setShowDialogOpen}
        />
      )}

      {/* Edit Form Dialog */}
      {selectedItem && (
        <DutyScheduleEditForm
          trigger={<div />}
          item={selectedItem}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchDutySchedules(fetchParams));
          }}
        />
      )}
    </>
  );
}
