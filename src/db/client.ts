import postgres from "postgres"; // npm:postgres
import { drizzle } from "drizzle-orm/postgres-js";
import { CONFIG } from "@config";

export const client = postgres(CONFIG.db.url, { ssl: "prefer" });
export const db = drizzle(client);
