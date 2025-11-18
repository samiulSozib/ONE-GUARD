export interface Expense {
  id: string;
  description: string;
  date: string;
  time: string;
  amount: string;
  depositId: string;
  hasAttachment: boolean;
}


export interface ViewExpenseTopCardProps {
  expense: Expense;
}