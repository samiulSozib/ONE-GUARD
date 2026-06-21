// // app/types/adminDashboard.types.ts

// export interface DashboardOverview {
//   total_guards: number;
//   online_guards: number;
//   offline_guards: number;
//   on_duty: number;
//   on_break: number;
//   late_checkins: number;
//   upcoming_shifts_24h: number;
// }

// export interface DashboardContracts {
//   total_projects: number;
//   active_contracts: number;
//   expiring_30_days: number;
// }

// export interface DashboardIncidents {
//   total: number;
//   this_month: number;
//   open: number;
// }

// export interface DashboardClients {
//   active: number;
//   total: number;
// }

// export interface DashboardVerifications {
//   pending_guards: number;
//   pending_documents: number;
// }

// export interface DashboardReviews {
//   total_items: number;
//   average_rating: number;
//   recent: Array<{
//     id: number;
//     client_name: string;
//     rating: number;
//     comment: string;
//     created_at: string;
//   }>;
// }

// export interface RecentClient {
//   id: number;
//   client_name: string;
//   location: string;
//   requested_date: string;
//   requested_time: string;
//   status: string;
// }

// export interface OngoingShift {
//   guard_name:string|null,
//   mission:string|null,
//   status:string|null,
//   status_color:string|null,
//   assignment_id:number
// }

// export interface DashboardData {
//   overview: DashboardOverview;
//   contracts: DashboardContracts;
//   incidents: DashboardIncidents;
//   clients: DashboardClients;
//   verifications: DashboardVerifications;
//   reviews: DashboardReviews;
//   recent_clients: RecentClient[];
//   ongoing_shifts: OngoingShift[];
// }

// export interface DashboardResponse {
//   status: string;
//   status_code: number;
//   success: boolean;
//   body: DashboardData;
// }

// export interface DashboardState {
//   data: DashboardData | null;
//   isLoading: boolean;
//   error: string | null;
//   lastFetched: string | null;
// }


// app/types/adminDashboard.types.ts

export interface DashboardOverview {
  total_guards: number;
  online_guards: number;
  offline_guards: number;
  on_duty: number;
  on_break: number;
  late_checkins: number;
  overdue_checkouts: number; // Added - exists in JSON
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
  guard_name: string | null;
  mission: string | null;
  status: string | null;
  status_color: string | null;
  assignment_id: number;
  checked_in_at: string | null; // Added - exists in JSON
  shift_start: string; // Added - exists in JSON
  shift_end: string; // Added - exists in JSON
  shift_status: string; // Added - exists in JSON
  is_overdue: boolean; // Added - exists in JSON
  minutes_overdue: number; // Added - exists in JSON
}

// Jobs/Applications related interfaces
export interface JobApplication {
  id: number;
  full_name: string;
  email: string;
  job_title: string;
  status: string;
  status_text: string;
  status_color: string;
  applied_date: string;
  applied_time: string;
  has_resume: boolean;
}

export interface TopJob {
  id: number;
  title: string;
  location: string;
  applications_count: number;
  vacancies: number;
  is_urgent: boolean;
}

export interface DashboardJobs {
  total: number;
  active: number;
  urgent: number;
  featured: number;
}

export interface DashboardApplications {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interview_scheduled: number;
  hired: number;
  rejected: number;
  recent: JobApplication[];
  top_jobs: TopJob[];
}

export interface PendingCheckout {
  count: number;
  critical: number;
  warning: number;
  info: number;
  list: any[]; // You can define a more specific type if needed
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
  jobs: DashboardJobs; // Added - exists in JSON
  applications: DashboardApplications; // Added - exists in JSON
  pending_checkouts: PendingCheckout; // Added - exists in JSON
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