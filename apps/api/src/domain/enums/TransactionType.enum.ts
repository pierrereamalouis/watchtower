export const TransactionType = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
