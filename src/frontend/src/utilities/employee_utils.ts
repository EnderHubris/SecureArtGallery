/**
 * @description These utilities are browser compatible
 */

import { GetBackendStr } from "./utiliies";

export async function KickUser(role: string, uid: string): Promise<{
    success: boolean;
    message: string;
}> {
    if (uid.length === 0)
        return { success: false, message: "Error Kicking User!" }

    try {
        const endpoint = GetBackendStr(`/${role}/kick_user`);
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "uid": uid
            }),
        });
        return await response.json();
    } catch {
        return { success: false, message: "Error Kicking User!" }
    }
}
