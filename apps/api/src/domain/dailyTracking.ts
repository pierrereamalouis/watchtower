export interface DailySummary {
  date: Date;
  totalSpent: number;
  byCategory?: Array<{
    categoryId: number;
    total: number;
  }>;
}

/**
 * Daily tracking edit.
 */
export interface UpsertDailyExpenseInput {
  userId: number;
  householdId?: number;
  date: Date;
  amountCents: number;
  note?: string | null;
}

// --- REPOSITORIES  INTERFACES ---
export interface DailyTrackingRepository {
  getDailySummary(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySummary[]>;

  upsertDailyExpense(input: UpsertDailyExpenseInput): Promise<void>;

  // Get all daily entries (expenses) for a cycle
  listDailyExpensesForCycle(
    userId: number,
    twelveWeekCycleId: number,
  ): Promise<DailySummary[]>;

  // Get daily expenses for a specific day
  listDailyExpensesByDate(
    userId: number,
    date: Date,
  ): Promise<DailySummary[]>;

  // Create a daily expense
  createDailyExpense(input: UpsertDailyExpenseInput): Promise<void>;

  // Update daily expense
  updateDailyExpense(input: UpsertDailyExpenseInput): Promise<void>;

  // Delete a daily expense
  deleteDailyExpense(
    userId: number,
    date: Date,
  ): Promise<void>;

  // Compute daily totals (for UI summary grids)
  getDailyTotalsForCycle(
    userId: number,
    twelveWeekCycleId: number,
  ): Promise<Array<{ date: Date; totalSpent: number }>>;
}
