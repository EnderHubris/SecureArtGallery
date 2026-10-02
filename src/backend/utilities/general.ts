import { db } from "../db";
import {
    eq, or, sql
} from "drizzle-orm";
import * as schema from "../../../database/schema";

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export function str2sha256(value: string) {
    return createHash("sha256")
        .update(value)
        .digest("hex");
}
function str2md5(value: string): string {
    const hasher = new Bun.CryptoHasher("md5");
    hasher.update(value);

    return hasher.digest("hex");
}

// component shared by server and some routes
import multer from "multer";
import { CheckSession, FindSession } from "./session_utils";
import { DeleteSession, FindUserByID, FindUserBySession } from "./user_rules";
import { roleMap } from "./admin_rules";
import { UserDataSelect, type UserData } from "./m_types";
export const uploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});

export async function TestSession(jwt: string, res) {
    const token_valid = await CheckSession(jwt);
    
    if (!token_valid) {
        res.clearCookie("token", {
            httpOnly: true, // prevent cookie stealing
            secure: process.env.PROD === "production",
            sameSite: "lax",
            path: "/",
        });
        
        return false;
    }
    return true
}

const validTypes = ["image/png", "image/jpeg"];
const validExtensions = ["png", "jpg", "jpeg"];
function getExtension(filename: string): string {
    console.log("[*] Parsing Filename:", filename);

    const lastDot = filename.lastIndexOf(".");

    if (lastDot <= 0) {
        return "";
    }

    return filename.slice(lastDot + 1);
}

/**
 * Takes a given file and a desired save-as name
 * and writes the file onto disk in the uploads dir
 * 
 * @param file 
 * @param name 
 * @returns successful|failed write
 */
async function writeFile(file: Express.Multer.File, name: string, UPLOAD_DIR: string): Promise<boolean> {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        const filePath = path.join(UPLOAD_DIR, name);
        await Bun.write(filePath, file.buffer);

        console.log(`[!] Created ${filePath}`);
        return true;
    } catch (e) {
        console.error("[-] Write-File", e);
        return false;
    }
}

export async function UploadImage(image: Express.Multer.File|undefined|null, UPLOAD_DIR: string) {
    if (!image) return "guest.png"

    // convert name into md5 and preserve ext (png, jpg)
    const ext = getExtension(image.originalname);
    const n_file_name = str2md5(image.originalname) + "." + ext;

    if (!validTypes.includes(image.mimetype)) // check mime type
        return "guest.png"
    if (!validExtensions.includes(getExtension(n_file_name))) // check file ext
        return "guest.png"

    // upload file to uploads directory
    if (!await writeFile(image, n_file_name, UPLOAD_DIR))
        return "guest.png"
        
    return n_file_name;
}

/**
 * Check if a provided password matches
 * to the user with a given UID
 * 
 * @param uid 
 * @param password
 * @returns 
 */
export async function CheckPassword(uid: string, password: string) {
    if (uid.length === 0 || password.length === 0) return false;
    const password_hash = str2sha256(password);

    try {
        const [user] = await db.select({
            password_hash: schema.users.password_hash
        }).from(schema.users)
        .where(eq(schema.users.id, uid)).limit(1);
        if (!user) return false;

        return user.password_hash === password_hash;
    } catch (e: any) {
        console.error(`[CHECK-PASSWD ${new Date().toDateString()}]`, e)
        return false;
    }
}

export async function GetAllUsers(page: number): Promise<{
    success: boolean,
    users: UserData[]
}> {
    // keep page positive
    if (page < 1) page = 1;

    try {
        const users = await db.select(UserDataSelect).from(schema.users)
        .orderBy(
            sql`CASE
                WHEN ${schema.users.role} = 'guest' THEN 0
                WHEN ${schema.users.role} = 'employee' THEN 1
                WHEN ${schema.users.role} = 'admin' THEN 2
                ELSE 99
            END`
        ).limit(16).offset(16 * (page-1));

        return { success: true, users: users }
    } catch (e) {
        console.error(`[GET-ALL-USERS ${new Date().toDateString()}]`, e);
        return { success: false, users: [] }
    }
}

export async function GetAllGalleryImages(page: number): Promise<{
    success: boolean, 
    content: {
        id: string,
        image: string,
        room_id: number
    }[]
}> {
    // keep page positive
    if (page < 1) page = 1;

    try {
        const content = await db.select()
            .from(schema.galleryImages)
            .limit(16).offset(16 * (page-1));

        return { success: true, content: content }
    } catch (e) {
        console.error(`[GET-ALL-CONTENT ${new Date().toDateString()}]`, e);
        return { success: false, content: [] }
    }
}

export async function KickUser(token: string, uid: string) {
    try {
        // prevent self-deletion
        const user = await FindUserBySession(token);
        if (!user)
            return { success: false, message: "Failed to Kick User!" }

        if (user.id === uid)
            return { success: false, message: "Cannot Self-Kick!" }

        const delTarget = await FindUserByID(uid);
        if (!delTarget)
            return { success: false, message: "Failed to Kick User!" }

        // employee cannot kick admins and admins can kick everyone
        const a = roleMap[delTarget.role];
        const b = roleMap[user.role];
        if (a === undefined || b === undefined) {
            console.warn("[!] Extracted Undefined Roles:", a, b);
            return { success: false, message: "Failed to Kick User!" }
        }

        if (a > b) {
            return { success: false, message: "Cannot Kick Higher Authority!" }
        }

        if (delTarget && delTarget.sudo)
            return { success: false, message: "Cannot Kick Super Admin!" }

        const [delTargetSession] = await db.select({
            token: schema.sessions.token
        }).from(schema.sessions)
        .where(eq(schema.sessions.uid, uid));

        console.log(delTargetSession)

        if (!delTargetSession) {
            console.warn("[!] Target has no active session!")
            return { success: false, message: "User may already have been kicked!" }
        }

        const kicked = await DeleteSession(delTargetSession.token);

        return {
            success: kicked,
            message: kicked ? "Kicked User Successfully!" : "Failed to Kick User!"
        }
    } catch {
        return { success: false, message: "Failed to Kick User!" }
    }
}
