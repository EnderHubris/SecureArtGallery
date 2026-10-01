/**
 * @description These utilities are browser compatible
 */

import { GetBackendStr, str2sha256 } from "./utiliies";

export async function DeleteUser(uid: string): Promise<{
    success: boolean;
    message: string;
}> {
    if (uid.length === 0)
        return { success: false, message: "Error Deleting User!" }

    try {
        const endpoint = GetBackendStr("/admin/delete_user");
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
        return { success: false, message: "Error Deleting User!" }
    }
}

export async function ChangeRole(uid: string, role: string): Promise<{
    success: boolean;
    message: string;
}> {
    if (uid.length === 0)
        return { success: false, message: "Error Updating User's Role!" }
    if (role.length === 0)
        return { success: false, message: "Error Updating User's Role!" }

    try {
        const endpoint = GetBackendStr("/admin/set_role");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "uid": uid,
                "role": role
            }),
        });
        return await response.json();
    } catch {
        return { success: false, message: "Error Updating User's Role!" }
    }
}

export async function CreateNewEmployee({ username, email, password, role }): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const endpoint = GetBackendStr("/admin/create_user");
        const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": username,
                "email": email,
                "password_hash": await str2sha256(password),
                "role": role,
            }),
        });
        return await response.json();
    } catch {
        return { success: false, message: "Error Creating Employee!" }
    }
}
