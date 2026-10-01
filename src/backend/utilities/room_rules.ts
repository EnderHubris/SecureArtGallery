import { db } from "../db";
import {
    eq, and, or
} from "drizzle-orm";
import * as schema from "../../../database/schema";
import { FindUserByID, FindUserBySession } from "./user_rules";

export type RoomData = {
    id: number,
    name: string,
    is_restricted: boolean
}

export const lobbyRoom: RoomData = {
    id: 1,
    name: "Lobby",
    is_restricted: false
}

export async function GetAllRooms(): Promise<{
    success: boolean,
    rooms: RoomData[]
}> {
    try {
        const rooms = await db.select().from(schema.rooms);
        return { success: true, rooms: rooms };
    } catch {
        return { success: false, rooms: [] };
    }
}

export async function FindRoomFromID(id: string): Promise<RoomData> {
    try {
        const [room_data] = await db.select().from(schema.rooms)
            .where(eq(
                schema.rooms.id,
                id
        )).limit(1);
        return room_data ?? lobbyRoom;
    } catch {
        return lobbyRoom;
    }
}

export async function FindRoomFromToken(token: string): Promise<RoomData> {
    try {
        console.log("[*] Locating Room from JWT...");

        // using the assumed valid jwt token
        // find the session object and extract the room_id
        // to return the room data
        const [sess_data] = await db.select({ room_id: schema.sessions.room_id })
            .from(schema.sessions)
            .where(eq(
                schema.sessions.token,
                token
            )).limit(1);

        if (!sess_data)
            return lobbyRoom;

        const [room_data] = await db.select().from(schema.rooms)
            .where(eq(
                schema.rooms.id,
                sess_data.room_id
        )).limit(1);
        if (!room_data)
            return lobbyRoom;

        return room_data;
    } catch (e) {
        console.error(`[FIND-ROOM-TOKEN ${new Date().toDateString()}]`, e);
        return lobbyRoom;
    }
}

/**
 * 
 * @param id room id
 * @returns list of adjacent room information
 */
export async function FindAdjacentRooms(id: number): Promise<{ id: number; name: string }[]> {
    try {
        return await db.select({
            id: schema.rooms.id,
            name: schema.rooms.name,
        }).from(schema.room_adjacency)
            .innerJoin(schema.rooms, eq(schema.room_adjacency.adj_id, schema.rooms.id))
            .where(eq(schema.room_adjacency.room_id, id));
    } catch {
        return [];
    }
}

export async function EnterRoom(token: string, dest_id: number): Promise<{ success: boolean, message: string }> {
    try {
        // check if from the session this move is legal
        const [session] = await db.select({
            current_room_id: schema.sessions.room_id
        }).from(schema.sessions)
          .where(eq(schema.sessions.token, token)).limit(1);
        
        if (!session) {
            return {
                success: false,
                message: "Could not enter at this time!"
            }
        }

        const user = await FindUserBySession(token);
        if (!session || !user) {
            console.warn("[!] Session or User not Found during Room Movement")
            return {
                success: false,
                message: "Could not enter at this time!"
            }
        }

        // check if valid adjacent
        const adj_data = await db.select().from(schema.room_adjacency).where(
            and(
                eq(schema.room_adjacency.room_id, session.current_room_id),
                eq(schema.room_adjacency.adj_id, dest_id),
            )
        );
        if (adj_data.length === 0) {
            return {
                success: false,
                message: "Cannot enter a non-adjacent room!"
            }
        }

        // get room information
        const dest_room = await FindRoomFromID(dest_id.toString());

        // check if room requires privilege
        if (dest_room.is_restricted && user.role === "guest") {
            return {
                success: false,
                message: "Cannot enter a Restricted Area!"
            }
        }

        // update session
        await db.update(schema.sessions).set({
            room_id: dest_id
        }).where(eq(schema.sessions.token, token));

        console.log(`[ENTER-ROOM ${new Date().toDateString()}] Session ${token} has moved ${session.current_room_id} -> ${dest_id}`);

        return {
            success: true,
            message: `Now Entering the ${dest_room.name}!`
        }
    } catch (e: any) {
        return {
            success: false,
            message: "Could not enter at this time!"
        }
    }
}