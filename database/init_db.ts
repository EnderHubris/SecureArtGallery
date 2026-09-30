import { drizzle } from 'drizzle-orm/node-postgres';
import {
    eq
} from "drizzle-orm";
import * as schema from "./schema";
import { createHash } from "node:crypto";

const dbu = process.env.PG_USER;
const dbupwd = process.env.PG_PASSWORD;
const dbuhost = process.env.PG_HOST;
const dbname = process.env.PG_DATABASE;
const DB_URI = `postgresql://${dbu}:${dbupwd}@${dbuhost}/${dbname}`;
export const db = drizzle(DB_URI);

if (!process.env.ADM_PASSWORD) {
    console.error("[-] Missing Admin Password!")
    process.exit(1);
}
if (!process.env.ADM_EMAIL) {
    console.error("[-] Missing Admin Email!")
    process.exit(1);
}

try {
    console.log(`[!] Inserting Default Admin: ${dbu}/${dbname}`);

    const password_hash = createHash("sha256")
        .update(process.env.ADM_PASSWORD)
        .digest("hex");

    const admin = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, "admin"))
        .limit(1);

    if (admin.length > 0) {
        // update existing entry
        await db
            .update(schema.users)
            .set({
                username: process.env.ADM_USERNAME ?? "admin",
                email: process.env.ADM_EMAIL,
                password_hash,
                role: "admin",
            })
            .where(eq(schema.users.id, admin[0].id));
        console.log("[+] Admin Reset!")
    } else {
        // create new admin
        await db.insert(schema.users).values({
            username: process.env.ADM_USERNAME ?? "admin",
            email: process.env.ADM_EMAIL,
            password_hash,
            role: "admin",
        });
        console.log("[+] Admin Inserted!")
    }

    process.exit(0);
} catch (e: any) {
    console.error("[-] Err Inserting:", e);
    process.exit(1);
}