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
