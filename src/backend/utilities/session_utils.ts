import { db } from "../db";
import {
    eq
} from "drizzle-orm";
import * as schema from "../../../database/schema";

import crypto from 'node:crypto';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const SESSION_LIFETIME = Number(process.env.SESSION_LIFETIME_DAYS ?? 7) * MS_PER_DAY;

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.error("[-] Missing JWT Secret Value!")

export async function DecodeToken(token: string): Promise<{
    uid: string,
    alt: string,
    role: string
}|null|undefined>{
    try {
        const payload = jwt.verify(
            token,
            JWT_SECRET
        );
        return payload;
    } catch {
        return undefined;
    }
}

async function IsExpired(token: string) {
    try {
        const [session] = await db.select({
            expr_date: schema.sessions.expires_at
        }).from(schema.sessions)
        .where(eq(schema.sessions.token, token)).limit(1);

        if (!session) return true;
        const isExpired = new Date() >= session.expr_date;

        // remove expired token
        if (isExpired) {
            console.warn(`[IS-EXPIRED ${new Date().toDateString()}] - JWT provided is expired!`)
            await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
        }

        return isExpired;
    } catch (e: any) {
        console.error(`[IS-EXPIRED ${new Date().toDateString()}]`, e)
        return true;
    }
}

export function GenerateJWT(uid: string, role: string): string {
    if (!JWT_SECRET) console.error("[-] Missing JWT Secret Value!");
    const days = Number(process.env.SESSION_LIFETIME_DAYS ?? 7)
    return jwt.sign(
        {
            uid: uid,
            alt: crypto.randomBytes(16).toString('hex'),
            role: role
        },
        JWT_SECRET,
        {
            expiresIn: `${days}d`,
        }
    );
}

/**
 * Check if JWT token is valid and in the database
 * 
 * @param token 
 * @returns 
 */
export async function CheckSession(token: string) {
    try {
        // if invalid this throws an error
        const payload = jwt.verify(
            token,
            JWT_SECRET
        );

        return !await IsExpired(token);
    } catch (e: any) {
        console.error(`[CHECK-SESSION ${new Date().toDateString()}]`, e)
        return false;
    }
}

/**
 * Return if the owner of a provided JWT is allowed
 * to access a resource (reviews the JWT as well)
 * 
 * @param token 
 * @param role_required guest | employee | admin
 * @returns 
 */
export function AccessCheck(token: string, role_required: string) {
    const roleMap: Record<string, number> = {
        guest: 0,
        employee: 1,
        admin: 2
    }

    try {
        if (!CheckSession(token)) return false;

        const payload = jwt.verify(
            token,
            JWT_SECRET
        );

        const a = roleMap[payload.role.toLowerCase()]  ?? 0; // assume user is a guest
        const b = roleMap[role_required.toLowerCase()] ?? 2; // assume user must be an admin to view content

        console.log(`[!] Checking Access-Role: '${payload.role}' : '${role_required}'`);

        return a >= b;
    } catch (e: any) {
        console.error(`[ACCESS-CHECK ${new Date().toDateString()}]`, e)
        return false;
    }
}

export async function ClearSessions(uid: string) {
    try {
        await db.delete(schema.sessions)
            .where(eq(schema.sessions.uid, uid));
        return true;
    } catch (e) {
        console.error(`[CLEAR-SESSIONS ${new Date().toDateString()}]`, e)
        return false;
    }
}

/**
 * Fetch session information from a given JWT
 * 
 * @param token 
 * @returns 
 */
export async function GetSession(token: string): Promise<{
    id: number,
    uid: number,
    token: string,
    room_id: number
}|null|undefined> {
    try {
        const [session] = await db.select({
            id: schema.sessions.id,
            uid: schema.sessions.uid,
            token: schema.sessions.token,
            room_id: schema.sessions.room_id,
        }).from(schema.sessions)
            .where(eq(schema.sessions.token, token))
            .limit(1);
        return session;
    } catch {
        return undefined
    }
}

async function CreateSession(jwt: string, uid: string) {
    try {
        await db.insert(schema.sessions).values({
            uid: uid,
            token: jwt,
            room_id: 1, // LOBBY ID
        });
        return true;
    } catch (e) {
        console.error(`[CREAT-SESS ${new Date().toDateString()}]`, e);
        return false;
    }
}

/**
 * During login process locates a valid JWT session in the DB
 * if one is not found a new one is generated, if one is found
 * check the expiration and handle accordingly
 * 
 * @param user user data
 */
export async function FindSession(user: {
    id: string;
    username: string;
    password_hash: string;
    email: string;
    role: string;
    image: string;
    sudo: boolean;
}): Promise<string> {
    try {
        // find session from UID
        const [session] = await db.select({
            token: schema.sessions.token
        }).from(schema.sessions).where(
            eq(schema.sessions.uid, user.id)
        );

        const make_session = async (user: {
            id: string;
            username: string;
            password_hash: string;
            email: string;
            role: string;
            image: string;
            sudo: boolean;
        }) => {
            const token = GenerateJWT(user.id, user.role);
            const n_sess = await CreateSession(token, user.id);
            return n_sess ? token : "";
        }

        if (!session) {
            // no session found
            return await make_session(user);
        } else {
            // existing session found
            const is_valid = await CheckSession(session.token);
            return is_valid ? session.token : await make_session(user);
        }

    } catch (e: any) {
        return "";
    }
}
