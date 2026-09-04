"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CalendarIcon,
  Check,
  Clock as ClockIcon,
  DownloadIcon,
  EllipsisVertical,
  Eye,
  EyeOff,
  File,
  FileImage,
  Globe,
  Hammer,
  ListFilter,
  Lock,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Search,
  ShieldAlert,
  Trash2,
  User,
  X
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Calendar as CalendarComponent } from "../ui/calender";
import { Checkbox } from "../ui/checkbox";
import { FloatingLabelInput } from "../ui/floating-input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Redux
import { DutyStatusReport, DutyStatusReportParams } from "@/app/types/dutyStatusReport";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  deleteReport,
  fetchReports,
  toggleVisibility,
} from "@/store/slices/dutyStatusReportSlice";

// Components
import SweetAlertService from "@/lib/sweetAlert";
import { DeleteDialog } from "../shared/delete-dialog";
import { DutyStatusReportEditForm } from "./duty-status-report-edit-form";
import { DutyStatusReportViewDialog } from "./duty-status-report-view-dialog";

// Status colors mapping
const statusColors: Record<string, string> = {
  true: "bg-green-100 text-green-800",
  false: "bg-red-100 text-red-800",
};

const visibilityColors: Record<string, string> = {
  true: "bg-blue-100 text-blue-800",
  false: "bg-gray-100 text-gray-800",
};

// Issue type mapping
const issueTypes: Record<string, { icon: any; color: string; label: string; bgColor: string }> = {
  had_incident: { icon: AlertTriangle, color: "text-red-500", label: "Incident", bgColor: "bg-red-100" },
  suspicious_activity: { icon: ShieldAlert, color: "text-yellow-600", label: "Suspicious Activity", bgColor: "bg-yellow-100" },
  security_safety_concern: { icon: AlertCircle, color: "text-orange-500", label: "Safety Concern", bgColor: "bg-orange-100" },
  unauthorized_access: { icon: Lock, color: "text-red-600", label: "Unauthorized Access", bgColor: "bg-red-100" },
  property_damage: { icon: Hammer, color: "text-red-400", label: "Property Damage", bgColor: "bg-red-100" },
  emergency_services_contacted: { icon: Phone, color: "text-blue-500", label: "Emergency Called", bgColor: "bg-blue-100" },
  requires_follow_up: { icon: ClockIcon, color: "text-purple-500", label: "Follow-up Needed", bgColor: "bg-purple-100" },
};

// Helper functions
const hasIncidents = (report: DutyStatusReport): boolean => {
  return report.had_incident ||
    report.suspicious_activity ||
    report.security_safety_concern ||
    report.unauthorized_access ||
    report.property_damage ||
    report.emergency_services_contacted ||
    report.requires_follow_up;
};

const getActiveIssues = (report: DutyStatusReport): string[] => {
  const issues = [];
  if (report.had_incident) issues.push('had_incident');
  if (report.suspicious_activity) issues.push('suspicious_activity');
  if (report.security_safety_concern) issues.push('security_safety_concern');
  if (report.unauthorized_access) issues.push('unauthorized_access');
  if (report.property_damage) issues.push('property_damage');
  if (report.emergency_services_contacted) issues.push('emergency_services_contacted');
  if (report.requires_follow_up) issues.push('requires_follow_up');
  return issues;
};

const getIncidentCount = (report: DutyStatusReport): number => {
  let count = 0;
  if (report.had_incident) count++;
  if (report.suspicious_activity) count++;
  if (report.security_safety_concern) count++;
  if (report.unauthorized_access) count++;
  if (report.property_damage) count++;
  if (report.emergency_services_contacted) count++;
  if (report.requires_follow_up) count++;
  return count;
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DutyStatusReport | null>(null);

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setMessageSearch("");
    setDateFilter(undefined);
    setFilters({ page: 1, per_page: 10 });
    setSelectedReports([]);
  };

  // Handle report selection
  const handleSelectReport = (reportId: number) => {
    setSelectedReports(prev =>
      prev.includes(reportId) ? prev.filter(id => id !== reportId) : [...prev, reportId]
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
        SweetAlertService.success('Report Deleted', 'Report has been deleted successfully.', {
          timer: 1500,
          showConfirmButton: false,
        });
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        dispatch(fetchReports(filters));
      } catch (error) {
        SweetAlertService.error('Delete Failed', 'There was an error deleting the report. Please try again.');
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
      dispatch(fetchReports(filters));
    } catch (error) {
      SweetAlertService.error('Update Failed', 'Failed to update report visibility. Please try again.');
    }
  };

  // Handle edit
  const handleEdit = (report: DutyStatusReport) => {
    if (onEditClick) {
      onEditClick(report);
    } else {
      setSelectedReportForEdit(report);
      setEditDialogOpen(true);
    }
  };

  // Handle view details
  const handleViewDetails = (report: DutyStatusReport) => {
    if (onViewClick) {
      onViewClick(report);
    } else {
      setSelectedReport(report);
      setViewDialogOpen(true);
    }
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'MMM dd, yyyy'); } catch { return dateString; }
  };

  const formatTime = (dateString: string) => {
    try { return format(new Date(dateString), 'HH:mm'); } catch { return dateString; }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getStatusDisplay = (isOk: boolean) => isOk ? "All OK" : "Issue Reported";
  const getGuardName = (report: DutyStatusReport) => report.guard?.full_name || `Officer #${report.guard_id || 'N/A'}`;
  const getDutyTitle = (report: DutyStatusReport) => report.duty?.title || report.duty_details?.title || `Duty #${report.duty_id || 'N/A'}`;
  const getSiteName = (report: DutyStatusReport) => report.duty_details?.site_name || report.duty?.site?.site_name || 'N/A';
  const getMediaCount = (report: DutyStatusReport) => report.media?.length || 0;
  const getInitials = (name: string) => name ? name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : '?';

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = () => {
    SweetAlertService.info('Export Feature', 'Export functionality will be implemented soon.');
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
          <CardTitle className="text-sm flex items-center gap-1 dark:text-black cursor-pointer hover:opacity-80" onClick={handleExport}>
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
            <div className="sm:col-span-3">
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

            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <Button
                  variant={filters.is_ok === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(filters.is_ok === true ? null : true)}
                >
                  <Check className="mr-1 h-3 w-3" /> OK
                </Button>
                <Button
                  variant={filters.is_ok === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(filters.is_ok === false ? null : false)}
                >
                  <X className="mr-1 h-3 w-3" /> Issues
                </Button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <Button
                  variant={filters.visible_to_client === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVisibilityFilter(filters.visible_to_client === true ? null : true)}
                >
                  <Globe className="mr-1 h-3 w-3" /> Visible
                </Button>
                <Button
                  variant={filters.visible_to_client === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVisibilityFilter(filters.visible_to_client === false ? null : false)}
                >
                  <EyeOff className="mr-1 h-3 w-3" /> Hidden
                </Button>
              </div>
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
                  <CalendarComponent mode="single" selected={dateFilter} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hasIncident = filters.has_incident === true ? undefined : true;
                  setFilters(prev => ({ ...prev, page: 1, has_incident: hasIncident }));
                }}
                className={filters.has_incident === true ? "bg-red-50 border-red-300" : ""}
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Incidents
                {filters.has_incident === true && (
                  <Badge variant="secondary" className="ml-1 bg-red-200">Active</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filters.is_ok !== undefined || filters.visible_to_client !== undefined || dateFilter || filters.has_incident !== undefined) && (
            <div className="px-4 pt-3">
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs">
                Clear all filters
              </Button>
            </div>
          )}

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Duty / Site</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[200px]">Issues</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || Object.keys(filters).length > 2
                            ? "Try adjusting your search or filters"
                            : "No duty status reports available"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: DutyStatusReport) => {
                    const activeIssues = getActiveIssues(report);
                    const hasIssue = activeIssues.length > 0;

                    return (
                      <React.Fragment key={report.id}>
                        <TableRow className={`hover:bg-gray-50 dark:hover:bg-black ${hasIssue ? 'bg-red-50/30' : ''}`}>
                          <TableCell className="font-medium text-gray-900 dark:text-white">#{report.id}</TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{getGuardName(report)}</span>
                              {report.guard?.guard_code && (
                                <Badge variant="outline" className="text-xs">{report.guard.guard_code}</Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{getDutyTitle(report)}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {getSiteName(report)}
                              </span>
                              {report.duty_details?.service_mode && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {report.duty_details.service_mode.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="truncate">{truncateMessage(report.message)}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className={`${statusColors[report.is_ok.toString()]} border-0 flex items-center gap-1`}>
                              {report.is_ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {getStatusDisplay(report.is_ok)}
                            </Badge>
                          </TableCell>

                          {/* Issues Column */}
                          <TableCell>
                            {activeIssues.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {activeIssues.map((issueKey) => {
                                  const issue = issueTypes[issueKey];
                                  if (!issue) return null;
                                  const Icon = issue.icon;
                                  return (
                                    <TooltipProvider key={issueKey}>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge
                                            variant="outline"
                                            className={`${issue.bgColor} border-0 text-[10px] flex items-center gap-0.5 px-1.5 py-0.5`}
                                          >
                                            <Icon className={`h-2.5 w-2.5 ${issue.color}`} />
                                            <span className="hidden sm:inline">{issue.label}</span>
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{issue.label}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No issues</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center">
                              <Switch
                                checked={report.visible_to_client}
                                onCheckedChange={() => handleToggleVisibility(report)}
                                className="mr-2"
                              />
                              <Badge variant="outline" className={`${visibilityColors[report.visible_to_client.toString()]} border-0`}>
                                {report.visible_to_client ? 'Visible' : 'Hidden'}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {report.latitude && report.longitude ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-xs">
                                  {parseFloat(String(report.latitude)).toFixed(4)}, {parseFloat(String(report.longitude)).toFixed(4)}
                                </span>
                                {report.has_location && (
                                  <Badge variant="outline" className="text-xs bg-green-50">Live</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No location</span>
                            )}
                          </TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              {getMediaCount(report) > 0 ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-gray-100 flex items-center gap-1">
                                        <FileImage className="h-3 w-3" /> {getMediaCount(report)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{getMediaCount(report)} media file{getMediaCount(report) > 1 ? 's' : ''}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-gray-400 text-sm">No media</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="flex flex-col">
                              <span>{formatDate(report.created_at)}</span>
                              <span className="text-xs text-gray-500">{formatTime(report.created_at)}</span>
                              {report.time_ago && <span className="text-xs text-gray-400">{report.time_ago}</span>}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                                  <Eye className="mr-2 h-4 w-4" /> View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(report)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit report
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleVisibility(report)} className="text-blue-600">
                                  {report.visible_to_client ? (
                                    <><EyeOff className="mr-2 h-4 w-4" /> Hide from client</>
                                  ) : (
                                    <><Globe className="mr-2 h-4 w-4" /> Show to client</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(report)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {reports.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {reports.length} of {pagination.total} reports
                {selectedReports.length > 0 && <span className="ml-2 text-blue-600">({selectedReports.length} selected)</span>}
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
                <span className="text-sm px-3">Page {pagination.current_page} of {pagination.last_page}</span>
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

      {/* View Details Dialog */}
      <DutyStatusReportViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        report={selectedReport}
        onEdit={() => {
          if (selectedReport) {
            setViewDialogOpen(false);
            handleEdit(selectedReport);
          }
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
      />

      {/* Edit Form Dialog */}
      {selectedReportForEdit && (
        <DutyStatusReportEditForm
          trigger={<div />}
          report={selectedReportForEdit}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            dispatch(fetchReports(filters));
          }}
        />
      )}
    </>
  );
}
