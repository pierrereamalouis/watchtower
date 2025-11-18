import { Budget, BudgetEntry, DailyExpense, Transaction, TwelveWeekCycle } from "@/lib/types/db.ts";
import { PayCadence, PayPeriodIndex } from "@enums";

/**
 * A budget entry plus its “actuals” (sum of linked transactions).
 */
export interface BudgetEntryWithActuals {
  entry: BudgetEntry;
  actualAmount: number; //sum of transactions linked to this entry
  remainingAmount: number;
}

export interface BudgetWithEntries {
  budget: Budget;
  entries: BudgetEntryWithActuals[];
}

export interface BudgetSummary {
  budget: Budget;
  totalPlanned: number;
  totalActual: number;
  remaining: number;
}

export interface DailySummary {
  date: Date;
  totalSpent: number;
  byCategory?: Array<{
    categoryId: number;
    total: number;
  }>;
}

export interface TwelveWeekCycleSummary {
  cycle: TwelveWeekCycle;
  totalPlanned: number;
  totalActual: number;

  // can extend later (e.g. goal completion %, streak score, etc.)
}

/**
 * Create a new budget *and* its entries in one go.
 * Think: “build my bi-weekly template and save it”.
 */

export interface CreateBudgetWithEntries {
  householdId?: number;
  userId: number;
  label: string; // e.g. "Jan 2026 - Paycheck 1"
  name: string;
  incomeCents: number;
  payCadence: PayCadence;
  payPeriodIndex: PayPeriodIndex;
  entries: Array<{
    categoryId: number;
    plannedAmount: number;
  }>;
}
