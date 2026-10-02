import { drizzle } from 'drizzle-orm/node-postgres';

const dbu = process.env.PG_USER;
const dbupwd = process.env.PG_PASSWORD;
const dbuhost = process.env.PG_HOST;
const dbname = process.env.PG_DATABASE;
const DB_URI = `postgresql://${dbu}:${dbupwd}@${dbuhost}/${dbname}`;
export const db = drizzle(DB_URI);

console.log(`[!] Backend Database: ${dbu}/${dbname}`);