import { db } from "../db";
import {
    eq, and
} from "drizzle-orm";
import * as schema from "../../../database/schema";

import path from "node:path";
import { unlink } from "node:fs/promises";

import { UploadImage } from "./general";
export const UPLOAD_DIR = path.join(process.cwd(), "gallery");
console.log("[!] Gallery Image Upload Directory:", UPLOAD_DIR);

export async function UploadGalleryImage(image: Express.Multer.File, jwt: string, room: number) {
    try {
        console.log(`[UPLOAD-CONTENT ${new Date().toDateString()}] User attempting to upload gallery art: ${jwt}`);

        // upload file and store it in the gallery
        const { success, filename } = await UploadImage(image, UPLOAD_DIR);
        if (!success) {
            return {
                success: false,
                message: "Failed to Upload to Gallery!"
            }
        }

        await db.insert(schema.galleryImages).values({
            image: filename,
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
            .where(and(
                eq(schema.galleryImages.room_id, room),
                eq(schema.galleryImages.visible, true)
            ));
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
                    eq(schema.galleryImages.visible, true),
                )
            );

        return data.length > 0;
    } catch (e) {
        false
    }
}

export async function UploadToGallary(req, res) {
    try {
        const { room } = req.body;
        const images = (req.files as Express.Multer.File[] | undefined) ?? [];
        const jwt = req.cookies.token;

        if (images.length === 0 || !jwt || !room) {
            console.warn("[!] Missing Required Data for Uploading Gallery Images");
            return res.status(400).json({
                success: false,
                message: "Failed to Upload to Gallery!"
            });
        }

        // Sequential so one failure doesn't race the others and order is preserved
        const failed: string[] = [];
        for (const image of images) {
            const result = await UploadGalleryImage(image, jwt, room);
            if (!result.success) failed.push(image.originalname);
        }

        if (failed.length === 0) {
            return res.json({
                success: true,
                message: `Uploaded ${images.length} image${images.length > 1 ? "s" : ""} to the gallery!`
            });
        }

        return res.status(failed.length === images.length ? 400 : 207).json({
            success: false,
            message: `${images.length - failed.length} of ${images.length} uploaded. Failed: ${failed.join(", ")}`
        });
    } catch (e) {
        console.error(`[UPLOAD-TO-GALLARY ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
}

export async function DeleteGallaryImage(id: string) {
    const [deleted] = await db.delete(schema.galleryImages)
        .where(eq(schema.galleryImages.id, id))
        .returning({ image: schema.galleryImages.image });

    if (!deleted) {
        return { success: false, message: "Image not found" };
    }

    const filePath = path.resolve(UPLOAD_DIR, path.basename(deleted.image));
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
        console.error("[GALLERY-DELETE] Malformed Path:", deleted.image);
    } else {
        try {
            await unlink(filePath);
            console.log(`[*] Deleted: ${deleted.image}`);
        } catch (err: any) {
            if (err.code !== "ENOENT")
                console.error("[GALLERY-DELETE] unlink failed:", err);
        }
    }
    
    return { success: true, message: "Image deleted!" };
}

export async function UpdateVisibility(id: string, val: boolean) {
    const result = await db.update(schema.galleryImages).set({
        visible: val
    }).where(eq(schema.galleryImages.id, id))
        .returning({ id: schema.galleryImages.id });

    return {
        success: result.length > 0,
        message: (result.length > 0) ? "Updated Image Visibility" : "Failed to Update Visibility"
    }
}

export async function MoveImage(id: string, roomId: string) {
    // check if roomId exists
    const [roomData] = await db.select()
        .from(schema.rooms)
        .where(
            eq(schema.rooms.id, roomId)
        );

    if (!roomData) return { success: false, message: "Room does not Exist!" }

    await db.update(schema.galleryImages).set({
        room_id: roomId
    }).where(eq(schema.galleryImages.id, id));
    
    return { success: true, message: "Image moved!" }
}
