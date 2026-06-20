'use client'

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
    CheckCircle,
    XCircle,
    Clock,
    User,
    Shield,
    MapPin,
    AlertCircle,
    RefreshCw,
    X,
    Trash2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calender";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
    fetchShiftLogs,
    fetchGuardsStatus,
    clearShiftLogs,
    clearShiftLogError
} from "@/store/slices/shiftLogsSlice";
import { fetchGuards } from "@/store/slices/guardSlice";
import { fetchAssignments } from "@/store/slices/guardAssignmentSlice";
import { ShiftLog, ShiftLogParams } from "@/app/types/shiftLogs";

// Components
import SweetAlertService from "@/lib/sweetAlert";

interface ShiftLogsDataTableProps {
    onViewDetails?: (log: ShiftLog) => void;
    filters?: ShiftLogParams;
    showFilters?: boolean;
    showBulkActions?: boolean;
}

export function ShiftLogsDataTable({ 
    onViewDetails, 
    filters: externalFilters,
    showFilters = true,
    showBulkActions = true
}: ShiftLogsDataTableProps) {
    const dispatch = useAppDispatch();

    // Redux state
    const { logs, logStats, pagination, isLoading, error, lastUpdated } = useAppSelector(
        (state) => state.shiftLogs
    );
    const { guards } = useAppSelector((state) => state.guard);
    const { assignments } = useAppSelector((state) => state.guardAssignment);

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLogs, setSelectedLogs] = useState<number[]>([]);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [guardFilter, setGuardFilter] = useState<string>("all");
    const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // Fetch guards and assignments for dropdowns
    useEffect(() => {
        dispatch(fetchGuards({ page: 1, per_page: 100 }));
        dispatch(fetchAssignments({ page: 1, per_page: 100 }));
    }, [dispatch]);

    // Build filter params
    const buildFilterParams = (): ShiftLogParams => {
        const params: ShiftLogParams = {
            page: currentPage,
            per_page: 20,
            search: searchTerm || undefined,
            ...externalFilters,
        };

        if (actionFilter !== "all") {
            params.action = actionFilter;
        }

        if (statusFilter !== "all") {
            params.verified = statusFilter === "verified";
        }

        if (guardFilter !== "all") {
            params.guard_id = parseInt(guardFilter);
        }

        if (assignmentFilter !== "all") {
            params.assignment_id = parseInt(assignmentFilter);
        }

        if (startDate) {
            params.start_date = format(startDate, 'yyyy-MM-dd');
        }

        if (endDate) {
            params.end_date = format(endDate, 'yyyy-MM-dd');
        }

        return params;
    };

    // Fetch logs on mount and filter changes
    useEffect(() => {
        const params = buildFilterParams();
        dispatch(fetchShiftLogs(params));
        dispatch(fetchGuardsStatus());
    }, [dispatch, currentPage, searchTerm, actionFilter, statusFilter, guardFilter, assignmentFilter, startDate, endDate, externalFilters]);

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = () => {
        setCurrentPage(1);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLogs(logs.map(log => log.id));
        } else {
            setSelectedLogs([]);
        }
    };

    const handleSelectLog = (logId: number, checked: boolean) => {
        if (checked) {
            setSelectedLogs(prev => [...prev, logId]);
        } else {
            setSelectedLogs(prev => prev.filter(id => id !== logId));
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setActionFilter("all");
        setGuardFilter("all");
        setAssignmentFilter("all");
        setStartDate(undefined);
        setEndDate(undefined);
        setCurrentPage(1);
        setSelectedLogs([]);
    };

    // Export logs
    const handleExport = async () => {
        try {
            await SweetAlertService.success(
                'Export Started',
                'Your logs export has been initiated.',
                { timer: 2000 }
            );
        } catch (error) {
            await SweetAlertService.error(
                'Export Failed',
                'There was an error exporting the logs.'
            );
        }
    };

    // Refresh logs
    const handleRefresh = () => {
        const params = buildFilterParams();
        dispatch(clearShiftLogs());
        dispatch(fetchShiftLogs(params));
        dispatch(fetchGuardsStatus());
    };

    // Format date and time
    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'HH:mm:ss');
        } catch {
            return dateString;
        }
    };

    // Get action badge
    const getActionBadge = (action: string) => {
        const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            check_in: {
                label: 'Check In',
                color: 'bg-green-50 text-green-700 border-green-200',
                icon: <CheckCircle className="h-3 w-3" />
            },
            check_out: {
                label: 'Check Out',
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: <XCircle className="h-3 w-3" />
            },
            break: {
                label: 'Break',
                color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                icon: <Clock className="h-3 w-3" />
            },
            patrol: {
                label: 'Patrol',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: <Shield className="h-3 w-3" />
            },
            incident: {
                label: 'Incident',
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: <AlertCircle className="h-3 w-3" />
            }
        };
        return configs[action] || {
            label: action,
            color: 'bg-gray-50 text-gray-700 border-gray-200',
            icon: <File className="h-3 w-3" />
        };
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Loading skeleton
    if (isLoading && logs.length === 0) {
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
        <Card className="shadow-sm rounded-2xl">
            {/* Header Section */}
            <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full flex-wrap">
                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <ListFilter size="14px" />
                    Shift Logs
                </CardTitle>

                {lastUpdated && (
                    <span className="text-xs text-gray-500">
                        Last updated: {format(new Date(lastUpdated), 'MMM dd, HH:mm')}
                    </span>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="ml-auto"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading && "animate-spin"}`} />
                    Refresh
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export
                </Button>

                {selectedLogs.length > 0 && showBulkActions && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            SweetAlertService.warning(
                                'Bulk Delete',
                                `Delete ${selectedLogs.length} selected logs? This action cannot be undone.`
                            );
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedLogs.length}
                    </Button>
                )}
            </div>

            <CardContent className="p-0">
                {/* Stats Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 border-b">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{logStats.total_logs}</p>
                        <p className="text-xs text-gray-500">Total Logs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{logStats.check_ins}</p>
                        <p className="text-xs text-gray-500">Check Ins</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{logStats.check_outs}</p>
                        <p className="text-xs text-gray-500">Check Outs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{logStats.breaks}</p>
                        <p className="text-xs text-gray-500">Breaks</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{logStats.patrols}</p>
                        <p className="text-xs text-gray-500">Patrols</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{logStats.incidents}</p>
                        <p className="text-xs text-gray-500">Incidents</p>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border-b">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <InputGroup>
                                <InputGroupInput
                                    placeholder="Search by guard, location, or remarks..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                />
                                {searchTerm && (
                                    <InputGroupAddon onClick={handleClearSearch} className="cursor-pointer">
                                        <X className="h-4 w-4" />
                                    </InputGroupAddon>
                                )}
                                <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                                    <Search className="h-4 w-4" />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="check_in">Check In</SelectItem>
                                    <SelectItem value="check_out">Check Out</SelectItem>
                                    <SelectItem value="break">Break</SelectItem>
                                    <SelectItem value="patrol">Patrol</SelectItem>
                                    <SelectItem value="incident">Incident</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Verification Status Filter */}
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Guard Filter */}
                        <div>
                            <Select value={guardFilter} onValueChange={setGuardFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Guards" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Guards</SelectItem>
                                    {guards.map((guard) => (
                                        <SelectItem key={guard.id} value={guard.id.toString()}>
                                            {guard.full_name || `Guard #${guard.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignment Filter */}
                        <div>
                            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Assignments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Assignments</SelectItem>
                                    {assignments.map((assignment) => (
                                        <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                            Assignment #{assignment.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {startDate || endDate ? (
                                            <>
                                                {startDate ? format(startDate, 'MM/dd') : 'Start'}
                                                {endDate && ` - ${format(endDate, 'MM/dd')}`}
                                            </>
                                        ) : (
                                            'Date Range'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4 space-y-4" align="end">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End Date</label>
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            onClick={() => setCurrentPage(1)}
                                            className="flex-1"
                                        >
                                            Apply
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => {
                                                setStartDate(undefined);
                                                setEndDate(undefined);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="w-full"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="p-4 text-center text-red-600 flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Error loading logs: {error}</span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => dispatch(clearShiftLogError())}
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {showBulkActions && (
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedLogs.length === logs.length && logs.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                )}
                                <TableHead>Action</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead>Duty</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={showBulkActions ? 9 : 8} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <File className="h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                No shift logs found
                                            </h3>
                                            <p className="text-gray-500">
                                                {searchTerm || actionFilter !== "all" || statusFilter !== "all" || guardFilter !== "all" || assignmentFilter !== "all" || startDate || endDate
                                                    ? "Try adjusting your search or filters"
                                                    : "No shift logs have been recorded yet"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log: ShiftLog) => {
                                    const actionConfig = getActionBadge(log.action);
                                    return (
                                        <TableRow
                                            key={log.id}
                                            className="hover:bg-gray-50 dark:hover:bg-black"
                                        >
                                            {showBulkActions && (
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedLogs.includes(log.id)}
                                                        onCheckedChange={(checked) => 
                                                            handleSelectLog(log.id, checked as boolean)
                                                        }
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={actionConfig.color}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {actionConfig.icon}
                                                        {actionConfig.label}
                                                    </span>
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">
                                                        Guard #{log.guard_id}
                                                    </span>
                                                </div>
                                                {log.guard_user && (
                                                    <span className="text-xs text-gray-500">
                                                        {log.guard_user.name}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm">
                                                        {log.duty?.title || `Duty #${log.duty_id}`}
                                                    </span>
                                                </div>
                                                {log.assignment && (
                                                    <span className="text-xs text-gray-500">
                                                        Assignment #{log.assignment.id}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {formatDateTime(log.action_time)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(log.action_time)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm truncate max-w-[150px]" title={log.location_address}>
                                                        {log.location_address || 'N/A'}
                                                    </span>
                                                    {log.latitude && log.longitude && (
                                                        <span className="text-xs text-gray-500">
                                                            {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm truncate max-w-[120px]" title={log.remarks}>
                                                    {log.remarks || '-'}
                                                </span>
                                                {log.metadata?.battery_level && (
                                                    <span className="text-xs text-gray-500 block">
                                                        🔋 {log.metadata.battery_level}%
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {log.verified ? (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Verified
                                                        {log.verified_by && (
                                                            <span className="text-xs ml-1">
                                                                by #{log.verified_by}
                                                            </span>
                                                        )}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <EllipsisVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => onViewDetails?.(log)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {logs.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
                        <div className="text-sm text-gray-700">
                            Showing {logs.length} of {pagination.total} logs
                            {selectedLogs.length > 0 && (
                                <span className="ml-2 text-blue-600">
                                    ({selectedLogs.length} selected)
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
    );
}