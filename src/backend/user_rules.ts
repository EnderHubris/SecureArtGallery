import { db } from "./db";
import {
    eq, or
} from "drizzle-orm";
import * as schema from "../../database/schema";

import { CheckPassword, UploadImage } from "./utilities";
import { ClearSessions, GenerateJWT, SESSION_LIFETIME } from "./session_utils";

export async function FindUserBySession(jwt: string|undefined|null):
Promise<
    {
        id: string;
        username: string;
        email: string;
        role: string;
        image: string;
    } | null | undefined
> {
    try {
        if (!jwt) return null;

        const [sess] = await db.select({
            uid: schema.sessions.uid
        }).from(schema.sessions)
        .where(eq(schema.sessions.token, jwt))
        .limit(1);
        if (!sess) return null;

        const [user] = await db.select({
            id: schema.users.id,
            username: schema.users.username,
            email: schema.users.email,
            role: schema.users.role,
            image: schema.users.image,
        }).from(schema.users)
        .where(eq(schema.users.id, sess.uid)).limit(1);

        return user;
    } catch {
        return null;
    }
}

async function FindUser(username: string, email: string = ""):
Promise<
    {
        id: string;
        username: string;
        password_hash: string;
        email: string;
        role: string;
        image: string;
    } | null | undefined
> {
    try {
        const [user] = await db.select({
            id: schema.users.id,
            username: schema.users.username,
            password_hash: schema.users.password_hash,
            email: schema.users.email,
            role: schema.users.role,
            image: schema.users.image,
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

async function CreateSession(jwt: string, uid: string) {
    try {
        await db.insert(schema.sessions).values({
            uid: uid,
            token: jwt
        });
        return true;
    } catch (e) {
        console.error(`[CREAT-SESS ${new Date().toDateString()}]`, e);
        return false;
    }
}

/**
 * return JWT token returned as a cookie
 * 
 * @param username or email
 * @param password_hash 
 */
export async function Login(username: string, password_hash: string) {
    try {
        const user = await FindUser(username, username); // username value can also be an email
        if (!user) {
            return {
                "success": false,
                "message":"Incorrect Username or Password",
                "jwt": ""
            }
        }

        if (user.password_hash !== password_hash) {
            return {
                "success": false,
                "message":"Incorrect Username or Password",
                "jwt": ""
            }
        }

        console.log(`[DB-LOGIN ${new Date().toDateString()}] login successful as ${username}`);

        const token = GenerateJWT(user.id, user.role);
        const sess = await CreateSession(token, user.id);
        if (!sess){
            return {
                "success": false,
                "message":"Failed to Create Session!",
                "jwt": ""
            }
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
    password_hash: string,
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

        // check for malformed password_hash
        const valid_hash = /^[a-fA-F0-9]{64}$/.test(password_hash);
        if (!valid_hash) {
            console.warn(`[!] Invalid hash was sent to server (${new Date().toDateString()})`)
            return {
                "success": false,
                "message":"User Already Exists!"
            }
        }

        // if an image was provided upload and handle it
        const img_str = await UploadImage(image);

        // create a new user entry
        await db.insert(schema.users).values({
            username: username,
            email: email,
            password_hash: password_hash,
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
    n_password_hash: string,
    password_hash: string,
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
        if (!await CheckPassword(user.id, password_hash)) {
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

        // check for malformed password_hash
        if (n_password_hash.length > 0 && password_hash.length > 0) {
            const valid_hash = /^[a-fA-F0-9]{64}$/.test(password_hash);
            const valid_hash2 = /^[a-fA-F0-9]{64}$/.test(n_password_hash);
            if (!valid_hash || !valid_hash2) {
                console.warn(`[!] Invalid hash was sent to server (${new Date().toDateString()}) <-- UPDATE-PROFILE`)
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

        if (n_password_hash && n_password_hash.length > 0)
            n_values.password_hash = n_password_hash;

        if (image) {
            const img_str = await UploadImage(image);
            n_values.image = img_str;
        }

        // clear old session(s) and generate a new one
        if (n_password_hash && n_password_hash.length > 0) {
            if (!await ClearSessions(user.id))
                return { "success": false, "message": "Update Failed!" }

            // apply the JWT to the user's session
            const n_token = GenerateJWT(user.id, user.role);
            const sess = await CreateSession(n_token, user.id);
            if (!sess) {
                return { "success": false, "message": "Update Failed!" }
            }

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