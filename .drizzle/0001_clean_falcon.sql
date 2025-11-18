ALTER TABLE "budgets" ALTER COLUMN "pay_cadence" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "pay_cadence" SET DEFAULT 'bi_weekly'::text;--> statement-breakpoint
ALTER TABLE "pay_schedules" ALTER COLUMN "pay_cadence" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pay_schedules" ALTER COLUMN "pay_cadence" SET DEFAULT 'bi_weekly'::text;--> statement-breakpoint
DROP TYPE "public"."pay_cadence";--> statement-breakpoint
CREATE TYPE "public"."pay_cadence" AS ENUM('weekly', 'bi_weekly', 'monthly');--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "pay_cadence" SET DEFAULT 'bi_weekly'::"public"."pay_cadence";--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "pay_cadence" SET DATA TYPE "public"."pay_cadence" USING "pay_cadence"::"public"."pay_cadence";--> statement-breakpoint
ALTER TABLE "pay_schedules" ALTER COLUMN "pay_cadence" SET DEFAULT 'bi_weekly'::"public"."pay_cadence";--> statement-breakpoint
ALTER TABLE "pay_schedules" ALTER COLUMN "pay_cadence" SET DATA TYPE "public"."pay_cadence" USING "pay_cadence"::"public"."pay_cadence";