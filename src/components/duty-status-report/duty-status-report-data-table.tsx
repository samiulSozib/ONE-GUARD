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
  MapPin,
  MessageSquare,
  User,
  Shield,
  Check,
  X,
  Globe,
  EyeOff
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
  fetchReports,
  deleteReport,
  toggleVisibility,
} from "@/store/slices/dutyStatusReportSlice";
import { DutyStatusReport, DutyStatusReportParams } from "@/app/types/dutyStatusReport";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { DutyStatusReportEditForm } from "./duty-status-report-edit-form";

// Status colors mapping
const statusColors: Record<string, string> = {
  true: "bg-green-100 text-green-800",
  false: "bg-red-100 text-red-800",
};

const visibilityColors: Record<string, string> = {
  true: "bg-blue-100 text-blue-800",
  false: "bg-gray-100 text-gray-800",
};

interface DutyStatusReportDataTableProps {
  onViewClick?: (report: DutyStatusReport) => void;
  onEditClick?: (report: DutyStatusReport) => void;
}

export function DutyStatusReportDataTable({ onViewClick, onEditClick }: DutyStatusReportDataTableProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const { reports, pagination, isLoading } = useAppSelector((state) => state.dutyStatusReport);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [filters, setFilters] = useState<DutyStatusReportParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<DutyStatusReport | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<DutyStatusReport | null>(null);

  // Date filter state
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Fetch reports on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };

    dispatch(fetchReports(fetchParams));
  }, [dispatch, filters, searchTerm]);

  // Handle search
  const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageSearch(e.target.value);
  };

  const handleMessageSearchSubmit = () => {
    setSearchTerm(messageSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleStatusFilter = (isOk: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      is_ok: isOk === null ? undefined : isOk
    }));
  };

  const handleVisibilityFilter = (visibleToClient: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      visible_to_client: visibleToClient === null ? undefined : visibleToClient
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
        const { start_date, end_date, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setMessageSearch("");
    setDateFilter(undefined);
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedReports([]);
  };

  // Handle report selection
  const handleSelectReport = (reportId: number) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map((report: DutyStatusReport) => report.id));
    }
  };

  // Handle delete
  const handleDeleteClick = (report: DutyStatusReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete) {
      try {
        await dispatch(deleteReport(reportToDelete.id)).unwrap();

        SweetAlertService.success(
          'Report Deleted',
          `Report has been deleted successfully.`,
          {
            timer: 1500,
            showConfirmButton: false,
          }
        );

        setDeleteDialogOpen(false);
        setReportToDelete(null);

        // Refresh list
        dispatch(fetchReports(filters));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the report. Please try again.'
        );
      }
    }
  };

  // Handle visibility toggle
  const handleToggleVisibility = async (report: DutyStatusReport) => {
    try {
      await dispatch(toggleVisibility({
        id: report.id,
        visible_to_client: !report.visible_to_client
      })).unwrap();

      SweetAlertService.success(
        'Visibility Updated',
        `Report visibility has been ${!report.visible_to_client ? 'enabled' : 'disabled'} for clients.`
      );
      
      // Refresh the list to show updated data
      dispatch(fetchReports(filters));
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update report visibility. Please try again.'
      );
    }
  };

  // Handle edit
  const handleEdit = (report: DutyStatusReport) => {
    setSelectedReportForEdit(report);
    setEditDialogOpen(true);
  };

  // Format date and time
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

  // Truncate message
  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Get status display
  const getStatusDisplay = (isOk: boolean) => {
    return isOk ? "All OK" : "Issue Reported";
  };

  // Get guard name
  const getGuardName = (report: DutyStatusReport) => {
    return report.guard?.full_name || `Guard #${report.guard_id || 'N/A'}`;
  };

  // Get duty title
  const getDutyTitle = (report: DutyStatusReport) => {
    return report.duty?.title || `Duty #${report.duty_id || 'N/A'}`;
  };

  // Get media count
  const getMediaCount = (report: DutyStatusReport) => {
    return report.media?.length || 0;
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
  if (isLoading && reports.length === 0) {
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
              checked={selectedReports.length === reports.length && reports.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="terms">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
            {/* Message Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search messages..."
                  value={messageSearch}
                  onChange={handleMessageSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleMessageSearchSubmit()}
                />
                <InputGroupAddon onClick={handleMessageSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <Button
                  variant={filters.is_ok === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(filters.is_ok === true ? null : true)}
                >
                  <Check className="mr-1 h-3 w-3" />
                  OK
                </Button>
                <Button
                  variant={filters.is_ok === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(filters.is_ok === false ? null : false)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Issues
                </Button>
              </div>
            </div>

            {/* Visibility Filter */}
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <Button
                  variant={filters.visible_to_client === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVisibilityFilter(filters.visible_to_client === true ? null : true)}
                >
                  <Globe className="mr-1 h-3 w-3" />
                  Visible
                </Button>
                <Button
                  variant={filters.visible_to_client === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVisibilityFilter(filters.visible_to_client === false ? null : false)}
                >
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hidden
                </Button>
              </div>
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

          {/* Clear Filters Button */}
          {(searchTerm || filters.is_ok !== undefined || filters.visible_to_client !== undefined || dateFilter) && (
            <div className="px-4 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No reports found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || Object.keys(filters).length > 2
                            ? "Try adjusting your search or filters"
                            : "No duty status reports available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: DutyStatusReport) => (
                    <TableRow
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-black"
                    >
                      {/* ID */}
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        #{report.id}
                      </TableCell>

                      {/* Guard */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{getGuardName(report)}</span>
                          {report.guard?.guard_code && (
                            <Badge variant="outline" className="text-xs">
                              {report.guard.guard_code}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Duty */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium">{getDutyTitle(report)}</span>
                          {report.duty?.duty_type && (
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${report.duty.duty_type === 'night'
                                  ? 'bg-indigo-100 text-indigo-800 border-0'
                                  : 'bg-sky-100 text-sky-800 border-0'
                                }`}
                            >
                              {report.duty.duty_type.charAt(0).toUpperCase() + report.duty.duty_type.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Message */}
                      <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{truncateMessage(report.message)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusColors[report.is_ok.toString()]} border-0 flex items-center gap-1`}
                        >
                          {report.is_ok ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {getStatusDisplay(report.is_ok)}
                        </Badge>
                      </TableCell>

                      {/* Visibility */}
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={report.visible_to_client}
                            onCheckedChange={() => handleToggleVisibility(report)}
                            className="mr-2"
                          />
                          <Badge
                            variant="outline"
                            className={`${visibilityColors[report.visible_to_client.toString()]} border-0`}
                          >
                            {report.visible_to_client ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {report.latitude && report.longitude ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-xs">
                              {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No location</span>
                        )}
                      </TableCell>

                      {/* Media */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          {getMediaCount(report) > 0 ? (
                            <>
                              <Badge variant="outline" className="bg-gray-100">
                                {getMediaCount(report)} file{getMediaCount(report) !== 1 ? 's' : ''}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">No media</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span>{formatDate(report.created_at)}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(report.created_at)}
                          </span>
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
                            <DropdownMenuItem onClick={() => onViewClick?.(report)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(report)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleVisibility(report)}
                              className="text-blue-600"
                            >
                              {report.visible_to_client ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Hide from client
                                </>
                              ) : (
                                <>
                                  <Globe className="mr-2 h-4 w-4" />
                                  Show to client
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(report)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete report
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
          {reports.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {reports.length} of {pagination.total} reports
                {selectedReports.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedReports.length} selected)
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
        title="Delete Report"
        description={`Are you sure you want to delete this report? This action cannot be undone.`}
      />

      {/* Edit Form Dialog */}
      {selectedReportForEdit && (
        <DutyStatusReportEditForm
          trigger={<div />} // Hidden trigger since we control via state
          report={selectedReportForEdit}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Refresh the list after successful edit
            dispatch(fetchReports(filters));
          }}
        />
      )}
    </>
  );
}