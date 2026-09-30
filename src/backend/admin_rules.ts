import { db } from "./db";
import {
    eq, sql
} from "drizzle-orm";
import * as schema from "../../database/schema";
import { FindUser, FindUserBySession } from "./user_rules";
import { password } from "bun";

const roleMap: Record<string, number> = {
    guest: 0,
    employee: 1,
    admin: 2
}

export async function GetAllUsers(page: number) {
    // keep page positive
    if (page < 1) page = 1;

    try {
        const users = await db.select({
            id: schema.users.id,
            username: schema.users.username,
            email: schema.users.email,
            role: schema.users.role,
            image: schema.users.image,
        }).from(schema.users)
        .orderBy(
            sql`CASE
                WHEN ${schema.users.role} = 'guest' THEN 0
                WHEN ${schema.users.role} = 'employee' THEN 1
                WHEN ${schema.users.role} = 'admin' THEN 2
                ELSE 99
            END`
        ).limit(16).offset(16 * (page-1));

        return { success: true, users: users }
    } catch {
        return { success: false, users: [] }
    }
}

export async function DeleteUser(token:string, uid: string) {
    try {
        // prevent self-deletion
        const user = await FindUserBySession(token);
        if (!user)
            return { success: false, message: "Failed to Delete User!" }

        if (user.id === uid)
            return { success: false, message: "Cannot Self-Delete!" }

        await db.delete(schema.users)
            .where(eq(schema.users.id, uid));

        return { success: true, message: "Deleted User Successfully!" }
    } catch {
        return { success: false, message: "Failed to Delete User!" }
    }
}

export async function ChangeRole(token: string, uid: string, role: string) {
    try {
        // ensure role is valid
        if (!roleMap[role])
            return { success: false, message: "Error Updating User's Role!" }

        // prevent self-modification
        const user = await FindUserBySession(token);
        if (!user)
        return { success: false, message: "Error Updating User's Role!" }

        if (user.id === uid)
            return { success: false, message: "Cannot Self-Modify!" }

        await db.update(schema.users).set({
            role: role
        })
        .where(eq(schema.users.id, uid));

        return { success: true, message: "Role Updated!" }
    } catch {
        return { success: false, message: "Error Updating User's Role!" }
    }
}

export async function CreateNewEmployee(
    username: string,
    email: string,
    password_hash: string,
    role: string
) {
    try {
        // check for invalid role
        if (role !== "employee" && role !== "admin") {
            return { success: false, message: "Error Creating New User!" }
        }

        // check if username or email are taken
        const existingUser = await FindUser(username, email);
        if (existingUser) {
            return { success: false, message: "Username or Email already taken!" }
        }

        await db.insert(schema.users).values({
            username: username,
            email: email,
            password_hash: password_hash, 
            role: role
        });

        console.log("[+] Admin Created New User:", username, email, role);

        return { success: true, message: "Created New User!" }
    } catch {
        return { success: false, message: "Error Creating New User!" }
    }
}
