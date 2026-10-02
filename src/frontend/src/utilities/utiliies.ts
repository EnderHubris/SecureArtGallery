/**
 * @description These utilities are browser compatible
 */

import type { RoomData } from "../components/m_types";
import { lobbyRoom } from "./room_utils";

/**
 * By default with no explicit definition
 * this is ran in context of nginx where
 * there us a reverse-proxy of /api -> localhost:8888
 * 
 * @returns 
 */
export function GetBackendStr(dir: string) {
    let base = import.meta.env.VITE_BACK_END_HOST ?? "/api/";
    if (!base.endsWith("/")) base += "/";

    const baseUrl = new URL(base, window.location.origin);
    return new URL(dir.replace(/^\/+/, ""), baseUrl).toString();
}

export async function VerifyLogin(): Promise<boolean> {
    try {
        const endpoint = GetBackendStr("/verify");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
        });
        const result = await response.json();
        return result.success ?? false;
    } catch (e) {
        console.error("[-] User-Verification Failed:", e);
        return false;
    }
}

/**
 * Finds the current room a user is in through their JWT session
 * 
 * @param room_id 
 * @returns 
 */
export async function GetRoomInfo(): Promise<{
    room: RoomData,
    adjacent: { id: number, name: string }[],
    peopleInRoom: number,
}> {
    try {
        const endpoint = GetBackendStr("/get_room");
        const response = await fetch(endpoint, {
            credentials: "include",
        });
        const result = await response.json();
        return result;
    } catch (e) {
        console.error("[-] Fetching Room-Info Failed:", e);
        return {
            room: lobbyRoom,
            adjacent: [],
            peopleInRoom: 1
        }
    }
}