// data/leaves.ts

import { Leave } from "@/app/types/leave";

export const leaves: Leave[] = [
  {
    id: 1,
    guardName: "Guard name",
    leaveType: "Annual Leave",
    calculationUnit: "Daily",
    amount: 2,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    status: "Approve"
  },
  {
    id: 2,
    guardName: "Guard name",
    leaveType: "Sick Leave",
    calculationUnit: "Weekly",
    amount: 1,
    startDate: "11/08/2025",
    endDate: "18/08/2025",
    status: "Pending"
  },
  {
    id: 3,
    guardName: "Guard name",
    leaveType: "Unpaid Leave",
    calculationUnit: "Daily",
    amount: 2,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    status: "Pending"
  },
  {
    id: 4,
    guardName: "Guard name",
    leaveType: "Maternity Leave",
    calculationUnit: "Hourly",
    amount: 5,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "23:40",
    status: "Approve"
  },
  {
    id: 5,
    guardName: "Guard name",
    leaveType: "Paternity Leave",
    calculationUnit: "Monthly",
    amount: 2,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    status: "Reject"
  },
  {
    id: 6,
    guardName: "Guard name",
    leaveType: "Emergency Leave",
    calculationUnit: "Hourly",
    amount: 6,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "08:12",
    status: "Reject"
  },
  {
    id: 7,
    guardName: "Guard name",
    leaveType: "Study Leave",
    calculationUnit: "Hourly",
    amount: 6,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "08:12",
    status: "Reject"
  },
  {
    id: 8,
    guardName: "Guard name",
    leaveType: "Marriage Leave",
    calculationUnit: "Hourly",
    amount: 6,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "08:12",
    status: "Reject"
  },
  {
    id: 9,
    guardName: "Guard name",
    leaveType: "Official Leave",
    calculationUnit: "Hourly",
    amount: 6,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "08:12",
    status: "Reject"
  },
  {
    id: 10,
    guardName: "Guard name",
    leaveType: "Incentive Leave",
    calculationUnit: "Hourly",
    amount: 6,
    startDate: "11/08/2025",
    endDate: "11/08/2025",
    startTime: "08:12",
    status: "Reject"
  }
];