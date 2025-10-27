import postgres from "postgres"; // npm:postgres
import { drizzle } from "drizzle-orm/postgres-js";
import { CONFIG } from "@/config/config.ts";

const sql = postgres(CONFIG.db.url, { ssl: "prefer" });
export const db = drizzle(sql);
