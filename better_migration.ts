import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
    host: process.env.PG_HOST,
    port: 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

try {
    await migrate(drizzle(pool), { migrationsFolder: "./database" });
    console.log("migrations applied");
} catch (e) {
    console.error(e);
    process.exitCode = 1;
} finally {
    await pool.end();
}