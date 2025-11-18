// types/leave.ts
export type priority = 'High' | 'Low' ;
export type status = 'Close' | 'In Progress' | 'Solved' | 'Cancelled';

export interface Complainant {
  id: number;
  title: string;
  reporter: string;
  reporter_name: string;
  against: string;
  against_name: string;
  priority: priority;
  status: status;
  attachment?: string;
}

export interface ViewComplainantTopCardProps {
  complainant: Complainant;
}