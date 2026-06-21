"use client";

import Image from "next/image";
import { ChevronRight, MoreHorizontal, Search, Briefcase, Users, Calendar, MapPin } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDashboard } from "@/store/slices/dashboardSlice";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

// Status badge color map for applications
const statusColors: Record<string, string> = {
    reviewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hired: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-blue-100 text-blue-800 border-blue-200",
    shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
    interview_scheduled: "bg-indigo-100 text-indigo-800 border-indigo-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};

// Status text mapping
const statusTextMap: Record<string, string> = {
    reviewed: "Reviewed",
    hired: "Hired",
    pending: "Pending",
    shortlisted: "Shortlisted",
    interview_scheduled: "Interview Scheduled",
    rejected: "Rejected",
};

export function RecentJobsAndApplications() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { data: dashboard, isLoading } = useAppSelector((state) => state.dashboard);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("applications");

    // Fetch dashboard data on component mount
    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    // Get applicant initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Filter applications
    const getFilteredApplications = () => {
        if (!dashboard?.applications?.recent) return [];

        let filtered = [...dashboard.applications.recent];

        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(app =>
                app.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        return filtered;
    };

    // Navigation handlers
    const handleViewAllApplications = () => {
        router.push('/job-applications');
    };

    const handleViewAllJobs = () => {
        router.push('/jobs');
    };

    const handleRowClick = (applicationId: number) => {
        router.push(`/job-applications/${applicationId}`);
    };

    const handleJobRowClick = (jobId: number) => {
        router.push(`/jobs/${jobId}`);
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <Card className="shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        Jobs & Applications
                    </CardTitle>
                    <Button variant="link" className="text-sm text-black-600 font-medium">
                        View All <ChevronRight />
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="p-4 border-b">
                        <Skeleton className="h-10 w-48 mb-2" />
                    </div>
                    <div className="overflow-x-auto p-4">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const filteredApplications = getFilteredApplications();
    const topJobs = dashboard?.applications?.top_jobs || [];

    return (
        <Card className="shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Jobs & Applications
                </CardTitle>
                <Button 
                    variant="link" 
                    className="text-sm text-black-600 font-medium cursor-pointer"
                    onClick={activeTab === "applications" ? handleViewAllApplications : handleViewAllJobs}
                >
                    View All <ChevronRight />
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs defaultValue="applications" className="w-full" onValueChange={setActiveTab}>
                    <div className="border-b px-4">
                        <TabsList className="h-12">
                            <TabsTrigger value="applications" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Recent Applications ({dashboard?.applications?.recent?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="jobs" className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Top Jobs ({topJobs.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Applications Tab */}
                    <TabsContent value="applications" className="m-0">
                        {/* Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 py-3">
                            <div className="sm:col-span-8">
                                <InputGroup>
                                    <InputGroupInput
                                        placeholder="Search by name, job title, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <InputGroupAddon>
                                        <Search />
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>

                            <div className="sm:col-span-4">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Filter by Status</SelectLabel>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="hired">Hired</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                            <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Applied Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredApplications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-gray-400 mb-2">No applications found</div>
                                                    <p className="text-sm text-gray-500">
                                                        {searchTerm || statusFilter !== "all"
                                                            ? "Try adjusting your search or filters"
                                                            : "No recent applications available"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredApplications.map((app) => (
                                            <TableRow 
                                                key={app.id} 
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleRowClick(app.id)}
                                            >
                                                {/* Applicant Info */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-blue-700">
                                                                {getInitials(app.full_name)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {app.full_name}
                                                            </div>
                                                            <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                                {app.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Job Title */}
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">
                                                        {app.job_title}
                                                    </div>
                                                    {app.has_resume && (
                                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                            Resume
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Applied Date */}
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">
                                                        {app.applied_date}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-300 text-xs">
                                                        {app.applied_time}
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${statusColors[app.status] || statusColors.pending} px-3 py-1 text-xs font-medium`}
                                                    >
                                                        {app.status_text || statusTextMap[app.status] || app.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Summary Footer */}
                        {filteredApplications.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {filteredApplications.length} of {dashboard?.applications?.recent?.length || 0} applications
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-sm cursor-pointer"
                                    onClick={handleViewAllApplications}
                                >
                                    View All Applications
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Top Jobs Tab */}
                    <TabsContent value="jobs" className="m-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Vacancies</TableHead>
                                        <TableHead className="text-right">Applications</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {topJobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Briefcase className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">No jobs available</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topJobs.map((job) => (
                                            <TableRow 
                                                key={job.id} 
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleJobRowClick(job.id)}
                                            >
                                                {/* Job Title */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {job.title}
                                                        </span>
                                                        {job.is_urgent && (
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                                                                Urgent
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Location */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                        {job.location}
                                                    </div>
                                                </TableCell>

                                                {/* Vacancies */}
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {job.vacancies} {job.vacancies === 1 ? 'position' : 'positions'}
                                                    </Badge>
                                                </TableCell>

                                                {/* Applications */}
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900">
                                                            {job.applications_count}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {job.applications_count === 1 ? 'applicant' : 'applicants'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Summary Footer for Jobs */}
                        {topJobs.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {topJobs.length} top jobs
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-sm cursor-pointer"
                                    onClick={handleViewAllJobs}
                                >
                                    View All Jobs
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}