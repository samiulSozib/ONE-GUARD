// components/home/home-recent-incidents.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Hash, Building2, RefreshCw, Power, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchIncidents } from "@/store/slices/incidentSlice";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function HomeRecentIncidents() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { incidents, isLoading } = useAppSelector((state) => state.incident);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = useCallback(() => {
    dispatch(fetchIncidents({ page: 1, per_page: 10, sort_by: "created_at", sort_order: "desc" }));
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch {
      return dateString;
    }
  };

  const getSiteName = (incident: any) => {
    return incident.site?.site_name || incident.site_name || 'No site';
  };

  const handleView = (incidentId: number) => {
    router.push(`/incident`);
  };

  return (
    <Card className="shadow-sm rounded-xl border bg-card">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="font-semibold text-sm">Recent Incidents</h3>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {isLoading ? '...' : incidents.length}
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
        {isLoading && incidents.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Tracking</th>
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Title / Site</th>
                  <th className="text-left py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Time</th>
                  <th className="text-center py-2.5 px-4 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">View</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  incidents.slice(0, 10).map((incident) => (
                    <tr key={incident.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono font-medium">
                            {incident.tracking_code || `#${incident.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium truncate max-w-[100px]">
                            {incident.title || 'N/A'}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                              {getSiteName(incident)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDate(incident.created_at)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleView(incident.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {incidents.length > 10 && (
              <div className="text-center text-[10px] text-muted-foreground mt-3">
                Showing 10 of {incidents.length} incidents
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
