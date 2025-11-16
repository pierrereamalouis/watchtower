import { boolean, date, integer, json, pgEnum, pgTable, serial, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

export const userRole = pgEnum("user_role", ["admin", "user"]);
export const expenseStatus = pgEnum("expense_status", ["paid", "partial", "unpaid"]);
export const accountVisibility = pgEnum("account_visibility", ["household", "personal"]);
export const memberRole = pgEnum("member_role", ["owner", "admin", "member"]);
export const payCadence = pgEnum("pay_cadence", ["weekly", "bi_weekly", "monthly", "yearly"]);
export const paycheckOccurrence = pgEnum("paycheck_occurrence", ["1", "2"]);
export const expenseType = pgEnum("expense_type", ["anticipated", "occurred"]);

// ========================================================
// Core identity / multi-member support
// ========================================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
});

export const householdMembers = pgTable("household_members", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: memberRole("role").notNull().default("member"),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
});

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(householdMembers),
}));

// ========================================================
// Accounts / categories / labels (general finance layer)
// ========================================================

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  institution: text("institution"),
  visibility: accountVisibility("visibility").notNull().default("personal"),
  ownerUserId: integer("owner_user_id").references(() => users.id, { onDelete: "set null" }),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isShared: boolean("is_shared").notNull().default(false),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({
  uniqPerUserId: { columns: [t.userId, t.name], unique: true },
}));

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
  transferTargetAccountId: integer("transfer_target_account_id").references(() => bankAccounts.id, {
    onDelete: "set null",
  }),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({
  uniqPerUserId: { columns: [t.userId, t.name], unique: true },
}));

// ========================================================
// Transactions (general, not just budget view)
// ========================================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => bankAccounts.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  householdId: integer("household_id").references(() => households.id, { onDelete: "set null" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(), // Positive for income, negative for expenses
  status: expenseStatus("status").notNull().default("unpaid"),
  type: expenseType("type").notNull().default("occurred"),
  note: text("note"),
  transactionDate: date("transaction_date").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const transactionLabels = pgTable("transaction_labels", {
  transactionId: integer("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  labelId: integer("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: { columns: [t.transactionId, t.labelId], primaryKey: true },
}));

// ========================================================
// Your budget-focused tables
// (these are the ones from your brainstorm, cleaned up)
// ========================================================
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: integer("household_id").references(() => households.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  payCadence: payCadence("pay_cadence").notNull().default("bi_weekly"),
  incomeCents: integer("income_cents").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({
  byUser: { columns: [t.userId] },
}));

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  allocatedCents: integer("allocated_cents").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({
  uniqPerBudget: { columns: [t.budgetId, t.categoryId], unique: true },
}));

export const budgetSnapshots = pgTable("budget_snapshots", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date").notNull(),
  totalIncomeCents: integer("total_income_cents").notNull(),
  totalExpensesCents: integer("total_expenses_cents").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetTemplates = pgTable("budget_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  template: json("template").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const budgetPaychecks = pgTable("budget_paychecks", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  occurrenceDate: date("occurrence_date").notNull(), // paycheck '1'  or paycheck '2' of the month, etc.
  amountCents: integer("amount_cents").notNull(),
  payDate: date("pay_date").notNull(),
  lastOccurrenceDate: date("last_occurrence_date"),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({ byBudget: { columns: [t.budgetId] } }));

export const budgetTransfers = pgTable("budget_transfers", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  fromPaycheckId: integer("from_paycheck_id").notNull().references(() => budgetPaychecks.id, { onDelete: "cascade" }),
  toAccountId: integer("to_account_id").notNull().references(() => bankAccounts.id, { onDelete: "cascade" }),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({ byBudget: { columns: [t.budgetId] } }));

export const budgetEntries = pgTable("budget_entries", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  paycheckId: integer("paycheck_id").notNull().references(() => budgetPaychecks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  paycheckOccurrence: paycheckOccurrence("paycheck_occurrence").notNull(),
  transferId: integer("transfer_id").references(() => budgetTransfers.id, { onDelete: "set null" }),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

// ========================================================
// Pay schedules (general, not just budget) — useful later
// ========================================================

export const paySchedules = pgTable("pay_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: integer("household_id").references(() => households.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  payCadence: payCadence("pay_cadence").notNull().default("bi_weekly"),
  nextPayDate: date("next_pay_date").notNull(),
  anchorDate: date("anchor_date").notNull(),
  amountCents: integer("amount_cents").notNull(),
  depositAccountId: integer("deposit_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  active: boolean("active").notNull().default(true),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const payPeriods = pgTable("pay_periods", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull().references(() => paySchedules.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  expectedAmountCents: integer("expected_amount_cents").notNull(),
  actualAmountCents: integer("actual_amount_cents"),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({ bySchedule: { columns: [t.scheduleId, t.startDate, t.endDate], unique: true } }));

// ========================================================
// 12-week year monitoring
// ========================================================

export const twelveWeekCycles = pgTable("twelve_weeks_cycles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: integer("household_id").references(() => households.id, { onDelete: "set null" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  goals: json("goals"),
  totalBudgetCents: integer("total_budget_cents").notNull(),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
});

export const dailyExpenses = pgTable("daily_expenses", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id").notNull().references(() => twelveWeekCycles.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: integer("household_id").references(() => households.id, { onDelete: "set null" }),
  expenseDate: date("expense_date").notNull(),
  title: text("title").notNull(),
  amountCents: integer("amount_cents").notNull(),
  description: text("description"),
  expenseType: expenseType("expense_type").notNull().default("occurred"),
  expenseStatus: expenseStatus("expense_status").notNull().default("unpaid"),
  createdOn: timestamp("created_on", { withTimezone: true }).defaultNow().notNull(),
  updatedOn: timestamp("updated_on", { withTimezone: true }),
}, (t) => ({ byCycleAndDate: { columns: [t.cycleId, t.expenseDate] } }));
