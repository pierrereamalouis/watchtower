import type { db as dbClient } from "@/db/client.ts";
import { budgetEntries, budgets, transactions } from "@/db/schema.ts";
import type { Budget, BudgetInsert } from "@/lib/types/db.ts";

import { and, eq } from "drizzle-orm";

export type BudgetRepository = ReturnType<typeof createBudgetRepository>;

export function createBudgetRepository(db: typeof dbClient) {
  return {
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
