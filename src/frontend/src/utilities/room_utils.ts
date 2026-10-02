/**
 * @description These utilities are browser compatible
 */

import type { RoomData } from "../components/m_types";
import { GetBackendStr } from "./utiliies";

export const lobbyRoom: RoomData = {
    id: 1,
    name: "Lobby",
    is_restricted: false,
    occupancy: 35
}

export async function EnterRoom(room_id: number): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const endpoint = GetBackendStr("/enter_room");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "id": room_id
            }),
        });
        return await response.json();
    } catch (e) {
        console.error("[-] Enter-Room Failed:", e);
        return { success: false, message: "Could not enter at this time!" }
    }
}
