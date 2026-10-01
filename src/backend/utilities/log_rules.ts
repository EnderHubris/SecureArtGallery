import { db } from "../db";
import {
    eq, desc
} from "drizzle-orm";
import * as schema from "../../../database/schema";
import { alias } from "drizzle-orm/pg-core";

export async function TrackMovement(
    ip: string,
    action: string,
    uid: string,
    src_room: number,
    dest_room: number
) {
    try {
        await db.insert(schema.access_logs).values({
            uid: uid,
            src_room_id: src_room,
            dst_room_id: dest_room,
            action: action,
            ip_address: (ip === "::1") ? "localhost" : ip,
        });
        console.log(`[AUDIT-MOVEMENT ${new Date().toDateString()}] - Tracking User Movement`);
        return true;
    } catch (e) {
        console.error(`[AUDIT-MOVEMENT ${new Date().toDateString()}]`, e);
        return false;
    }
}

export async function GetActionLogs(page: number): Promise<{
    success: boolean;
    action_logs: {
        id: number;                      // match your column types (see notes)
        uid: number | null;
        username: string | null;         // nullable because of leftJoin
        email: string | null;
        src_room_id: number | null;
        dst_room_id: number | null;
        src_room_name: string | null;
        dst_room_name: string | null;
        action: string;
        ip_address: string;
        created_at: Date;
    }[];
}> {
    try {
        page = Number.isInteger(page) && page > 0 ? page : 1;

        const srcRoom = alias(schema.rooms, "src_room");
        const dstRoom = alias(schema.rooms, "dst_room");

        const action_logs = await db
            .select({
                id: schema.access_logs.id,
                uid: schema.access_logs.uid,
                username: schema.users.username,
                email: schema.users.email,                 // <- comma was missing
                src_room_id: schema.access_logs.src_room_id,
                dst_room_id: schema.access_logs.dst_room_id,
                src_room_name: srcRoom.name,
                dst_room_name: dstRoom.name,
                action: schema.access_logs.action,         // declared in the return type, was never selected
                ip_address: schema.access_logs.ip_address, // same
                created_at: schema.access_logs.created_at,
            })
            .from(schema.access_logs)
            .leftJoin(schema.users, eq(schema.access_logs.uid, schema.users.id))
            .leftJoin(srcRoom, eq(schema.access_logs.src_room_id, srcRoom.id))
            .leftJoin(dstRoom, eq(schema.access_logs.dst_room_id, dstRoom.id))
            .orderBy(desc(schema.access_logs.created_at), desc(schema.access_logs.id))
            .limit(16)
            .offset(16 * (page - 1));

        return { success: true, action_logs };
    } catch (e) {
        console.error("[-] GetActionLogs:", e);
        return { success: false, action_logs: [] };
    }
}