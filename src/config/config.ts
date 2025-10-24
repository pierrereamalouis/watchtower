import { load } from "dotenv";

const isDev = Deno.env.get("DENO_ENV") !== "production";

if (isDev) await load({ export: true });

export const CONFIG = {
  databaseUrl: Deno.env.get("DATABASE_URL") || "",
  port: Number(Deno.env.get("PORT") || 8000),
  env: Deno.env.get("DENO_ENV") ?? "development",
};
