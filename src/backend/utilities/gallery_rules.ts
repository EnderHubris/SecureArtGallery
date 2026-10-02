import { db } from "../db";
import {
    eq, and
} from "drizzle-orm";
import * as schema from "../../../database/schema";

import path from "node:path";
import { UploadImage } from "./general";
export const UPLOAD_DIR = path.join(process.cwd(), "gallery");
console.log("[!] Gallery Image Upload Directory:", UPLOAD_DIR);

export async function UploadGalleryImage(image: Express.Multer.File, jwt: string, room: number) {
    try {
        console.log(`[UPLOAD-CONTENT ${new Date().toDateString()}] User attempting to upload gallery art: ${jwt}`);

        // upload file and store it in the gallery
        const img_str = await UploadImage(image, UPLOAD_DIR);
        await db.insert(schema.galleryImages).values({
            image: img_str,
            room_id: room
        });

        console.log("[+] User Uploaded an Image to the Gallery!");

        return {
            success: true,
            message: "Image Uploaded to Gallery!"
        }
    } catch (e) {
        return {
            success: false,
            message: "Failed to Upload to Gallery!"
        }
    }
}

export async function GetImagesByRoom(room: number) {
    try {
        return await db.select()
            .from(schema.galleryImages)
            .where(
                eq(schema.galleryImages.room_id, room)
            );
    } catch (e) {
        return []
    }
}

export async function ImageInRoom(file_path: string, room: number) {
    try {
        const name = path.basename(file_path);
        
        console.warn(`[!] Checking if ${name} is within room ${room}...`);

        const data = await db.select()
            .from(schema.galleryImages)
            .where(
                and(
                    eq(schema.galleryImages.room_id, room),
                    eq(schema.galleryImages.image, name),
                )
            );

        return data.length > 0;
    } catch (e) {
        false
    }
}
