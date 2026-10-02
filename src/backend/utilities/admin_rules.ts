import { db } from "../db";
import {
    eq, sql
} from "drizzle-orm";
import * as schema from "../../../database/schema";
import { DeleteSession, FindUser, FindUserByID, FindUserBySession } from "./user_rules";
import { str2sha256 } from "./general";

export const roleMap: Record<string, number> = {
    guest: 0,
    employee: 1,
    admin: 2
}

export async function DeleteUser(token:string, uid: string) {
    try {
        // prevent self-deletion
        const user = await FindUserBySession(token);
        if (!user)
            return { success: false, message: "Failed to Delete User!" }

        if (user.id === uid)
            return { success: false, message: "Cannot Self-Delete!" }

        const delTarget = await FindUserByID(uid);
        if (delTarget && delTarget.sudo)
            return { success: false, message: "Cannot Delete Super Admin!" }

        await db.delete(schema.users)
            .where(eq(schema.users.id, uid));

        return { success: true, message: "Deleted User Successfully!" }
    } catch {
        return { success: false, message: "Failed to Delete User!" }
    }
}

export async function HandleUserBan(token:string, uid: string, banned: boolean = true) {
    try {
        // prevent self-banning
        const user = await FindUserBySession(token);
        if (!user)
            return { success: false, message: `Failed to ${banned ? "Ban" : "Unban"} User!` }

        if (user.id === uid)
            return { success: false, message: `Cannot Self-${banned ? "Ban" : "Unban"}!` }

        // check for existance
        const delTarget = await FindUserByID(uid);
        if (!delTarget)
            return { success: false, message: `Failed to ${banned ? "Ban" : "Unban"} User!` }
        
        // check for super-user
        if (delTarget && delTarget.sudo)
            return { success: false, message: `Cannot ${banned ? "Ban" : "Unban"} Super Admin!` }

        // clear session if banned
        if (banned) {
            const [session] = await db.select({
                token: schema.sessions.token
            }).from(schema.sessions).where(
                eq(schema.sessions.uid, delTarget.id)
            );
            
            if (session)
                await DeleteSession(session.token);
        }

        // flag account as banned
        await db.update(schema.users)
            .set({
                banned: banned,
            })
            .where(eq(schema.users.id, uid));

        return { success: true, message: `${banned ? "Banned" : "Unbanned"} User Successfully!` }
    } catch {
        return { success: false, message: `Failed to ${banned ? "Ban" : "Unban"} User!` }
    }
}

export async function ChangeRole(token: string, uid: string, role: string) {
    try {
        console.warn("[!] UID:", uid, "subject to role update ->", role);

        // ensure role is valid
        const role_resolve = roleMap[role];
        if (role_resolve === undefined)
            return { success: false, message: "Invalid role value!" }

        // prevent self-modification
        const user = await FindUserBySession(token);
        if (!user)
            return { success: false, message: "Error Updating User's Role!" }

        if (user.id === uid)
            return { success: false, message: "Cannot Self-Modify!" }

        const targetUser = await FindUserByID(uid);
        if (!targetUser)
            return { success: false, message: "User not Found!" }

        await db.update(schema.users).set({
            role: role
        })
        .where(eq(schema.users.id, uid));

        console.log(`[+] ${targetUser.username}'s role changed: ${targetUser.role} -> ${role}`);

        return { success: true, message: "Role Updated!" }
    } catch {
        return { success: false, message: "Error Updating User's Role!" }
    }
}

export async function CreateNewEmployee(
    username: string,
    email: string,
    password: string,
    role: string
) {
    try {
        // check for invalid role
        const role_resolve = roleMap[role];
        if (role_resolve === undefined || role_resolve === 0)
            return { success: false, message: "Invalid role value!" }

        // check if username or email are taken
        const existingUser = await FindUser(username, email);
        if (existingUser) {
            return { success: false, message: "Username or Email already taken!" }
        }

        await db.insert(schema.users).values({
            username: username,
            email: email,
            password_hash: str2sha256(password), 
            role: role
        });

        console.log("[+] Admin Created New User:", username, email, role);

        return { success: true, message: "Created New User!" }
    } catch {
        return { success: false, message: "Error Creating New User!" }
    }
}
