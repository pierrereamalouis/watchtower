import { z } from "zod";

const zBool = z.string().transform((val) => val.toLocaleLowerCase()).pipe(
  z.enum(["true", "false"]),
).transform((val) => val === "true");

const zNumber = z.string().regex(/^\d+$/).transform((val) => Number(val));

const EnvSchema = z.object({
  DENO_ENV: z.enum(["development", "production", "test", "staging"]).default(
    "development",
  ),
  PORT: zNumber.default(8000),
  DATABASE_URL: z.string().min(1, "Database_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  ENABLE_BETA: zBool.optional().default(false),
});

function required(name: string): string {
  const val = Deno.env.get(name);
  if (!val) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

function getOrDefault(name: string, fallback?: string): string {
  const v = Deno.env.get(name);
  return v ?? fallback ?? "";
}

const parsed = EnvSchema.parse({
  DENO_ENV: getOrDefault("DENO_ENV", "development"),
  PORT: getOrDefault("PORT", "8000"),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  ENABLE_BETA: getOrDefault("ENABLE_BETA", "false"),
});

export const CONFIG = {
  app: {
    env: Deno.env.get("DENO_ENV") ?? "development",
    port: Number(Deno.env.get("PORT") || 8000),
    isDev: (Deno.env.get("Deno_ENV") ?? "development") !== "production",
  },
  db: {
    url: required("DATABASE_URL"),
  },
  auth: {
    jwtSecret: required("JWT_SECRET"),
  },
  features: {
    enableBeta: Deno.env.get("ENABLE_BETA") === "true",
  },
} as const;

export type AppConfig = typeof CONFIG;
