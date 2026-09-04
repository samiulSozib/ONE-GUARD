// components/home/home-recent-reports.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, MessageSquare, RefreshCw, Power, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchReports } from "@/store/slices/dutyStatusReportSlice";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function HomeRecentReports() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { reports, isLoading } = useAppSelector((state) => state.dutyStatusReport);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = useCallback(() => {
    dispatch(fetchReports({ page: 1, per_page: 10, sort_by: "created_at", sort_order: "desc" }));
  }, [dispatch]);

  useEffect(() => {
    loadData();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData();
      }, 10 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadData, autoRefresh]);

  const getIssueBadges = (report: any) => {
    const issues = [];
    if (report.had_incident) issues.push('Incident');
    if (report.suspicious_activity) issues.push('Suspicious');
    if (report.security_safety_concern) issues.push('Safety');
    if (report.unauthorized_access) issues.push('Unauthorized');
    if (report.property_damage) issues.push('Damage');
    if (report.emergency_services_contacted) issues.push('Emergency');
    if (report.requires_follow_up) issues.push('Follow-up');

    if (issues.length === 0) {
      return <span className="text-xs text-muted-foreground">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {issues.slice(0, 2).map((issue, index) => (
          <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0">
            {issue}
          </Badge>
        ))}
        {issues.length > 2 && (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-0 text-[10px] px-1.5 py-0">
            +{issues.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch {
      return dateString;
    }
  };

  const getGuardName = (report: any) => {
    return report.guard?.full_name || `#${report.guard_id}`;
  };

  const handleView = (reportId: number) => {
    router.push(`/duty-status-report`);
  };

  return (
    <Card className="shadow-sm rounded-xl border bg-card">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Recent Status Reports</h3>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {isLoading ? '...' : reports.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-7 px-2 text-[10px] ${autoRefresh ? 'text-emerald-600' : 'text-muted-foreground'}`}
            >
              <Power className="h-3 w-3 mr-1" />
              {autoRefresh ? 'Auto' : 'Off'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="h-7 px-2 text-[10px]"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading && reports.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Officer</th>
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Message</th>
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Issues</th>
                  <th className="text-center py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">View</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.slice(0, 10).map((report) => (
                    <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium truncate max-w-[80px]">
                            {getGuardName(report)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs truncate max-w-[120px]">
                            {report.message || 'No message'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        {getIssueBadges(report)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleView(report.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {reports.length > 10 && (
              <div className="text-center text-[10px] text-muted-foreground mt-3">
                Showing 10 of {reports.length} reports
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
