CREATE TYPE "public"."account_visibility" AS ENUM('household', 'personal');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('paid', 'partial', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('anticipated', 'occurred');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."pay_cadence" AS ENUM('weekly', 'bi_weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."paycheck_occurrence" AS ENUM('1', '2');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"institution" text,
	"visibility" "account_visibility" DEFAULT 'personal' NOT NULL,
	"owner_user_id" integer,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"allocated_cents" integer NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budget_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"paycheck_id" integer NOT NULL,
	"name" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"paycheck_occurrence" "paycheck_occurrence" NOT NULL,
	"transfer_id" integer,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budget_paychecks" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"occurrence_date" date NOT NULL,
	"amount_cents" integer NOT NULL,
	"pay_date" date NOT NULL,
	"last_occurrence_date" date,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budget_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_income_cents" integer NOT NULL,
	"total_expenses_cents" integer NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"template" json NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budget_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"name" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"from_paycheck_id" integer NOT NULL,
	"to_account_id" integer NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"household_id" integer,
	"name" text NOT NULL,
	"pay_cadence" "pay_cadence" DEFAULT 'bi_weekly' NOT NULL,
	"income_cents" integer NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"household_id" integer,
	"expense_date" date NOT NULL,
	"title" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"description" text,
	"expense_type" "expense_type" DEFAULT 'occurred' NOT NULL,
	"expense_status" "expense_status" DEFAULT 'unpaid' NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"transfer_target_account_id" integer,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pay_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"expected_amount_cents" integer NOT NULL,
	"actual_amount_cents" integer,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pay_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"household_id" integer,
	"name" text NOT NULL,
	"pay_cadence" "pay_cadence" DEFAULT 'bi_weekly' NOT NULL,
	"next_pay_date" date NOT NULL,
	"anchor_date" date NOT NULL,
	"amount_cents" integer NOT NULL,
	"deposit_account_id" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transaction_labels" (
	"transaction_id" integer NOT NULL,
	"label_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"category_id" integer,
	"household_id" integer,
	"user_id" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" "expense_status" DEFAULT 'unpaid' NOT NULL,
	"type" "expense_type" DEFAULT 'occurred' NOT NULL,
	"note" text,
	"transaction_date" date NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "twelve_weeks_cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"household_id" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"goals" json,
	"total_budget_cents" integer NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_on" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_paycheck_id_budget_paychecks_id_fk" FOREIGN KEY ("paycheck_id") REFERENCES "public"."budget_paychecks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_transfer_id_budget_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."budget_transfers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_paychecks" ADD CONSTRAINT "budget_paychecks_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_snapshots" ADD CONSTRAINT "budget_snapshots_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transfers" ADD CONSTRAINT "budget_transfers_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transfers" ADD CONSTRAINT "budget_transfers_from_paycheck_id_budget_paychecks_id_fk" FOREIGN KEY ("from_paycheck_id") REFERENCES "public"."budget_paychecks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transfers" ADD CONSTRAINT "budget_transfers_to_account_id_bank_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_expenses" ADD CONSTRAINT "daily_expenses_cycle_id_twelve_weeks_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."twelve_weeks_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_expenses" ADD CONSTRAINT "daily_expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_expenses" ADD CONSTRAINT "daily_expenses_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_transfer_target_account_id_bank_accounts_id_fk" FOREIGN KEY ("transfer_target_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_periods" ADD CONSTRAINT "pay_periods_schedule_id_pay_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."pay_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_schedules" ADD CONSTRAINT "pay_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_schedules" ADD CONSTRAINT "pay_schedules_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_schedules" ADD CONSTRAINT "pay_schedules_deposit_account_id_bank_accounts_id_fk" FOREIGN KEY ("deposit_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_labels" ADD CONSTRAINT "transaction_labels_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_labels" ADD CONSTRAINT "transaction_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twelve_weeks_cycles" ADD CONSTRAINT "twelve_weeks_cycles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twelve_weeks_cycles" ADD CONSTRAINT "twelve_weeks_cycles_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;