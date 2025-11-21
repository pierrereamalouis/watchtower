// re-export inferred Drizzle types cleanly

import type {
  budgetEntries,
  budgets,
  dailyExpenses,
  households,
  transactions,
  twelveWeekCycles,
  users,
} from "@/db/schema.ts";

export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;

export type Budget = typeof budgets.$inferSelect;
export type BudgetInsert = typeof budgets.$inferInsert;

export type BudgetEntry = typeof budgetEntries.$inferSelect;
export type BudgetEntryInsert = typeof budgetEntries.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;

export type DailyExpense = typeof dailyExpenses.$inferSelect;
export type DailyExpenseInsert = typeof dailyExpenses.$inferInsert;

export type TwelveWeekCycle = typeof twelveWeekCycles.$inferSelect;
export type TwelveWeekCycleInsert = typeof twelveWeekCycles.$inferInsert;
