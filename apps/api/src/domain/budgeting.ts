import { Budget, BudgetEntry, BudgetEntryInsert, BudgetInsert } from "@/lib/types/db.ts";
import { PayCadence, PayPeriodIndex } from "@enums";
import { z } from "zod";
import { budgetEntries, budgetPaychecks, budgets } from "@/db/schema.ts";
import { createInsertSchema } from "drizzle-zod";

export const BudgetInsertSchema = createInsertSchema(budgets);
export const BudgetPaycheckInsertSchema = createInsertSchema(budgetPaychecks);
export const BudgetEntryInsertSchema = createInsertSchema(budgetEntries);

const BaseCreateBudgetEntryScheam = BudgetEntryInsertSchema.omit({
  id: true,
  budgetId: true,
  paycheckId: true,
  createdOn: true,
  updatedOn: true,
});

// Extend with how the UI links this entry to a paycheck
export const CreateBudgetEntrySchema = BaseCreateBudgetEntryScheam.extend({
  // e.g. 0 = first paycheck in the period, 1 = second paycheck…
  paycheckIndex: z.number().int().nonnegative(),
});

export type CreateBudgetEntry = z.infer<typeof CreateBudgetEntrySchema>;

const BaseCreateBudgetSchema = BudgetInsertSchema.omit({
  id: true,
  createdOn: true,
  updatedOn: true,
});

export const CreateBudgetWithEntriesSchema = BaseCreateBudgetSchema.extend({
  householdId: z.number().int().optional(),
  payCadence: z.enum(PayCadence),
  payPeriodIndex: z.enum(PayPeriodIndex),
  entries: z.array(CreateBudgetEntrySchema).min(1),
});

/**
 * Create a new budget *and* its entries in one go.
 * Think: “build my bi-weekly template and save it”.
 */
export type CreateBudgetWithEntries = z.infer<typeof CreateBudgetWithEntriesSchema>;

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
  entries: BudgetEntry[];
}

export interface BudgetSummary {
  budget: Budget;
  totalPlanned: number;
  totalActual: number;
  remaining: number;
}

/**
 * Used when tweaking an existing budget (rename, dates, etc.).
 */
export interface UpdateBudgetInput {
  label?: string;
  startDate?: Date;
  endDate?: Date;
  payperiodIndex?: PayPeriodIndex;
  twelveWeekCycleId?: number | null;
}

export interface UpdateBudgetWithEntries extends UpdateBudgetInput {
  entries?: Array<{
    entryId: number;
    plannedAmount?: number;
    note?: string | null;
    sortOrder?: number;
  }>;
}

/**
 * Upsert for a single budget entry inside a budget.
 */
export interface UpsertBudgetEntryInput {
  budgetId: number;
  userId: number;
  householdId?: number;
  categoryId: number;
  plannedAmount: number;
  entryId?: number; //if present, update; else create new
  sortOrder?: number;
  note?: string | null;
}

/**
 * Reorder entries in a budget (drag & drop in UI).
 */
export interface ReorderBudgetEntriesInput {
  budgetId: number;
  userId: number;
  householdId?: number;
  orderedEntryIds: number[];
}

// --- REPOSITORIES  INTERFACES ---
export interface BudgetRepository {
  // Fetch a full budget with all entries + computed actuals
  findBudgetWithEntries(budgetId: number): Promise<BudgetWithEntries | null>;

  // List budget summaries for a user
  // listBudgetSummariesByUserId(userId: number): Promise<BudgetSummary[]>;

  // Create a new budget with entries
  createBudgetWithEntries(data: CreateBudgetWithEntries): Promise<BudgetWithEntries>;

  // Update an existing budget
  updateBudget(budgetId: number, data: UpdateBudgetInput): Promise<Budget | null>;

  // Update a budget along with its entries
  updateBudgetWithEntries(budgetId: number, data: UpdateBudgetWithEntries): Promise<BudgetWithEntries | null>;

  // Upsert a budget entry
  upsertBudgetEntry(data: UpsertBudgetEntryInput): Promise<BudgetEntry>;

  // Reorder budget entries
  reorderBudgetEntries(data: ReorderBudgetEntriesInput): Promise<void>;

  // Delete a budget (and its entries)
  deleteBudget(budgetId: number, userId: number): Promise<void>;

  // List all entries for a budget (without actuals)
  listBudgetEntries(budgetId: number): Promise<BudgetEntry[]>;

  // Find a budget by ID
  findById(id: number): Promise<Budget | null>;

  // List budgets by household ID
  listByHouseholdId(householdId: number): Promise<Budget[]>;

  // List budgets by user ID
  listByUserId(userId: number): Promise<Budget[]>;
}
