export type DutyStatus =
  | 'Shift completed'
  | 'On Duty'
  | 'In Progress'
  | 'Late'
  | 'Missed Check-in';

export interface Duty {
  row: number;
  title: string;
  date: string;
  site: string;
  guard_name: string;
  mandatory_check_in: number;
  required_hours: number;
  check_in: string | null;
  check_out: string | null;
  total_working_hours: number | null;
  status: DutyStatus;
}

export interface ViewDutyTopCardProps {
  duty: Duty;
}