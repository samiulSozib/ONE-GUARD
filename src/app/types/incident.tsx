export type IncidentStatus =
  | "Reviewed"
  | "Unreviewed"
  | "Pending"
  | "Resolved"
  | "Dismissed";

export interface Incident {
  row: number;
  tracking_code: string;
  title: string;
  site_name: string;
  reporter: string;
  client_name: string;
  guard_name: string;
  date: string;
  time: string;
  status: IncidentStatus;
}

export interface ViewIncidentTopCardProps {
  incident: Incident;
}
