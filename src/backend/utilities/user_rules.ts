import { db } from "../db";
import {
    eq, or
} from "drizzle-orm";
import * as schema from "../../../database/schema";

import { CheckPassword, str2sha256, UploadImage } from "./general";
import { ClearSessions, FindSession, GenerateJWT, SESSION_LIFETIME } from "./session_utils";

import path from "node:path";
import type { UserData } from "./m_types";
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
console.log("[!] Profile Image Upload Directory:", UPLOAD_DIR);

// reusable user data select payload
const UserDataSelect = {
    id: schema.users.id,
    username: schema.users.username,
    email: schema.users.email,
    role: schema.users.role,
    image: schema.users.image,
    banned: schema.users.banned,
    sudo: schema.users.sudo,
}

export async function FindUserByID(uid: string):
Promise< UserData | null | undefined > {
    try {
        const [user] = await db.select(UserDataSelect)
            .from(schema.users)
            .where(eq(schema.users.id, uid)).limit(1);

        return user;
    } catch {
        return null;
    }
}

export async function FindUserBySession(jwt: string|undefined|null):
Promise< UserData | null | undefined > {
    try {
        if (!jwt) return null;

        const [sess] = await db.select({
            uid: schema.sessions.uid
        }).from(schema.sessions)
        .where(eq(schema.sessions.token, jwt))
        .limit(1);
        if (!sess) return null;

        const [user] = await db.select(UserDataSelect)
            .from(schema.users)
            .where(eq(schema.users.id, sess.uid)).limit(1);

        return user;
    } catch {
        return null;
    }
}

/**
 * 
 * @param username 
 * @param email (can be the same value as username)
 * @returns User Data Blob containing identifiable information
 * including **password_hash**
 */
export async function FindUser(username: string, email: string = ""):
Promise< {
    id: string,
    username: string,
    email: string,
    password_hash: string,
    role: string,
    image: string,
    banned: boolean,
    sudo: boolean,
} | null | undefined > {
    try {
        const [user] = await db.select({ 
            id: schema.users.id,
            username: schema.users.username,
            email: schema.users.email,
            password_hash: schema.users.password_hash,
            role: schema.users.role,
            image: schema.users.image,
            banned: schema.users.banned,
            sudo: schema.users.sudo,
        }).from(schema.users)
            .where(or(
                eq(schema.users.username, username),
                eq(schema.users.email, email)
            )).limit(1);
        return user;
    } catch {
        return null;
    }
}

export async function DeleteSession(jwt: string|undefined|null) {
    try {
        if (!jwt) return false;
        console.log("[*] Attempting to delete session:", jwt);

        const result = await db.delete(schema.sessions)
                        .where(eq(schema.sessions.token, jwt));

        const removed = (result.rowCount ?? 0) > 0;
        console.log("[*] Session Deletion:", result ? "successful" : "failed");

        return removed;
    } catch (e) {
        console.error(`[DELETE-SESSION ${new Date().toDateString()}]`, e);
        return false;
    }
}

/**
 * return JWT token returned as a cookie
 * 
 * @param username or email
 * @param password 
 */
export async function Login(username: string, password: string) {
    try {
        // test for existance
        const user = await FindUser(username, username); // username value can also be an email
        if (!user) {
            return {
                "success": false,
                "message":"Incorrect Username or Password",
                "jwt": ""
            }
        }

        // check if the user is banned
        if (user.banned) {
            console.warn(`[DB-LOGIN ${new Date().toDateString()}] Banned User Login Attempt -> ${username}`);
            return {
                "success": false,
                "message":"Account is Banned!",
                "jwt": ""
            }
        }

        // check password_hash
        if (user.password_hash !== str2sha256(password)) {
            console.warn(`[DB-LOGIN ${new Date().toDateString()}] authentication failed as ${username}`);
            return {
                "success": false,
                "message":"Incorrect Username or Password",
                "jwt": ""
            }
        }
        console.log(`[DB-LOGIN ${new Date().toDateString()}] authentication successful as ${username}`);
        
        // Find active session or make a new session
        const token = await FindSession(user);
        if (token.length > 0) {
            console.log(`[DB-LOGIN ${new Date().toDateString()}] fully loggin in as ${username}`);
        }

        return {
            "success": true,
            "message":"Login Successful!",
            "jwt": token
        }
    } catch (e: any) {
        console.error(`[DB-LOGIN ${new Date().toDateString()}]`, e);
        return {
            "success": false,
            "message":"Login Failed!",
            "jwt": ""
        }
    }
}

export async function Register(
    username: string,
    email: string,
    password: string,
    image: Express.Multer.File|null|undefined
) {
    try {
        // check if user already exists
        const user = await FindUser(username, email);
        if (user) {
            return {
                "success": false,
                "message":"User Already Exists!"
            }
        }

        // if an image was provided upload and handle it
        const img_str = await UploadImage(image, UPLOAD_DIR);

        // create a new user entry
        await db.insert(schema.users).values({
            username: username,
            email: email,
            password_hash: str2sha256(password),
            image: img_str
        })

        return { "success": true, "message": "Registered Successfully!" }
    } catch (e: any) {
        console.error(`[DB-LOGIN ${new Date().toDateString()}]`, e);
        return { "success": false, "message": "Registered Failed!" }
    }
}

export async function UpdateProfile(
    username: string,
    email: string,
    n_password: string,
    password: string,
    image: Express.Multer.File|null|undefined,
    jwt: string|null|undefined,
    res: any
) {
    try {
        const user = await FindUserBySession(jwt);
        if (!user) {
            return {
                "success": false,
                "message":"Invalid Session!"
            }
        }

        // check if the provided hash matches the current user's
        if (!await CheckPassword(user.id, password)) {
            return { "success": false, "message": "Update Failed!" }
        }

        // check if new username or new email is taken
        if (username.length > 0 || email.length > 0) {
            const existingUser = await FindUser(username, email);
            if (existingUser) {
                return {
                    "success": false,
                    "message":"Username or Email is taken!"
                }
            }
        }

        // finalize update value sets
        let n_values: Record<string, unknown> = {};

        if (username && username.length > 0)
            n_values.username = username;

        if (email && email.length > 0)
            n_values.email = email;

        if (n_password && n_password.length > 0)
            n_values.password_hash = str2sha256(n_password);

        if (image) {
            const img_str = await UploadImage(image, UPLOAD_DIR);
            n_values.image = img_str;
        }

        // clear old session(s) and generate a new one
        if (n_password && n_password.length > 0) {
            if (!await ClearSessions(user.id))
                return { "success": false, "message": "Update Failed!" }

            // apply the JWT to the user's session
            const n_token = await FindSession(user);

            res.cookie("token", n_token, {
                httpOnly: true, // prevent cookie stealing
                secure: process.env.PROD === "production",
                sameSite: "lax",
                maxAge: SESSION_LIFETIME,
            });
        }

        // update entry values based on uid linked to session (JWT)
        const profileRes = await db.update(schema.users)
            .set(n_values)
            .where(eq(schema.users.id, user.id));

        return { "success": true, "message": "Updated Successfully!" }
    } catch (e: any) {
        console.error(`[UPDATE-PROFILE ${new Date().toDateString()}]`, e);
        return { "success": false, "message": "Update Failed!" }
    }
}