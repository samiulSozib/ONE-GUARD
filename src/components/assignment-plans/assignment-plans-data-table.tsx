// components/assignment-plans/assignment-plans-data-table.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  User,
  Search,
  RefreshCw,
  Plus,
  Shield,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchAssignmentPlans,
  deleteAssignmentPlan,
  toggleAssignmentPlanStatus,
} from "@/store/slices/schedulingSlice";
import { GuardAssignmentPlan, AssignmentPlanStatus } from "@/app/types/scheduling";
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<AssignmentPlanStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

interface AssignmentPlansDataTableProps {
  onAddClick?: () => void;
  onViewClick?: (plan: GuardAssignmentPlan) => void;
  onEditClick?: (plan: GuardAssignmentPlan) => void;
}

export function AssignmentPlansDataTable({
  onAddClick,
  onViewClick,
  onEditClick,
}: AssignmentPlansDataTableProps) {
  const dispatch = useAppDispatch();
  const { plans, pagination, isLoading } = useAppSelector((state) => state.scheduling.plans);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: "all" as string,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<GuardAssignmentPlan | null>(null);

  useEffect(() => {
    const params: any = {
      page: filters.page,
      per_page: filters.per_page,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.status !== "all") params.status = filters.status;
    dispatch(fetchAssignmentPlans(params));
  }, [dispatch, filters, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteClick = (plan: GuardAssignmentPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      try {
        await dispatch(deleteAssignmentPlan(planToDelete.id)).unwrap();
        SweetAlertService.success("Deleted", "Assignment plan has been deleted.");
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        dispatch(fetchAssignmentPlans({
          page: filters.page,
          per_page: filters.per_page,
          status: filters.status !== "all" ? filters.status as AssignmentPlanStatus : undefined,
          search: searchTerm || undefined,
        }));
      } catch (error: any) {
        SweetAlertService.error("Delete Failed", error?.message || "Failed to delete assignment plan.");
      }
    }
  };

  const handleToggleStatus = async (plan: GuardAssignmentPlan) => {
    try {
      await dispatch(toggleAssignmentPlanStatus({
        id: plan.id,
        data: { is_active: !plan.is_active },
      })).unwrap();
      SweetAlertService.success(
        "Status Updated",
        `Plan has been ${!plan.is_active ? "activated" : "deactivated"}.`
      );
    } catch (error: any) {
      SweetAlertService.error("Update Failed", error?.message || "Failed to update status.");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: AssignmentPlanStatus) => {
    return (
      <Badge className={`${statusColors[status]} border px-2 py-0.5 font-medium text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading && plans.length === 0) {
    return <AssignmentPlansTableSkeleton />;
  }

  return (
    <>
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#F4F6F8] p-3 sm:p-5 -mt-6 rounded-t-md flex flex-wrap items-center gap-3 w-full justify-between md:justify-start">
          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Search className="h-4 w-4" />
            Filters
          </CardTitle>
          <div className="flex-1 max-w-xs">
            <InputGroup>
              <InputGroupInput
                placeholder="Search plans..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
              <InputGroupAddon onClick={handleSearchSubmit} className="cursor-pointer">
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="h-8 sm:h-9 px-2 text-xs sm:text-sm border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters(prev => ({ ...prev, page: 1 }));
              dispatch(fetchAssignmentPlans({
                page: 1,
                per_page: filters.per_page,
                status: filters.status !== "all" ? filters.status as AssignmentPlanStatus : undefined,
                search: searchTerm || undefined,
              }));
            }}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Refresh
          </Button>
          {onAddClick && (
            <Button
              size="sm"
              onClick={onAddClick}
              className="bg-[#5F0015] hover:bg-blue-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add Plan
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs">ID</TableHead>
                  <TableHead className="font-semibold text-xs">Schedule</TableHead>
                  <TableHead className="font-semibold text-xs">Guard</TableHead>
                  <TableHead className="font-semibold text-xs">Start Date</TableHead>
                  <TableHead className="font-semibold text-xs">End Date</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs">Active</TableHead>
                  <TableHead className="text-center font-semibold text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No assignment plans found
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create your first assignment plan to automate guard assignments
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Plan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">#{plan.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3 text-blue-500" />
                            {plan.duty_schedule?.title || `Schedule #${plan.duty_schedule_id}`}
                          </span>
                          {plan.duty_schedule?.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {plan.duty_schedule.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {plan.guard?.full_name || `Guard #${plan.guard_id}`}
                            </span>
                            {plan.guard?.guard_code && (
                              <span className="text-xs text-muted-foreground">
                                {plan.guard.guard_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(plan.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.is_open_ended ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Open-ended
                          </Badge>
                        ) : (
                          <span className="text-sm">{plan.end_date ? formatDate(plan.end_date) : "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={() => handleToggleStatus(plan)}
                          />
                          {plan.is_active ? (
                            <Power className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <PowerOff className="h-3 w-3 text-gray-400" />
                          )}
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
                            <DropdownMenuItem onClick={() => onViewClick?.(plan)}>
                              <Eye className="mr-2 h-4 w-4" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditClick?.(plan)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(plan)}
                              className="text-blue-600"
                            >
                              {plan.is_active ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" /> Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(plan)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete plan
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
          {plans.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t bg-gray-50/50 dark:bg-gray-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{plans.length}</span> of{" "}
                <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> plans
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
                <span className="text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg font-medium text-blue-600 dark:text-blue-400">
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

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Assignment Plan"
        description={`Are you sure you want to delete this assignment plan? This action cannot be undone.`}
      />
    </>
  );
}

// Loading Skeleton
function AssignmentPlansTableSkeleton() {
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
