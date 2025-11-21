import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { db } from "@db/client.ts";

export function makeApp() {
  const app = new Hono<{ Variables: { db: typeof db } }>();

  app.use("*", cors(), async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  // DB ping
  app.get("health/db", async (c) => {
    const [{ now }] = await c.get("db").execute(`SELECT NOW() AS now`);

    return c.json({ ok: true, now });
  });

  return app;
}
