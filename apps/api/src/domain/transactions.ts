import { ExpenseStatus, ExpenseType } from "@enums";
/**
 * Transaction creation at the domain level.
 * (“API shape”: db type will likely match closely.)
 */
export interface CreateTransactionInput {
  userId: number;
  twelveWeekCycleId: number;
  amountCents: number;
  date: Date;
  note?: string | null;
}

/**
 * Reassign or attach a transaction to a twelve-week cycle budget entry.
 */
export interface AssignTransactionToBudgetEntryInput {
  transactionId: number;
  twelveWeekCycleId: number;
  budgetEntryId: number;
  userId: number;
}

export interface TransactionForBudget {
  userId: number;
  budgetId: number;
  amountCents: number;
  status: ExpenseStatus;
  type: ExpenseType;
}

export interface TransactionByDateRange extends TransactionForBudget {
  startDate: Date;
  endDate: Date;
}

// --- REPOSITORIES  INTERFACES ---
export interface TransactionRepository {
  listTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<TransactionByDateRange>;

  listTransactionsForBudget(userId: number, budgetId: number): Promise<TransactionByDateRange>;
}
