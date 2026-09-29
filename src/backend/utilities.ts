import { mkdir } from "node:fs/promises";
import path from "node:path";

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