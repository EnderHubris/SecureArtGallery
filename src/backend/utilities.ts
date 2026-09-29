import { db } from "./db";
import {
    eq, or
} from "drizzle-orm";
import * as schema from "../../database/schema";

import { mkdir } from "node:fs/promises";
import path from "node:path";

// component shared by server and some routes
import multer from "multer";
import { password } from "bun";
export const uploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
console.log("[!] Upload Directory:", UPLOAD_DIR);

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

function str2md5(value: string): string {
    const hasher = new Bun.CryptoHasher("md5");
    hasher.update(value);

    return hasher.digest("hex");
}

/**
 * Takes a given file and a desired save-as name
 * and writes the file onto disk in the uploads dir
 * 
 * @param file 
 * @param name 
 * @returns successful|failed write
 */
async function writeFile(file: Express.Multer.File, name: string): Promise<boolean> {
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

export async function UploadImage(image: Express.Multer.File|undefined|null) {
    if (!image) return "guest.png"

    // convert name into md5 and preserve ext (png, jpg)
    const ext = getExtension(image.originalname);
    const n_file_name = str2md5(image.originalname) + "." + ext;

    if (!validTypes.includes(image.mimetype)) // check mime type
        return "guest.png"
    if (!validExtensions.includes(getExtension(n_file_name))) // check file ext
        return "guest.png"

    // upload file to uploads directory
    if (!await writeFile(image, n_file_name))
        return "guest.png"
        
    return n_file_name;
}

/**
 * Check if a provided password hash matches
 * to the user with a given UID
 * 
 * @param uid 
 * @param password_hash 
 * @returns 
 */
export async function CheckPassword(uid: string, password_hash: string) {
    const valid_hash = /^[a-fA-F0-9]{64}$/.test(password_hash)
    if (uid.length === 0 || password_hash.length === 0) return false;
    if (!valid_hash) return false;

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