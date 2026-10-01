import { GetBackendStr } from "./utiliies";

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
    } catch {
        return { success: false, message: "Could not enter at this time!" }
    }
}
