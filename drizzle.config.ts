import { defineConfig } from "drizzle-kit";

console.log("[*] Starting Drizzle Configuration...")
console.log(" |___ Interacting with HOST:", process.env.PG_HOST, "DB:", process.env.PG_DATABASE);
export default defineConfig({
    schema: "./database/schema.ts",
    out: "./database",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.PG_HOST!,
        port: 5432,
        user: process.env.PG_USER!,
        password: process.env.PG_PASSWORD!,
        database: process.env.PG_DATABASE!,
    }
});