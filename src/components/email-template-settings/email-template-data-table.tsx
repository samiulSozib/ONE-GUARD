// components/email-template/email-template-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Eye,
  Pencil,
  Trash2,
  ListFilter,
  Search,
  File,
  Copy,
  EllipsisVertical,
  Mail,
  CheckCircle,
  XCircle,
  EyeOff,
  Send,
  History,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  fetchEmailTemplates,
  deleteEmailTemplate,
  toggleTemplateStatus,
  duplicateTemplate,
} from "@/store/slices/emailTemplateSlice";
import { EmailTemplate, EmailTemplateCategory, EmailTemplateParams } from "@/app/types/email-template";

// Components
import { DeleteDialog } from "../shared/delete-dialog";
import SweetAlertService from "@/lib/sweetAlert";
import { EmailTemplateEditForm } from "./email-template-edit-form";
import { EmailTemplateViewModal } from "./email-template-view-modal";
import { EmailTemplateTestModal } from "./email-template-test-modal";
import { EmailTemplateLogsModal } from "./email-template-logs-modal";

// Category colors and labels
const categoryConfig: Record<EmailTemplateCategory, { label: string; color: string }> = {
  guard: { label: "Guard", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  client: { label: "Client", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  job: { label: "Job", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  system: { label: "System", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
  general: { label: "General", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
};

interface EmailTemplateDataTableProps {
  onAddClick?: () => void;
}

export function EmailTemplateDataTable({ onAddClick }: EmailTemplateDataTableProps) {
  const dispatch = useAppDispatch();
  
  // Redux state
  const { items: templates, pagination, isLoading } = useAppSelector((state) => state.emailTemplates);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [filters, setFilters] = useState<EmailTemplateParams>({
    page: 1,
    per_page: 10,
  });
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Fetch templates on mount and filter changes
  useEffect(() => {
    const fetchParams = {
      ...filters,
      search: searchTerm || undefined,
    };
    
    dispatch(fetchEmailTemplates(fetchParams));
  }, [dispatch, filters, searchTerm]);
  
  // Handle search
  const handleCodeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeSearch(e.target.value);
  };
  
  const handleCodeSearchSubmit = () => {
    setSearchTerm(codeSearch);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      is_active: status === "all" ? undefined : status === "active"
    }));
  };
  
  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 1,
      category: category === "all" ? undefined : category as EmailTemplateCategory
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCodeSearch("");
    setFilters({
      page: 1,
      per_page: 10,
    });
    setSelectedTemplates([]);
  };
  
  // Handle template selection
  const handleSelectTemplate = (templateId: number) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map((template: EmailTemplate) => template.id));
    }
  };
  
  // Handle delete
  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      try {
        await dispatch(deleteEmailTemplate(templateToDelete.id)).unwrap();
        
        SweetAlertService.success(
          'Template Deleted',
          `${templateToDelete.name} has been deleted successfully.`,
          { timer: 1500, showConfirmButton: false }
        );
        
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
        
        // Refresh list
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchEmailTemplates(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Delete Failed',
          'There was an error deleting the template. Please try again.'
        );
      }
    }
  };
  
  // Handle toggle status
  const handleToggleStatus = async (template: EmailTemplate) => {
    try {
      const newStatus = !template.is_active;
      await dispatch(toggleTemplateStatus(template.id)).unwrap();
      
      SweetAlertService.success(
        'Status Updated',
        `${template.name} has been ${newStatus ? 'activated' : 'deactivated'}.`,
        { timer: 1500, showConfirmButton: false }
      );
    } catch (error) {
      SweetAlertService.error(
        'Update Failed',
        'Failed to update template status. Please try again.'
      );
    }
  };
  
  // Handle duplicate
  const handleDuplicate = async (template: EmailTemplate) => {
    const { value: newCode } = await SweetAlertService.input(
      'Duplicate Template',
      `Enter a new code for "${template.name}"`,
      {
        inputPlaceholder: `Copy of ${template.code}`,
        inputValue: `${template.code}_copy`,
      }
    );
    
    if (newCode) {
      try {
        await dispatch(duplicateTemplate({ id: template.id, newCode })).unwrap();
        
        SweetAlertService.success(
          'Template Duplicated',
          `${template.name} has been duplicated successfully.`,
          { timer: 1500, showConfirmButton: false }
        );
        
        // Refresh list
        const fetchParams = {
          ...filters,
          search: searchTerm || undefined,
        };
        dispatch(fetchEmailTemplates(fetchParams));
      } catch (error) {
        SweetAlertService.error(
          'Duplicate Failed',
          'Failed to duplicate template. Please try again.'
        );
      }
    }
  };
  
  // Handle view
  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };
  
  // Handle edit
  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };
  
  // Handle test
  const handleTest = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTestDialogOpen(true);
  };
  
  // Handle logs
  const handleLogs = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setLogsDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
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
  if (isLoading && templates.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
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

          <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
            <Checkbox 
              id="select-all" 
              className="dark:bg-white dark:border-black"
              checked={selectedTemplates.length === templates.length && templates.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select</Label>
          </CardTitle>
        </div>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3 pt-4">
            {/* Code/Template Search Input */}
            <div className="sm:col-span-4">
              <InputGroup>
                <InputGroupInput 
                  placeholder="Template code or name..." 
                  value={codeSearch}
                  onChange={handleCodeSearch}
                  onKeyDown={(e) => e.key === 'Enter' && handleCodeSearchSubmit()}
                />
                <InputGroupAddon onClick={handleCodeSearchSubmit} className="cursor-pointer">
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
            
            {/* Category Filter */}
            <div className="sm:col-span-3">
              <Select 
                value={filters.category || "all"} 
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="guard">Guard</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select 
                value={filters.is_active === undefined ? "all" : filters.is_active ? "active" : "inactive"} 
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                      checked={selectedTemplates.length === templates.length && templates.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Template Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Mail className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No email templates found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filters.category || filters.is_active !== undefined
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new email template"}
                        </p>
                        {onAddClick && (
                          <Button onClick={onAddClick}>
                            Create Template
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template: EmailTemplate) => (
                    <TableRow
                      key={template.id}
                      className="hover:bg-gray-50 dark:hover:bg-black cursor-pointer"
                      onClick={() => handleView(template)}
                    >
                      {/* Select Checkbox */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={() => handleSelectTemplate(template.id)}
                        />
                      </TableCell>

                      {/* Template Info */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {template.code}
                          </div>
                          {template.description && (
                            <div className="text-xs text-gray-400">
                              {truncateText(template.description, 40)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${categoryConfig[template.category]?.color || 'bg-gray-100'} border-0`}
                        >
                          {categoryConfig[template.category]?.label || template.category}
                        </Badge>
                      </TableCell>

                      {/* Subject */}
                      <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs">
                        <div className="truncate" title={template.subject}>
                          {truncateText(template.subject, 40)}
                        </div>
                      </TableCell>

                      {/* Variables */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.variables?.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs font-mono">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                          {template.variables && template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                          {(!template.variables || template.variables.length === 0) && (
                            <span className="text-xs text-gray-400">No variables</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Version */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          v{template.version}
                        </Badge>
                      </TableCell>

                      {/* Updated */}
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(template.updated_at)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${template.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} border-0`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handleView(template)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTest(template)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Test Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLogs(template)}>
                              <History className="mr-2 h-4 w-4" />
                              View Logs
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                              {template.is_active ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
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
                              onClick={() => handleDeleteClick(template)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Template
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
          {templates.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} to{' '}
                {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total)} of{' '}
                {pagination.total} templates
                {selectedTemplates.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedTemplates.length} selected)
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
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
      />

      {/* View Modal */}
      {selectedTemplate && (
        <EmailTemplateViewModal
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}

      {/* Edit Form Dialog */}
      {selectedTemplate && (
        <EmailTemplateEditForm
          trigger={<div />}
          template={selectedTemplate}
          isOpen={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedTemplate(null);
          }}
          onSuccess={() => {
            const fetchParams = {
              ...filters,
              search: searchTerm || undefined,
            };
            dispatch(fetchEmailTemplates(fetchParams));
          }}
        />
      )}

      {/* Test Email Modal */}
      {selectedTemplate && (
        <EmailTemplateTestModal
          isOpen={testDialogOpen}
          onClose={() => {
            setTestDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}

      {/* Logs Modal */}
      {selectedTemplate && (
        <EmailTemplateLogsModal
          isOpen={logsDialogOpen}
          onClose={() => {
            setLogsDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
    </>
  );
}