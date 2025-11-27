import type { db as dbClient } from "@/db/client.ts";
import { budgetEntries, budgets, transactions } from "@/db/schema.ts";
import type { Budget, BudgetEntry, BudgetInsert } from "@/lib/types/db.ts";
import { BudgetRepository, BudgetWithEntries, CreateBudgetWithEntries } from "@/domain/budgeting.ts";

import { and, eq } from "drizzle-orm";

// export type BudgetRepository = ReturnType<typeof createBudgetRepository>;

export function createBudgetRepository(db: typeof dbClient): BudgetRepository {
  return {
    async findBudgetWithEntries(
      budgetId: number,
    ): Promise<BudgetWithEntries | null> {
      const budget = await db
        .select()
        .from(budgets)
        .where(and(
          eq(budgets.id, budgetId),
        ))
        .limit(1);

      if (!budget) {
        return null;
      }

      const entries = await db
        .select()
        .from(budgetEntries)
        .where(eq(budgetEntries.budgetId, budgetId));

      return {
        budget: budget[0],
        entries,
      };
    },

    // async listBudgetSummariesByUserId(userId: number) {
    //   // Implementation omitted for brevity
    //   return [];
    // },

    async createBudgetWithEntries(data: CreateBudgetWithEntries): Promise<BudgetWithEntries> {
      const budgetId = await db.insert(budgets).values({
        name: data.name,
        userId: data.userId,
        incomeCents: data.incomeCents,
        payCadence: data.payCadence,
        payPeriodIndex: data.payPeriodIndex,
        label: data.label,
      }).returning({ insertedId: budgets.id });
  
      await db.insert(budgetEntries).values(data.entries);

      const insertedBudget = await db
        .select()
        .from(budgets)
        .where(eq(budgets.id, budgetId.insertedId))
        .limit(1);
      return null;
    },

    async updateBudget(budgetId: number, data) {
      // Implementation omitted for brevity
      return null;
    },

    async updateBudgetWithEntries(budgetId: number, data) {
      // Implementation omitted for brevity
      return null;
    },

    async upsertBudgetEntry(data) {
      // Implementation omitted for brevity
      return null;
    },

    async reorderBudgetEntries(data) {
      // Implementation omitted for brevity
    },

    async deleteBudget(budgetId: number, userId: number) {
      // Implementation omitted for brevity
    },
    async listBudgetEntries(budgetId: number): Promise<BudgetEntry[]> {
      const rows = await db
        .select()
        .from(budgetEntries)
        .where(eq(budgetEntries.budgetId, budgetId))
        .orderBy(budgetEntries.sortOrder);

      return rows;
    },
    async findById(id: number): Promise<Budget | null> {
      const rows = await db
        .select()
        .from(budgets)
        .where(and(
          eq(budgets.id, id),
        ));
      return rows[0] ?? null;
    },

    async listByHouseholdId(householdId: number): Promise<Budget[]> {
      const rows = await db
        .select()
        .from(budgets)
        .where(eq(budgets.householdId, householdId))
        .orderBy(
          budgets.createdOn,
        );

      return rows;
    },

    async listByUserId(userId: number): Promise<Budget[]> {
      const rows = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, userId))
        .orderBy(
          budgets.createdOn,
        );

      return rows;
    },
  };
}
