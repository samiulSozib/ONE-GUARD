// app/types/adminDashboard.types.ts

export interface DashboardOverview {
  total_guards: number;
  online_guards: number;
  offline_guards: number;
  on_duty: number;
  on_break: number;
  late_checkins: number;
  upcoming_shifts_24h: number;
}

export interface DashboardContracts {
  total_projects: number;
  active_contracts: number;
  expiring_30_days: number;
}

export interface DashboardIncidents {
  total: number;
  this_month: number;
  open: number;
}

export interface DashboardClients {
  active: number;
  total: number;
}

export interface DashboardVerifications {
  pending_guards: number;
  pending_documents: number;
}

export interface DashboardReviews {
  total_items: number;
  average_rating: number;
  recent: Array<{
    id: number;
    client_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
}

export interface RecentClient {
  id: number;
  client_name: string;
  location: string;
  requested_date: string;
  requested_time: string;
  status: string;
}

export interface OngoingShift {
  id: number;
  shift_title: string;
  site_name: string;
  guard_name: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  contracts: DashboardContracts;
  incidents: DashboardIncidents;
  clients: DashboardClients;
  verifications: DashboardVerifications;
  reviews: DashboardReviews;
  recent_clients: RecentClient[];
  ongoing_shifts: OngoingShift[];
}

export interface DashboardResponse {
  status: string;
  status_code: number;
  success: boolean;
  body: DashboardData;
}

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}