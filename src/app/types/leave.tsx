// types/leave.ts
export type LeaveStatus = 'Approve' | 'Pending' | 'Reject';
export type CalculationUnit = 'Daily' | 'Weekly' | 'Monthly' | 'Hourly';
export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Unpaid Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Emergency Leave' | 'Study Leave' | 'Marriage Leave' | 'Official Leave' | 'Incentive Leave';

export interface Leave {
  id: number;
  guardName: string;
  leaveType: LeaveType;
  calculationUnit: CalculationUnit;
  amount: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  status: LeaveStatus;
}

export interface ViewLeaveTopCardProps {
  leave: Leave;
}