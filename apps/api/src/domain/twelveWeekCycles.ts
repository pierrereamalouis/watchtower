import { TwelveWeekCycle } from "@/lib/types/db.ts";

export interface TwelveWeekCycleSummary {
  cycle: TwelveWeekCycle;
  totalPlanned: number;
  totalActual: number;

  // can extend later (e.g. goal completion %, streak score, etc.)
}

/**
 * For creating or editing a 12-week cycle.
 */

export interface UpsertTwelveWeekCycleInput {
  userId: number;
  householdId?: number;
  label: string;
  startDate: Date;
  endDate: Date;
  cycleId?: number; //if present, update; else create new
}
