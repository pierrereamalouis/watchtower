import { boolean, date, integer, pgEnum, pgTable, serial, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const expeseStatus = pgEnum("expense_status", ["paid", "partial", "unpaid"]);
export const accountVisibility = pgEnum("account_visibility", ["household", "personal"]);
export const memberRole = pgEnum("member_role", ["owner", "admin", "member"]);
export const payCadence = pgEnum("pay_cadence", ["weekly", "bi_weekly", "monthly", "yearly"]);
export const expenseType = pgEnum("expense_type", ["anticipated", "occurred"]);

// ========================================================
// Core identity / multi-member support
// ========================================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const householdMembers = pgTable("household_members", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: memberRole("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
  name: text("name").notNull(),
  institution: text("institution"),
  visibility: accountVisibility("visibility").notNull().default("personal"),
  ownerUserId: integer("owner_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isShared: boolean("is_shared").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(), // Positive for income, negative for expenses
  status: expeseStatus("status").notNull().default("unpaid"),
  type: expenseType("type").notNull().default("occurred"),
  note: text("note"),
  transactionDate: date("transaction_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
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
