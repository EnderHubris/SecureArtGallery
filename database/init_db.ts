import { drizzle } from 'drizzle-orm/node-postgres';
import {
    eq, sql
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

// inserting super admin (cannot be removed by other non-super admins)
try {
    console.log(`[!] Inserting Default Admin: ${dbu}/${dbname}`);

    const password_hash = createHash("sha256")
        .update(process.env.ADM_PASSWORD)
        .digest("hex");

    const defaultAdmin = {
        username: process.env.ADM_USERNAME ?? "admin",
        email: process.env.ADM_EMAIL,
        password_hash,
        role: "admin",
        sudo: true,
    }

    // find super admin account
    const [superAdmin] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.sudo, true))
        .limit(1);

    if (superAdmin) {
        // update existing entry
        await db
            .update(schema.users)
            .set(defaultAdmin)
            .where(eq(schema.users.sudo, true));
        console.log("[+] Super Admin Reset!")
    } else {
        // create new super admin
        await db.insert(schema.users).values(defaultAdmin);
        console.log("[+] Super Admin Inserted!")
    }

} catch (e: any) {
    console.error("[-] Err Inserting:", e);
    process.exit(1);
}

// defining the gallery layout
try {
    console.log(`[!] Creating Room-Layout: ${dbu}/${dbname}`);

    /**
            +-----------+         +-----------+
            |  Hall A   |---------|   LOBBY   |
            +-----------+         |   (id 1)  |
                  |               +-----------+
                  |                     |
                  |                     |
            +-----------+         +-----------+
            |  Hall C   |---------|  Hall B   |
            +-----------+         +-----------+
                  |
                  |
            +###########+
            # RESTRICTED #
            #   HALL    #
            +###########+
     */

    const inserted = await db.insert(schema.rooms).values([
        { name: "Lobby", occupancy: 35 },
        { name: "Hall A" },
        { name: "Hall B", occupancy: 25 },
        { name: "Hall C" },
        { name: "Restricted Hall", is_restricted: true },
    ]).onConflictDoUpdate({
        target: schema.rooms.name,
        set: {
            occupancy: sql`excluded.occupancy`,
            is_restricted: sql`excluded.is_restricted`,
        },
    }).returning();

    const id = Object.fromEntries(inserted.map(r => [r.name, r.id]));

    // forming edges to define the room-connections
    const edges: [string, string][] = [
        ["Lobby", "Hall A"],
        ["Lobby", "Hall B"],
        ["Hall A", "Hall C"],
        ["Hall B", "Hall C"],
        ["Hall C", "Restricted Hall"],
    ];

    // inserting bi-directional adjacencies
    await db.insert(schema.room_adjacency).values(
        edges.flatMap(([a, b]) => [
            { room_id: id[a], adj_id: id[b] },
            { room_id: id[b], adj_id: id[a] },
        ])
    ).onConflictDoNothing();

    console.log(`[+] Inserted ${inserted.length} rooms, ${edges.length * 2} adjacency rows`);
    process.exit(0);
} catch (e: any) {
    console.error("[-] Err Inserting Rooms:", e);
    process.exit(1);
}