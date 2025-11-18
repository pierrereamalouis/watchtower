export const ExpenseStatus = {
  PAID: "paid",
  UNPAID: "unpaid",
  PARTIAL: "partial",
} as const;

export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];
