import { makeApp } from "./app.ts";

const app = makeApp();
Deno.serve({ port: 8000 }, app.fetch);
console.log("🚀 Server running at http://localhost:8000");
