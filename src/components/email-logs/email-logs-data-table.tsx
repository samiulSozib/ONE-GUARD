// components/email-logs/email-logs-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Eye,
  Trash2,
  ListFilter,
  Search,
  File,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye as EyeIcon,
  RefreshCw,
  Loader2,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

// Redux
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchEmailLogs,
  deleteEmailLog,
} from "@/store/slices/email-logSlice";
import { EmailLog, EmailLogParams } from "@/app/types/emailLog";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { EmailLogViewModal } from "./email-logs-view-modal";

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  sent: { label: "Sent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  opened: { label: "Opened", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: EyeIcon },
};

export function EmailLogsDataTable() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { items: logs, pagination, isLoading } = useAppSelector((state) => state.emailLogs);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [filters, setFilters] = useState<EmailLogParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<EmailLog | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Fetch logs on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      recipient_email: recipientSearch || undefined,
    };
    
    dispatch(fetchEmailLogs(fetchParams));
  }, [dispatch, filters, recipientSearch]);
  
  // Handle search
  const handleRecipientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientSearch(e.target.value);
  };
  
  const handleRecipientSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      status: status === "all" ? undefined : status as any
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setRecipientSearch("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedLogs([]);
  };
  
  // Handle log selection
  const handleSelectLog = (logId: number) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((log: EmailLog) => log.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (log: EmailLog) => {
    setLogToDelete(log);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (logToDelete) {
      try {
        await dispatch(deleteEmailLog(logToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Log Deleted',
          'Email log has been deleted successfully.',
          { timer: 1500, showConfirmButton: false }
        );
        
        setDeleteDialogOpen(false);
        setLogToDelete(null);
        
        // Refresh list and stats
        const fetchParams = {
          ...filters,
          recipient_email: recipientSearch || undefined,
        };
        dispatch(fetchEmailLogs(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the log. Please try again.'
        );
      }
    }
  };
  
  // Handle view
  const handleView = (log: EmailLog) => {
    setSelectedLog(log);
    setViewDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
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
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedLogs.length === logs.length && logs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>

          {/* Statistics Summary */}
          {/* {statistics && (
            <div className="flex items-center gap-4 ml-auto text-xs">
              <span className="text-gray-500">Total: <strong className="text-gray-900">{statistics.total}</strong></span>
              <span className="text-green-600">Sent: {statistics.by_status?.sent || 0}</span>
              <span className="text-red-600">Failed: {statistics.by_status?.failed || 0}</span>
            </div>
          )} */}
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3 pt-4">
            {/* Recipient Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Search by email..." 
                  value={recipientSearch}
                  onChange={handleRecipientSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleRecipientSearchSubmit()}
                />
                <InputGroupAddon onClick={handleRecipientSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select 
                value={filters.status || "all"} 
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full text-xs"
              >
                Clear
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
                      checked={selectedLogs.length === logs.length && logs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Mail className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No email logs found
                        </h3>
                        <p className="text-gray-500">
                          {recipientSearch || filters.status
                            ? "Try adjusting your search or filters"
                            : "No emails have been sent yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: EmailLog) => {
                    const status = statusConfig[log.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                        onClick={() => handleView(log)}
                      >
                        {/* Select Checkbox */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedLogs.includes(log.id)}
                            onCheckedChange={() => handleSelectLog(log.id)}
                          />
                        </TableCell>

                        {/* Recipient */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {log.recipient_email}
                            </div>
                            {log.recipient_name && (
                              <div className="text-xs text-gray-500">
                                {log.recipient_name}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Subject */}
                        <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs">
                          <div className="truncate" title={log.subject}>
                            {truncateText(log.subject, 40)}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant="outline" className={`${status.color} border-0 flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          {log.error_message && (
                            <div className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={log.error_message}>
                              {truncateText(log.error_message, 30)}
                            </div>
                          )}
                        </TableCell>

                        {/* Sent At */}
                        <TableCell className="text-gray-500 text-sm">
                          {formatDate(log.sent_at || log.created_at)}
                        </TableCell>

                        {/* Template */}
                        <TableCell>
                          {log.template ? (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {log.template.name}
                              </div>
                              <code className="text-xs text-gray-400">
                                {log.template_code}
                              </code>
                            </div>
                          ) : (
                            <code className="text-xs text-gray-400">
                              {log.template_code}
                            </code>
                          )}
                        </TableCell>

                        {/* IP Address */}
                        <TableCell className="text-gray-500 text-xs font-mono">
                          {log.ip_address || 'N/A'}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(log)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(log)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Log
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
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} logs
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
      
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Log"
        description={`Are you sure you want to delete this email log for "${logToDelete?.recipient_email}"? This action cannot be undone.`}
      />

      {/* View Modal */}
      {selectedLog && (
        <EmailLogViewModal
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedLog(null);
          }}
          log={selectedLog}
        />
      )}
    </>
  );
}