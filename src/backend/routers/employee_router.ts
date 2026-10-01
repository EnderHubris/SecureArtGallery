import { Router, Request, Response, NextFunction } from "express";
import { AccessCheck } from "../utilities/session_utils";
import { GetAllGalleryImages, GetAllUsers, uploadMulter } from "../utilities/general";
import { GetAllRooms } from "../utilities/room_rules";
import { UploadGalleryImage } from "../utilities/gallery_rules";
const router = Router();

/**
 * This is a special permission checker where
 * before continuing with a request in /admin
 * authorization is performed, keeps the code DRY
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const requireEmployee = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const jwt = req.cookies.token;
    if (!jwt || jwt.length === 0 || !AccessCheck(jwt, "employee"))
        return res.status(401).json({ success: false, message: "Access Denied" });
    next();
};
router.use(requireEmployee);

// expands end-point root '/admin'
router.post("/get_users", async (req, res) => {
    try {
        const { page } = req.body;
        console.log("[!] Employee Fetching Users");
        return res.json(await GetAllUsers(Number(page ?? 1)));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.get("/get_rooms", async (req, res) => {
    try {
        console.log("[!] Employee Fetching Rooms");
        return res.json(await GetAllRooms());
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/get_content", async (req, res) => {
    try {
        const { page } = req.body;
        console.log("[!] Employee Fetching Gallery Content");
        return res.json(await GetAllGalleryImages(Number(page ?? 1)));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/upload_content", uploadMulter.single("g_img"), async (req, res) => {
    try {
        const { room } = req.body;
        const image = req.file;
        const jwt = req.cookies.token;

        if (!image || !jwt || !room) {
            console.warn("[!] Missing Required Data for Uploading Gallery Image");
            return {
                success: false,
                message: "Failed to Upload to Gallery!"
            }
        }

        return res.json(
            await UploadGalleryImage(image, jwt, room)
        );
    } catch (e) {
        console.error(`[UPLOAD-CONTENT ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
});

export default router;